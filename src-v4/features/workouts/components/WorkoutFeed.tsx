/**
 * Main workout feed with day grouping, infinite scroll, and state handling.
 * Groups workouts by calendar day with date headers (Today, Yesterday, Feb 12, etc.)
 * and triggers pagination via IntersectionObserver sentinel.
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';

import { useWorkoutFeed } from '../hooks/useWorkoutFeed';
import { groupWorkoutsByDay } from '../utils';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';
import type { WorkoutFilters, Workout } from '../types';
import { WorkoutRow } from './WorkoutRow';
import { WorkoutRowExpanded } from './WorkoutRowExpanded';
import { FeedSkeleton } from './FeedSkeleton';
import { WorkoutEmptyState } from './WorkoutEmptyState';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface WorkoutFeedProps {
  filters: WorkoutFilters;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onCreateNew: () => void;
}

/* ------------------------------------------------------------------ */
/* WorkoutFeed                                                         */
/* ------------------------------------------------------------------ */

export function WorkoutFeed({ filters, onEdit, onDelete, onCreateNew }: WorkoutFeedProps) {
  const {
    workouts,
    sentinelRef,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    refetch,
  } = useWorkoutFeed(filters);

  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleNavigateToDetail = (id: string) => {
    navigate({ to: `/workouts/${id}` as '/' });
  };

  // Loading state
  if (isLoading) {
    return <FeedSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-data-poor/10 border border-data-poor/30 rounded-lg p-4">
        <p className="text-data-poor text-sm font-medium mb-1">Failed to load workouts</p>
        <p className="text-ink-secondary text-sm mb-3">
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-sm text-ink-primary hover:text-accent-copper transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (workouts.length === 0) {
    return <WorkoutEmptyState onCreateNew={onCreateNew} />;
  }

  // Group workouts by day
  const groups = groupWorkoutsByDay(workouts);

  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-1"
    >
      {groups.map((group) => (
        <motion.div key={group.dateKey} variants={listItemVariants} transition={SPRING_SMOOTH}>
          {/* Date header */}
          <div className="flex items-center gap-3 px-3 pt-4 pb-2">
            <h3 className="text-ink-secondary text-sm font-medium uppercase tracking-wider shrink-0">
              {group.label}
            </h3>
            <div className="flex-1 h-px bg-ink-border" />
          </div>

          {/* Workout rows */}
          <div className="space-y-0.5">
            {group.workouts.map((workout) => (
              <div key={workout.id}>
                <WorkoutRow
                  workout={workout}
                  isExpanded={expandedId === workout.id}
                  onToggle={() => handleToggle(workout.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
                <AnimatePresence>
                  {expandedId === workout.id && (
                    <WorkoutRowExpanded
                      workout={workout}
                      onNavigateToDetail={handleNavigateToDetail}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Next page loading indicator */}
      {isFetchingNextPage && (
        <div className="space-y-0.5 px-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-ink-raised animate-shimmer" />
              <div className="h-4 w-20 rounded bg-ink-raised animate-shimmer" />
              <div className="flex-1" />
              <div className="h-4 w-14 rounded bg-ink-raised animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* End of feed */}
      {!hasNextPage && workouts.length > 0 && (
        <p className="text-center text-ink-muted text-xs py-6">You&rsquo;ve reached the end</p>
      )}
    </motion.div>
  );
}
