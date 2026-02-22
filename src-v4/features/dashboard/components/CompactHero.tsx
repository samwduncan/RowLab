/**
 * CompactHero — full-width greeting + inline week stats + streak badge.
 * Space Grotesk greeting, Space Mono stat pills.
 */
import { Card } from '@/components/ui/Card';
import type { StatsData } from '../types';

interface CompactHeroProps {
  userName: string;
  stats: StatsData;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}k`;
  return `${meters}m`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CompactHero({ userName, stats }: CompactHeroProps) {
  const firstName = userName.split(' ')[0];
  const { range, streak, allTime } = stats;

  return (
    <Card padding="none" className="border-t-2 border-t-accent-teal overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg sm:text-xl font-semibold text-text-bright">
            {getGreeting()}, {firstName}
          </h1>
          {streak.current > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-coral/10 px-2.5 py-0.5 text-xs font-mono font-bold text-accent-coral">
              {streak.current}d streak
            </span>
          )}
        </div>

        {/* Week stats */}
        <div className="flex items-center gap-3">
          <StatPill label="Distance" value={formatDistance(range.meters)} />
          <StatPill label="Time" value={formatDuration(allTime.totalDurationSeconds)} />
          <StatPill label="Sessions" value={String(range.workouts)} />
        </div>
      </div>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md bg-void-deep/50 px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-widest text-text-faint">
        {label}
      </span>
      <span className="font-mono text-sm font-bold text-text-bright">{value}</span>
    </div>
  );
}
