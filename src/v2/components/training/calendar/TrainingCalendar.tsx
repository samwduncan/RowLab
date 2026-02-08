// src/v2/components/training/calendar/TrainingCalendar.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { CalendarToolbar } from './CalendarToolbar';
import { WorkoutEventCard, getEventStyle } from './WorkoutEventCard';
import { useCalendarEvents } from '../../../hooks/useWorkouts';
import { getMonthBounds, getWeekBounds } from '../../../utils/calendarHelpers';
import type { CalendarEvent } from '../../../types/training';

// Setup date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday start
  getDay,
  locales,
});

interface TrainingCalendarProps {
  planId?: string;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  className?: string;
}

/**
 * Training calendar component using react-big-calendar.
 * Supports month and week views with workout events.
 */
export function TrainingCalendar({
  planId,
  onSelectEvent,
  onSelectSlot,
  className = '',
}: TrainingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    if (view === 'week') {
      return getWeekBounds(currentDate);
    }
    // For month view, get full month plus buffer for overflow weeks
    const monthBounds = getMonthBounds(currentDate);
    return {
      start: subMonths(monthBounds.start, 0), // Start of month
      end: addMonths(monthBounds.end, 0), // End of month
    };
  }, [currentDate, view]);

  // Fetch calendar events
  const { events, isLoading, error } = useCalendarEvents(dateRange.start, dateRange.end, planId);

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectEvent?.(event);
    },
    [onSelectEvent]
  );

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      if (slotInfo.action === 'click' || slotInfo.action === 'select') {
        onSelectSlot?.({ start: slotInfo.start, end: slotInfo.end });
      }
    },
    [onSelectSlot]
  );

  // Custom components
  const components = useMemo(
    () => ({
      toolbar: CalendarToolbar,
      event: WorkoutEventCard,
    }),
    []
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-tertiary">
        <p>Failed to load calendar events</p>
      </div>
    );
  }

  return (
    <div className={`training-calendar ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-bg-surface/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive-primary" />
        </div>
      )}

      <div className="h-[600px] relative">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={currentDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={components}
          eventPropGetter={getEventStyle}
          popup
          showMultiDayTimes
          step={30}
          timeslots={2}
          formats={{
            timeGutterFormat: 'h:mm a',
            eventTimeRangeFormat: ({ start, end }, culture, local) =>
              `${local.format(start, 'h:mm a', culture)} - ${local.format(end, 'h:mm a', culture)}`,
          }}
        />
      </div>

      {/* Calendar Custom Styles - V3 Design Tokens */}
      <style jsx global>{`
        .training-calendar .rbc-calendar {
          font-family: inherit;
          background-color: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 0.5rem;
        }

        .training-calendar .rbc-header {
          padding: 0.75rem 0.5rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border-default);
        }

        .training-calendar .rbc-month-view,
        .training-calendar .rbc-time-view {
          border: none;
        }

        .training-calendar .rbc-day-bg {
          background-color: var(--color-bg-surface);
        }

        .training-calendar .rbc-day-bg + .rbc-day-bg,
        .training-calendar .rbc-month-row + .rbc-month-row {
          border-color: var(--color-border-default);
        }

        .training-calendar .rbc-off-range-bg {
          background-color: var(--color-bg-base);
        }

        .training-calendar .rbc-today {
          background-color: var(--glow-good);
        }

        .training-calendar .rbc-date-cell {
          padding: 0.25rem 0.5rem;
          text-align: right;
        }

        .training-calendar .rbc-date-cell > a {
          color: var(--color-text-primary);
        }

        .training-calendar .rbc-date-cell.rbc-now > a {
          color: var(--color-interactive-primary);
          font-weight: 600;
        }

        .training-calendar .rbc-event {
          border-radius: 4px;
          padding: 0;
          font-size: 0.75rem;
        }

        .training-calendar .rbc-event:focus {
          outline: 2px solid var(--color-interactive-primary);
          outline-offset: 1px;
        }

        .training-calendar .rbc-time-header {
          border-bottom: 1px solid var(--color-border-default);
        }

        .training-calendar .rbc-time-content {
          border-top: none;
        }

        .training-calendar .rbc-time-slot {
          border-top: 1px solid var(--color-border-subtle);
        }

        .training-calendar .rbc-timeslot-group {
          border-bottom: 1px solid var(--color-border-default);
        }

        .training-calendar .rbc-time-gutter {
          color: var(--color-text-tertiary);
          font-size: 0.75rem;
          font-family: var(--font-mono);
        }

        .training-calendar .rbc-current-time-indicator {
          background-color: var(--data-poor);
        }

        .training-calendar .rbc-show-more {
          color: var(--color-interactive-primary);
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Dark mode adjustments */
        .v2[data-theme='dark'] .training-calendar .rbc-day-bg {
          background-color: var(--color-bg-surface);
        }
      `}</style>
    </div>
  );
}

export default TrainingCalendar;
