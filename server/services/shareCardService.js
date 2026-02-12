import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import prisma from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
const UPLOAD_DIR = path.join(__dirname, '../../uploads/share-cards');

/**
 * Generate a share card by calling the Python rendering service
 */
export async function generateShareCard({ workoutId, cardType, format, options, userId, teamId }) {
  // Generate short share ID
  const { nanoid } = await import('nanoid');
  const shareId = nanoid(10);

  // Ensure upload directory exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Fetch workout data if workoutId provided
  let workoutData = {};
  let athleteName = null;
  if (workoutId) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        splits: { orderBy: { splitNumber: 'asc' } },
        telemetry: true,
        athlete: true,
      },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    workoutData = serializeWorkoutForPython(workout);
    athleteName = workout.athlete
      ? `${workout.athlete.firstName} ${workout.athlete.lastName}`
      : null;
  }

  // Fetch team data for branding (if teamId provided)
  let teamBranding = {};
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true, settings: true },
    });

    if (team) {
      teamBranding = {
        teamName: team.name,
        teamColor: team.settings?.brandColor || '#3B82F6',
        teamLogo: team.settings?.logoUrl || null,
      };
    }
  }

  // Fetch user data for personal branding
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, settings: true },
  });

  const userBranding = {
    userName: user?.name || 'Athlete',
    userAvatar: user?.settings?.avatar || null,
  };

  // Define file paths
  const filename = `${shareId}.png`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const url = `/uploads/share-cards/${filename}`;

  // Call Python rendering service
  try {
    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/generate`,
      {
        cardType,
        format,
        workoutData,
        options,
        branding: { ...teamBranding, ...userBranding },
      },
      {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout for rendering
      }
    );

    // Save PNG file
    await fs.writeFile(filepath, response.data);
  } catch (error) {
    console.error('Share card generation failed:', error.message);
    throw new Error(
      error.response?.data?.error || 'Failed to generate share card. Please try again.'
    );
  }

  // Generate title and description for OG tags
  const { title, description } = generateMetadata(cardType, workoutData, athleteName);

  // Calculate expiration (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Store in database
  const shareCard = await prisma.shareCard.create({
    data: {
      id: shareId,
      workoutId: workoutId || null,
      userId,
      teamId: teamId || null,
      cardType,
      format,
      filepath,
      url,
      options,
      title,
      description,
      athleteName,
      version: 1,
      expiresAt,
    },
  });

  return {
    shareId: shareCard.id,
    url: shareCard.url,
    publicUrl: `/share/${shareCard.id}`,
  };
}

/**
 * Get share card metadata for public pages
 */
export async function getShareCard(shareId) {
  const shareCard = await prisma.shareCard.findUnique({
    where: { id: shareId },
  });

  if (!shareCard) {
    throw new Error('Share card not found');
  }

  // Check if expired
  if (new Date() > shareCard.expiresAt) {
    throw new Error('Share card has expired');
  }

  return shareCard;
}

/**
 * Delete a share card (verify ownership)
 */
export async function deleteShareCard(shareId, userId) {
  const shareCard = await prisma.shareCard.findUnique({
    where: { id: shareId },
  });

  if (!shareCard) {
    throw new Error('Share card not found');
  }

  // Verify ownership
  if (shareCard.userId !== userId) {
    throw new Error('Unauthorized: You do not own this share card');
  }

  // Delete file
  try {
    await fs.unlink(shareCard.filepath);
  } catch (error) {
    console.error('Failed to delete share card file:', error.message);
    // Continue with DB deletion even if file deletion fails
  }

  // Delete database record
  await prisma.shareCard.delete({
    where: { id: shareId },
  });

  return { success: true };
}

/**
 * Clean up expired share cards (for cron job)
 */
export async function cleanupExpiredCards() {
  const expiredCards = await prisma.shareCard.findMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  let deletedCount = 0;
  let failedCount = 0;

  for (const card of expiredCards) {
    try {
      // Delete file
      await fs.unlink(card.filepath);

      // Delete database record
      await prisma.shareCard.delete({
        where: { id: card.id },
      });

      deletedCount++;
    } catch (error) {
      console.error(`Failed to cleanup share card ${card.id}:`, error.message);
      failedCount++;
    }
  }

  return { deletedCount, failedCount };
}

/**
 * Format tenths-of-seconds pace to MM:SS.T string
 */
function formatPaceTenths(tenths) {
  if (!tenths) return null;
  const totalSeconds = tenths / 10;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

/**
 * Format seconds to HH:MM:SS.T or MM:SS.T string
 */
function formatDuration(seconds) {
  if (!seconds) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${secs.toFixed(1).padStart(4, '0')}`;
  }
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
}

