import { useMemo, useState } from 'react';
import {
  calculateMarginMeters,
  calculateBoatLengths,
  estimateSpeed,
  formatMargin,
  getShellImage,
  getShellLength,
} from '@v2/utils/marginCalculations';

/**
 * Props for MarginVisualizer
 */
export interface MarginVisualizerProps {
  /**
   * First boat configuration
   */
  boatA?: {
    name: string;
    time: number; // seconds
    boatClass: string; // e.g., '8+', '4+', '2x', '1x'
  };

  /**
   * Second boat configuration
   */
  boatB?: {
    name: string;
    time: number; // seconds
    boatClass: string;
  };

  /**
   * Piece distance in meters (default: 2000m)
   */
  distance?: number;

  /**
   * Optional className for container
   */
  className?: string;
}

/**
 * MarginVisualizer - Visual comparison of two boats with calculated margin
 *
 * Features:
 * - Displays two shell silhouettes horizontally
 * - Leading boat positioned ahead (to the right)
 * - Gap between boats proportional to margin
 * - Shows margin in boat lengths and descriptive terms
 * - Displays time difference and boat names
 *
 * Per MARG-01 to MARG-05 requirements:
 * - MARG-01: System displays top-down shell silhouette
 * - MARG-02: User can view margin between two boats based on piece times
 * - MARG-03: System calculates distance gap from time delta and winner speed
 * - MARG-04: System displays margin in boat lengths (scaled to shell type)
 * - MARG-05: Visualization shows bow ball positions with gap indicator
 */
