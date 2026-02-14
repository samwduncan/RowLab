/**
 * Team Activity Feed with infinite scroll.
 *
 * Uses useTeamActivity hook for paginated data.
 * Groups events by date (Today, Yesterday, {date}) with section headers.
 * Supports compact mode (used in Overview sidebar) with limited items.
 */
import { motion } from 'motion/react';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTeamActivity } from '../hooks/useTeamActivity';
import { ActivityItem } from './ActivityItem';
import type { ActivityEvent } from '../types';

interface TeamActivityFeedProps {
  teamId: string;
  compact?: boolean;
}

function groupByDate(events: ActivityEvent[]): Array<{ label: string; events: ActivityEvent[] }> {
  const groups = new Map<string, ActivityEvent[]>();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);

  for (const event of events) {
    const date = new Date(event.createdAt);
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let label: string;
    if (eventDay.getTime() === today.getTime()) {
      label = 'Today';
    } else if (eventDay.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else {
      label = eventDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (eventDay.getFullYear() !== now.getFullYear()) {
        label += `, ${eventDay.getFullYear()}`;
      }
    }

    const existing = groups.get(label);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(label, [event]);
    }
  }

  return Array.from(groups.entries()).map(([label, events]) => ({ label, events }));
}

export function TeamActivityFeed({ teamId, compact }: TeamActivityFeedProps) {
  const { events, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTeamActivity(teamId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 animate-shimmer rounded-lg bg-ink-raised p-3"
          >
            <div className="h-8 w-8 rounded-full bg-ink-well" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-ink-well" />
              <div className="h-2 w-1/3 rounded bg-ink-well" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayEvents = compact ? events.slice(0, 10) : events;

  if (displayEvents.length === 0) {
    return (
      <GlassCard padding="md">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <svg
            className="h-10 w-10 text-ink-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-ink-secondary">No team activity yet.</p>
          <p className="text-xs text-ink-tertiary">
            Activity will appear here as team members train and interact.
          </p>
        </div>
      </GlassCard>
    );
  }

  const grouped = groupByDate(displayEvents);

  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {grouped.map((group) => (
        <motion.div key={group.label} variants={listItemVariants} transition={SPRING_SMOOTH}>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">
            {group.label}
          </h4>
          <div className="space-y-1">
            {group.events.map((event) => (
              <ActivityItem key={event.id} event={event} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Load more (full feed only) */}
      {!compact && hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg bg-ink-well/50 px-4 py-2 text-sm text-ink-secondary transition-colors hover:bg-ink-well hover:text-ink-primary disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
