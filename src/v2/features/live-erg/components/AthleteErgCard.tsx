// src/v2/features/live-erg/components/AthleteErgCard.tsx
// Individual athlete erg data card for grid view

import { motion } from 'framer-motion';
import { Lightning, Heart, Timer, Gauge } from '@phosphor-icons/react';
import type { LiveErgData } from '../../../types/live-erg';
import {
  formatPace,
  formatTime,
  formatDistance,
  STATUS_COLORS,
} from '../../../types/live-erg';

interface AthleteErgCardProps {
  data: LiveErgData;
  rank?: number;
  showTargets?: boolean;
  targetPace?: number;
}

export function AthleteErgCard({
  data,
  rank,
  showTargets,
  targetPace,
}: AthleteErgCardProps) {
  const paceVariance = targetPace ? data.pace - targetPace : 0;
  const isPaceGood = paceVariance <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-elevated rounded-lg border border-bdr-default p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {rank && (
            <span
              className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary
              flex items-center justify-center text-sm font-bold"
            >
              {rank}
            </span>
          )}
          <span className="font-medium text-txt-primary">{data.athleteName}</span>
        </div>
        <span className={`text-sm flex items-center gap-1 ${STATUS_COLORS[data.status]}`}>
          {data.status === 'active' && (
            <Lightning className="w-4 h-4 animate-pulse" weight="fill" />
          )}
          <span className="capitalize">{data.status}</span>
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pace */}
        <div>
          <div className="text-xs text-txt-muted mb-1 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            Pace /500m
          </div>
          <div
            className={`text-xl font-mono font-bold ${
              showTargets && targetPace
                ? isPaceGood
                  ? 'text-green-500'
                  : 'text-red-500'
                : 'text-txt-primary'
            }`}
          >
            {formatPace(data.pace)}
          </div>
          {showTargets && targetPace && (
            <div className="text-xs text-txt-muted">Target: {formatPace(targetPace)}</div>
          )}
        </div>

        {/* Watts */}
        <div>
          <div className="text-xs text-txt-muted mb-1 flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            Watts
          </div>
          <div className="text-xl font-mono font-bold text-txt-primary">{data.watts}</div>
        </div>

        {/* Distance */}
        <div>
          <div className="text-xs text-txt-muted mb-1">Distance</div>
          <div className="text-lg font-mono text-txt-primary">
            {formatDistance(data.distance)}
          </div>
        </div>

        {/* Time */}
        <div>
          <div className="text-xs text-txt-muted mb-1">Time</div>
          <div className="text-lg font-mono text-txt-primary">{formatTime(data.time)}</div>
        </div>

        {/* Stroke Rate */}
        <div>
          <div className="text-xs text-txt-muted mb-1">Rate</div>
          <div className="text-lg font-mono text-txt-primary">{data.strokeRate} spm</div>
        </div>

        {/* Heart Rate (if available) */}
        {data.heartRate && (
          <div>
            <div className="text-xs text-txt-muted mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3" weight="fill" />
              HR
            </div>
            <div className="text-lg font-mono text-txt-primary">{data.heartRate} bpm</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