/**
 * Convert Prisma workout to Python-friendly JSON.
 * Includes both raw numeric values and pre-formatted display strings.
 */
function serializeWorkoutForPython(workout) {
  const avgPaceTenths = workout.avgPace ? parseFloat(workout.avgPace) : null;
  const durationSec = workout.durationSeconds ? parseFloat(workout.durationSeconds) : null;
  const rawData = workout.rawData || {};

  return {
    id: workout.id,
    date: workout.date.toISOString(),
    distanceM: workout.distanceM,
    durationSeconds: durationSec,
    avgPaceTenths: avgPaceTenths,
    avgWatts: workout.avgWatts,
    avgHeartRate: workout.avgHeartRate,
    strokeRate: workout.strokeRate,
    calories: workout.calories,
    dragFactor: workout.dragFactor,
    machineType: workout.machineType,
    // Workout classification from C2 API
    workoutType: rawData.workout_type || null,
    rawMachineType: rawData.type || null,
    source: workout.source,
    // Pre-formatted display strings for the renderer
    formatted: {
      totalTime: formatDuration(durationSec),
      avgPace: formatPaceTenths(avgPaceTenths),
      distance: workout.distanceM ? `${workout.distanceM.toLocaleString()}m` : null,
    },
    splits:
      workout.splits?.map((split) => {
        const splitPaceTenths = split.pace ? parseFloat(split.pace) : null;
        const splitTimeSec = split.timeSeconds ? parseFloat(split.timeSeconds) : null;
        return {
          splitNumber: split.splitNumber,
          distanceM: split.distanceM,
          timeSeconds: splitTimeSec,
          paceTenths: splitPaceTenths,
          watts: split.watts,
          strokeRate: split.strokeRate,
          heartRate: split.heartRate,
          calories: split.calories,
          // Pre-formatted
          formatted: {
            time: formatDuration(splitTimeSec),
            pace: formatPaceTenths(splitPaceTenths),
          },
        };
      }) || [],
    telemetry: workout.telemetry
      ? {
          timeSeriesS: workout.telemetry.timeSeriesS?.map((t) => parseFloat(t)) || [],
          wattsSeries: workout.telemetry.wattsSeries || [],
          heartRateSeries: workout.telemetry.heartRateSeries || [],
          strokeRateSeries: workout.telemetry.strokeRateSeries || [],
        }
      : null,
    athlete: workout.athlete
      ? {
          firstName: workout.athlete.firstName,
          lastName: workout.athlete.lastName,
        }
      : null,
  };
}

/**
 * Generate metadata for OG tags based on card type
 */
function generateMetadata(cardType, workoutData, athleteName) {
  const athlete = athleteName || 'Athlete';

  switch (cardType) {
    case 'erg_summary':
      return {
        title: `${athlete}'s ${workoutData.distanceM}m Erg Test`,
        description: `Split: ${formatPace(workoutData.avgPace)} | ${workoutData.avgWatts}W | ${workoutData.strokeRate} spm`,
      };

    case 'erg_charts':
      return {
        title: `${athlete}'s Workout Analysis`,
        description: `${workoutData.distanceM}m with detailed split and power charts`,
      };

    case 'pr_celebration':
      return {
        title: `${athlete} Set a New PR!`,
        description: `New personal record achieved`,
      };

    case 'regatta_result':
      return {
        title: 'Regatta Race Result',
        description: 'Race performance summary',
      };

    case 'season_recap':
      return {
        title: `${athlete}'s Season Recap`,
        description: 'Season performance highlights',
      };

    case 'team_leaderboard':
      return {
        title: 'Team Leaderboard',
        description: 'Current team rankings',
      };

    default:
      return {
        title: 'Rowing Performance',
        description: 'RowLab workout share',
      };
  }
}

/**
 * Format pace (tenths of seconds per 500m) as MM:SS.T for metadata
 */
function formatPace(paceTenths) {
  if (!paceTenths) return '--:--';
  return formatPaceTenths(parseFloat(paceTenths)) || '--:--';
}
