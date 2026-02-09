/**
 * CanvasLogEntry - Grid-based instrument readout layout
 *
 * 4-column layout: [timestamp] [indicator bar] [content] [value]
 * Slides right on hover like a tape being pulled. No card wrapper.
 *
 * Features:
 * - 4-column grid with precise spacing
 * - Breathing colored indicator bar
 * - Slide-in animation from left
 * - Hover slide-right interaction
 *
 * Design: Canvas log tape entry
 */

import { motion } from 'framer-motion';
import React from 'react';

export interface CanvasLogEntryProps {
  time: string;
  indicator: {
    color: string;
    breatheDelay?: number;
  };
  children: React.ReactNode;
  value: React.ReactNode;
  valueColor?: string;
  animationDelay?: number;
}

export function CanvasLogEntry({
  time,
  indicator,
  children,
  value,
  valueColor,
  animationDelay = 0,
}: CanvasLogEntryProps) {
  return (
    <motion.div
      className="canvas-log-entry"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: animationDelay,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Timestamp column */}
      <span className="text-[11px] font-mono text-ink-muted text-right">{time}</span>

      {/* Indicator bar — 3px colored strip, breathes subtly */}
      <div
        className="self-stretch rounded-full canvas-indicator-breathe"
        style={{
          backgroundColor: indicator.color,
          animationDelay: `${indicator.breatheDelay || 0}s`,
        }}
      />

      {/* Content column */}
      <div className="flex items-center gap-2 min-w-0">{children}</div>

      {/* Value column */}
      <span
        className="text-sm font-mono font-semibold tabular-nums"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </motion.div>
  );
}
