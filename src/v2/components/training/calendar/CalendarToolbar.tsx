// src/v2/components/training/calendar/CalendarToolbar.tsx

import React from 'react';
import type { ToolbarProps, View } from 'react-big-calendar';
import { ComplianceBadge } from '../compliance/ComplianceBadge';
import { useNcaaWeeklyHours } from '../../../hooks/useNcaaCompliance';
import { startOfWeek } from 'date-fns';

interface CalendarToolbarProps extends ToolbarProps {
  onViewChange?: (view: View) => void;
}

/**
 * Custom toolbar for training calendar.
 * Provides navigation buttons, view switcher, and NCAA compliance badge for the current week.
 */
export function CalendarToolbar({ label, date, onNavigate, onView, view }: CalendarToolbarProps) {
  const viewOptions: { key: View; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
  ];

  // Get compliance data for the currently visible week (Monday start per NCAA rules)
  const currentWeekStart = startOfWeek(date, { weekStartsOn: 1 });
  const { entries } = useNcaaWeeklyHours(currentWeekStart);

  // Calculate total team weekly hours (average across athletes, or max)
  const totalTeamHours =
    entries.length > 0 ? entries.reduce((max, entry) => Math.max(max, entry.totalHours), 0) : 0;

  return (
    <div className="flex items-center justify-between mb-4 px-2">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1.5 text-sm font-medium rounded-md
                     bg-bg-surface-elevated text-txt-primary
                     hover:bg-bg-hover transition-colors"
        >
          Today
        </button>
        <div className="flex items-center border border-bdr-default rounded-md overflow-hidden">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-1.5 hover:bg-bg-surface-elevated transition-colors"
            aria-label="Previous"
          >
            <svg
              className="w-5 h-5 text-txt-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-1.5 hover:bg-bg-surface-elevated transition-colors"
            aria-label="Next"
          >
            <svg
              className="w-5 h-5 text-txt-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* NCAA Compliance Badge */}
        {totalTeamHours > 0 && <ComplianceBadge weeklyHours={totalTeamHours} size="md" />}
      </div>

      {/* Current Date Label */}
      <h2 className="text-lg font-semibold text-txt-primary">{label}</h2>

      {/* View Switcher */}
      <div className="flex items-center gap-1 p-1 bg-bg-surface-elevated rounded-lg">
        {viewOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onView(option.key)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors
              ${
                view === option.key
                  ? 'bg-interactive-primary text-white'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CalendarToolbar;
