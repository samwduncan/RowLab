#!/usr/bin/env node
/**
 * Backfill Workout Inference
 *
 * Process existing workouts that have splits but no inferredPattern.
 * Runs inference and updates the workout records.
 *
 * Usage: node --env-file=.env server/scripts/backfill-inference.js
 */

import { prisma } from '../db/connection.js';
import { inferWorkoutPattern } from '../services/workoutInferenceService.js';
import logger from '../utils/logger.js';

async function backfillInference() {
  console.log('Starting workout inference backfill...\n');

  // Find workouts with splits but no inferredPattern
  const workouts = await prisma.workout.findMany({
    where: {
      splits: {
        some: {}, // Has at least one split
      },
    },
    include: {
      splits: {
        orderBy: { splitNumber: 'asc' },
      },
    },
  });

  // Filter to only those without inferredPattern (can't use JSON null in where clause)
  const workoutsToProcess = workouts.filter((w) => !w.inferredPattern);

  console.log(`Found ${workoutsToProcess.length} workouts to process\n`);

  let processed = 0;
  let patternsDetected = 0;
  let errors = 0;

  for (const workout of workoutsToProcess) {
    try {
      // Run inference
      const inference = inferWorkoutPattern(workout, workout.splits);

      // Update if patterns detected
      if (inference) {
        await prisma.workout.update({
          where: { id: workout.id },
          data: { inferredPattern: inference },
        });

        patternsDetected++;
        console.log(
          `✓ Workout ${workout.id}: ${inference.patterns.length} patterns detected` +
            (inference.inferredTitle ? ` (${inference.inferredTitle})` : '')
        );
      }

      processed++;

      // Progress update every 10 workouts
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${workoutsToProcess.length} workouts processed`);
      }
    } catch (err) {
      errors++;
      logger.error('Inference failed for workout', {
        workoutId: workout.id,
        error: err.message,
      });
      console.error(`✗ Workout ${workout.id}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Backfill complete');
  console.log('='.repeat(60));
  console.log(`Total workouts processed: ${processed}`);
  console.log(`Patterns detected: ${patternsDetected}`);
  console.log(`Errors: ${errors}`);
  console.log(
    `Success rate: ${((patternsDetected / processed) * 100).toFixed(1)}% (patterns/processed)`
  );
}

// Run backfill
backfillInference()
  .then(() => {
    console.log('\nBackfill finished successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
