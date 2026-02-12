/**
 * Test share card rendering with real C2 workout data.
 * Fetches workouts from DB, serializes them, and sends to the Python service.
 * Saves output PNGs to $ncswd for Nextcloud viewing.
 *
 * Usage: node --env-file=.env server/scripts/test-share-card.js
 */

import { prisma } from '../db/connection.js';
import fs from 'fs/promises';
import path from 'path';

const PYTHON_URL = 'http://localhost:5000';
const OUTPUT_DIR = '/tmp/share-cards';

function formatPaceTenths(tenths) {
  if (!tenths) return null;
  const totalSeconds = tenths / 10;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

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

function serializeWorkout(workout) {
  const avgPaceTenths = workout.avgPace ? parseFloat(workout.avgPace) : null;
  const durationSec = workout.durationSeconds ? parseFloat(workout.durationSeconds) : null;
  const rawData = workout.rawData || {};

  return {
    id: workout.id,
    date: workout.date.toISOString(),
    distanceM: workout.distanceM,
    durationSeconds: durationSec,
    avgPaceTenths,
    avgWatts: workout.avgWatts,
    avgHeartRate: workout.avgHeartRate,
    strokeRate: workout.strokeRate,
    calories: workout.calories,
    dragFactor: workout.dragFactor,
    machineType: workout.machineType,
    workoutType: rawData.workout_type || null,
    rawMachineType: rawData.type || null,
    source: workout.source,
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
          formatted: {
            time: formatDuration(splitTimeSec),
            pace: formatPaceTenths(splitPaceTenths),
          },
        };
      }) || [],
    athlete: workout.athlete
      ? { firstName: workout.athlete.firstName, lastName: workout.athlete.lastName }
      : null,
  };
}

async function renderCard(workoutData, cardType, format, filename) {
  const response = await fetch(`${PYTHON_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardType,
      format,
      workoutData,
      options: { showName: true, showAttribution: true },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Render failed (${response.status}): ${errText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outPath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(outPath, buffer);
  console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  // Get diverse workout types for testing
  const workouts = await prisma.workout.findMany({
    where: { c2LogbookId: { not: null } },
    include: {
      splits: { orderBy: { splitNumber: 'asc' } },
      athlete: true,
    },
    orderBy: { date: 'desc' },
    take: 21,
  });

  // Pick representative workouts
  const byType = {};
  for (const w of workouts) {
    const wt = w.rawData?.workout_type || 'unknown';
    if (!byType[wt]) byType[wt] = w;
  }

  const testCases = Object.entries(byType).slice(0, 5);
  console.log(`Rendering ${testCases.length} test cards to ${OUTPUT_DIR}...\n`);

  for (const [wtype, workout] of testCases) {
    const data = serializeWorkout(workout);
    const machine = data.rawMachineType || 'erg';
    const label = `${wtype}_${machine}_${data.distanceM}m`;
    console.log(`${label}:`);
    console.log(
      `  Type: ${wtype} | Machine: ${machine} | Distance: ${data.distanceM}m | Splits: ${data.splits.length}`
    );
    console.log(
      `  Pace: ${data.formatted.avgPace} | Watts: ${data.avgWatts || 'N/A'} | HR: ${data.avgHeartRate || 'N/A'}`
    );

    try {
      await renderCard(data, 'erg_summary_alt', '1:1', `share-card-${label}.png`);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
    console.log();
  }

  await prisma.$disconnect();
  console.log('Done!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
