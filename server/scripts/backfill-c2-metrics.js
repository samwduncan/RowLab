/**
 * Backfill script: Re-extract avgPace, avgWatts, and splits from rawData
 * for all C2-imported workouts. Run after fixing the extraction logic.
 *
 * Usage: node --env-file=.env server/scripts/backfill-c2-metrics.js
 */

import { prisma } from '../db/connection.js';

function calculatePace(timeTenths, distanceM) {
  if (!timeTenths || !distanceM || distanceM <= 0) return null;
  return Math.round(timeTenths / (distanceM / 500));
}

function calculateWatts(timeTenths, distanceM, machineType) {
  if (!timeTenths || !distanceM || distanceM <= 0) return null;
  // Rower/SkiErg: k=2.80 (pace per 500m), BikeErg: k=0.35 (pace per 1000m)
  const k = machineType === 'bike' || machineType === 'bikerg' ? 0.35 : 2.8;
  const timeSeconds = timeTenths / 10;
  const pacePerMeter = timeSeconds / distanceM;
  return Math.round(k / Math.pow(pacePerMeter, 3));
}

function extractSplits(raw) {
  const workout = raw.workout || {};
  const machineType = raw.type || null;
  const segments = workout.intervals || workout.splits || [];
  return segments.map((seg, i) => ({
    splitNumber: i + 1,
    distanceM: seg.distance || null,
    timeSeconds: seg.time ? seg.time / 10 : null,
    pace: calculatePace(seg.time, seg.distance),
    watts: calculateWatts(seg.time, seg.distance, machineType),
    strokeRate: seg.stroke_rate || null,
    heartRate: seg.heart_rate?.average || null,
    dragFactor: null,
    calories: seg.calories_total || null,
  }));
}

function formatPace(paceTenths) {
  if (!paceTenths) return 'N/A';
  const totalSeconds = paceTenths / 10;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

async function backfill() {
  const workouts = await prisma.workout.findMany({
    where: { c2LogbookId: { not: null } },
    select: { id: true, rawData: true },
  });

  console.log(`Backfilling ${workouts.length} C2 workouts...`);
  let updated = 0;
  let splitsCreated = 0;

  for (const w of workouts) {
    const raw = w.rawData;
    if (!raw) continue;

    const avgPace = calculatePace(raw.time, raw.distance);
    const avgWatts = calculateWatts(raw.time, raw.distance, raw.type);
    const avgHeartRate = raw.heart_rate?.average || null;
    const splits = extractSplits(raw);

    await prisma.$transaction(async (tx) => {
      await tx.workout.update({
        where: { id: w.id },
        data: { avgPace, avgWatts, avgHeartRate },
      });

      await tx.workoutSplit.deleteMany({ where: { workoutId: w.id } });
      if (splits.length > 0) {
        await tx.workoutSplit.createMany({
          data: splits.map((s) => ({ workoutId: w.id, ...s })),
        });
        splitsCreated += splits.length;
      }
    });

    console.log(
      `  [${(raw.type || '?').padEnd(7)}] ${(raw.workout_type || 'unknown').padEnd(25)} ${String(raw.distance).padStart(6)}m → pace=${formatPace(avgPace).padEnd(8)} watts=${String(avgWatts || 'N/A').padStart(4)} splits=${splits.length}`
    );
    updated++;
  }

  console.log(`\nDone: ${updated} workouts updated, ${splitsCreated} splits created.`);
  await prisma.$disconnect();
}

backfill().catch((e) => {
  console.error(e);
  process.exit(1);
});
