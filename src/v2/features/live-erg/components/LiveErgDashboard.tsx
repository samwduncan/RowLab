// src/v2/features/live-erg/components/LiveErgDashboard.tsx
// Main dashboard for live erg monitoring during active sessions

import { useState } from 'react';
import {
  Play,
  Pause,
  SquaresFour,
  ListBullets,
  Target,
  Users,
  Clock,
} from '@phosphor-icons/react';
import { useLiveErgPolling, usePollingControls } from '../hooks/useLiveErgPolling';
import { AthleteErgCard } from './AthleteErgCard';
import { RankedLeaderboard, type SortMetric } from './RankedLeaderboard';
import type { LiveViewMode } from '../../../types/live-erg';

interface LiveErgDashboardProps {
  sessionId: string;
  sessionName?: string;
  sessionCode?: string;
  targetPace?: number;
}

export function LiveErgDashboard({
  sessionId,
  sessionName,
  sessionCode,
  targetPace,
}: LiveErgDashboardProps) {
  const [viewMode, setViewMode] = useState<LiveViewMode>('leaderboard');
  const [showTargets, setShowTargets] = useState(true);
  const [sortBy, setSortBy] = useState<SortMetric>('pace');
  const polling = usePollingControls(true, 5000);

  const { data, isLoading, isError, dataUpdatedAt } = useLiveErgPolling({
    sessionId,
    config: polling.config,
  });

  // Separate active athletes from pending
  const activeAthletes = data?.athletes.filter((a) => a.status !== 'pending') || [];
  const pendingAthletes = data?.athletes.filter((a) => a.status === 'pending') || [];

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
          <p className="text-txt-muted text-sm">Loading live data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-red-500 font-medium mb-2">Connection Error</h3>
        <p className="text-red-400 text-sm">
          Failed to load live erg data. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">
            {sessionName || data?.sessionName || 'Live Session'}
          </h2>
          {(sessionCode || data?.sessionCode) && (
            <p className="text-sm text-txt-secondary">
              Session Code:{' '}
              <span className="font-mono font-medium text-accent-primary">
                {sessionCode || data?.sessionCode}
              </span>
            </p>
          )}
          {data?.activePieceName && (
            <p className="text-sm text-txt-muted mt-1">
              Current piece: {data.activePieceName}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort selector (leaderboard only) */}
          {viewMode === 'leaderboard' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMetric)}
              className="px-3 py-2 rounded-lg border border-bdr-default bg-surface-default text-txt-primary text-sm"
            >
              <option value="pace">Sort by Pace</option>
              <option value="distance">Sort by Distance</option>
              <option value="watts">Sort by Watts</option>
            </select>
          )}

          {/* Polling control */}
          <button
            onClick={polling.toggle}
            className={`p-2 rounded-lg border transition-colors ${
              polling.enabled
                ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                : 'bg-surface-default border-bdr-default text-txt-secondary hover:bg-surface-hover'
            }`}
            title={polling.enabled ? 'Pause updates' : 'Resume updates'}
          >
            {polling.enabled ? (
              <Pause className="w-5 h-5" weight="fill" />
            ) : (
              <Play className="w-5 h-5" weight="fill" />
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center border border-bdr-default rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('leaderboard')}
              className={`p-2 transition-colors ${
                viewMode === 'leaderboard'
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-txt-secondary hover:bg-surface-hover'
              }`}
              title="Leaderboard view"
            >
              <ListBullets className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-txt-secondary hover:bg-surface-hover'
              }`}
              title="Grid view"
            >
              <SquaresFour className="w-5 h-5" />
            </button>
          </div>

          {/* Target toggle (when targetPace is set) */}
          {targetPace && (
            <button
              onClick={() => setShowTargets(!showTargets)}
              className={`p-2 rounded-lg border transition-colors ${
                showTargets
                  ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                  : 'bg-surface-default border-bdr-default text-txt-secondary hover:bg-surface-hover'
              }`}
              title="Toggle target display"
            >
              <Target className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-sm text-txt-secondary bg-surface-default rounded-lg px-4 py-2">
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-txt-primary font-medium">{activeAthletes.length}</span>{' '}
          active
          {pendingAthletes.length > 0 && (
            <>
              ,{' '}
              <span className="text-txt-primary font-medium">
                {pendingAthletes.length}
              </span>{' '}
              waiting
            </>
          )}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Last updated:{' '}
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}
          {polling.enabled && (
            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </span>
      </div>

      {/* Active athletes */}
      {activeAthletes.length > 0 ? (
        viewMode === 'leaderboard' ? (
          <RankedLeaderboard athletes={activeAthletes} sortBy={sortBy} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeAthletes
              .sort((a, b) => a.pace - b.pace) // Sort by pace for ranking
              .map((athlete, index) => (
                <AthleteErgCard
                  key={athlete.athleteId}
                  data={athlete}
                  rank={index + 1}
                  showTargets={showTargets}
                  targetPace={targetPace}
                />
              ))}
          </div>
        )
      ) : (
        <div className="bg-surface-elevated rounded-lg border border-bdr-default p-8 text-center">
          <p className="text-txt-muted">Waiting for athletes to start rowing...</p>
        </div>
      )}

      {/* Pending athletes */}
      {pendingAthletes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-txt-secondary mb-3">
            Waiting to Join ({pendingAthletes.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {pendingAthletes.map((athlete) => (
              <span
                key={athlete.athleteId}
                className="px-3 py-1.5 rounded-full bg-surface-default border border-bdr-default text-txt-muted text-sm"
              >
                {athlete.athleteName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