export function MarginVisualizer({
  boatA,
  boatB,
  distance = 2000,
  className = '',
}: MarginVisualizerProps) {
  // Empty state - no boats provided
  if (!boatA || !boatB) {
    return (
      <div
        className={`rounded-lg border border-v2-border bg-v2-surface p-8 text-center ${className}`}
      >
        <h3 className="mb-2 text-lg font-semibold text-v2-text-primary">
          Boat Margin Visualizer
        </h3>
        <p className="text-sm text-v2-text-secondary">
          Enter piece times for two boats to see margin comparison
        </p>
      </div>
    );
  }

  // Calculate margin
  const { margin, winnerSpeed, boatLengths, formattedMargin } = useMemo(() => {
    // Calculate winner speed (faster boat)
    const fasterTime = Math.min(boatA.time, boatB.time);
    const winnerSpeed = estimateSpeed(fasterTime, distance);

    // Calculate margin
    const margin = calculateMarginMeters(
      boatA.time,
      boatB.time,
      winnerSpeed,
      boatA.name,
      boatB.name
    );

    // Convert to boat lengths (use winner's boat class for reference)
    const winnerBoatClass =
      margin.leader === 'A' ? boatA.boatClass : boatB.boatClass;
    const boatLengths = calculateBoatLengths(
      margin.distanceMeters,
      winnerBoatClass
    );

    // Format margin
    const formattedMargin = formatMargin(boatLengths);

    return { margin, winnerSpeed, boatLengths, formattedMargin };
  }, [boatA, boatB, distance]);

  // Get shell images
  const shellA = getShellImage(boatA.boatClass);
  const shellB = getShellImage(boatB.boatClass);

  // Get shell lengths for proportional sizing
  const lengthA = getShellLength(boatA.boatClass);
  const lengthB = getShellLength(boatB.boatClass);
  const maxLength = Math.max(lengthA, lengthB);

  // Calculate visual gap (capped for display)
  // Max gap: 50% of container width, min gap: 10px for close finishes
  const gapPercent = Math.min(boatLengths * 10, 50); // 10% per length, cap at 50%
  const minGap = boatLengths < 0.1 ? 0 : 10; // No gap for dead heats

  // Determine which boat is leading
  const leadingBoat = margin.leader === 'A' ? boatA : boatB;
  const trailingBoat = margin.leader === 'A' ? boatB : boatA;
  const leadingShell = margin.leader === 'A' ? shellA : shellB;
  const trailingShell = margin.leader === 'A' ? shellB : shellA;
  const leadingLength = margin.leader === 'A' ? lengthA : lengthB;
  const trailingLength = margin.leader === 'A' ? lengthB : lengthA;

  return (
    <div
      className={`rounded-lg border border-v2-border bg-v2-surface p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-v2-text-primary">
          Boat Margin Comparison
        </h3>
        <div className="text-sm text-v2-text-secondary">
          {distance}m piece
        </div>
      </div>

      {/* Margin summary */}
      <div className="mb-8 rounded-md bg-v2-background p-4 text-center">
        <div className="mb-1 text-2xl font-bold text-v2-text-primary">
          {formattedMargin}
        </div>
        <div className="text-sm text-v2-text-secondary">
          {margin.faster} ahead by {margin.timeDelta.toFixed(1)}s
        </div>
        {boatLengths >= 0.1 && (
          <div className="mt-1 text-xs text-v2-text-tertiary">
            {margin.distanceMeters.toFixed(1)}m gap
          </div>
        )}
      </div>

      {/* Visualization */}
      <div className="relative mb-6">
        {/* Trailing boat */}
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-v2-text-secondary">
            {trailingBoat.name}
          </div>
          <div className="relative flex items-center">
            <img
              src={trailingShell}
              alt={`${trailingBoat.boatClass} shell`}
              className="h-6"
              style={{ width: `${(trailingLength / maxLength) * 80}%` }}
            />
            {/* Bow ball marker */}
            <div
              className="absolute -right-1 h-3 w-3 rounded-full bg-v2-accent"
              style={{
                left: `${(trailingLength / maxLength) * 80}%`,
              }}
            />
          </div>
          <div className="mt-1 text-xs text-v2-text-tertiary">
            {formatTime(trailingBoat.time)}
          </div>
        </div>

        {/* Gap indicator */}
        {boatLengths >= 0.1 && (
          <div className="my-4 flex items-center">
            <div
              className="h-px bg-v2-border"
              style={{ width: `${Math.max(gapPercent, 5)}%` }}
            />
            <div className="ml-2 flex items-center gap-1 text-xs text-v2-text-tertiary">
              <svg
                className="h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2L6 10M6 10L3 7M6 10L9 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {boatLengths.toFixed(1)} lengths
            </div>
          </div>
        )}

        {/* Leading boat */}
        <div>
          <div className="mb-2 text-sm font-medium text-v2-text-primary">
            {leadingBoat.name}
          </div>
          <div
            className="relative flex items-center"
            style={{
              marginLeft: boatLengths >= 0.1 ? `${Math.max(gapPercent, 5)}%` : 0,
            }}
          >
            <img
              src={leadingShell}
              alt={`${leadingBoat.boatClass} shell`}
              className="h-6"
              style={{ width: `${(leadingLength / maxLength) * 80}%` }}
            />
            {/* Bow ball marker */}
            <div
              className="absolute -right-1 h-3 w-3 rounded-full bg-v2-accent-bright"
              style={{
                left: `${(leadingLength / maxLength) * 80}%`,
              }}
            />
          </div>
          <div className="mt-1 text-xs font-medium text-v2-text-primary">
            {formatTime(leadingBoat.time)}
          </div>
        </div>
      </div>

      {/* Speed info */}
      <div className="rounded-md border border-v2-border bg-v2-background px-4 py-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-v2-text-tertiary">Winner speed</div>
            <div className="font-medium text-v2-text-primary">
              {winnerSpeed.toFixed(2)} m/s
            </div>
          </div>
          <div>
            <div className="text-v2-text-tertiary">Split</div>
            <div className="font-medium text-v2-text-primary">
              {formatSplit(500 / winnerSpeed)}/500m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format time in seconds to MM:SS.s
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
}

/**
 * Format split time (seconds per 500m)
 */
function formatSplit(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
