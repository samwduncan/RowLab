// src/v2/components/training/calendar/DragDropCalendar.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
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
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { CalendarToolbar } from './CalendarToolbar';
import { WorkoutEventCard, getEventStyle } from './WorkoutEventCard';
import { DragFeedback } from './DragFeedback';
import { useCalendarEvents, useRescheduleWorkout } from '../../../hooks/useWorkouts';
import { useNcaaWeeklyHours } from '../../../hooks/useNcaaCompliance';
import { getMonthBounds, getWeekBounds } from '../../../utils/calendarHelpers';
import type { CalendarEvent } from '../../../types/training';

// Setup date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Apply drag-and-drop HOC to Calendar
const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

type ComplianceStatus = 'ok' | 'warning' | 'violation';

function calculateComplianceStatus(hours: number, limit: number = 20): ComplianceStatus {
  if (hours >= limit) return 'violation';
  if (hours >= limit * 0.9) return 'warning';
  return 'ok';
}

interface DragDropCalendarProps {
  planId?: string;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onRescheduleSuccess?: (workoutId: string, newDate: Date) => void;
  onRescheduleError?: (error: Error) => void;
  className?: string;
}

/**
 * Training calendar with drag-drop rescheduling support.
 * Uses react-big-calendar's drag-drop addon with optimistic updates,
 * spring physics drag feedback, and NCAA compliance preview.
 */
export function DragDropCalendar({
  planId,
  onSelectEvent,
  onSelectSlot,
  onRescheduleSuccess,
  onRescheduleError,
  className = '',
}: DragDropCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
  const [dragTargetDate, setDragTargetDate] = useState<Date | null>(null);

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    if (view === 'week') {
      return getWeekBounds(currentDate);
    }
    const monthBounds = getMonthBounds(currentDate);
    return {
      start: subMonths(monthBounds.start, 0),
      end: addMonths(monthBounds.end, 0),
    };
  }, [currentDate, view]);

  // Fetch calendar events
  const { events, isLoading, error } = useCalendarEvents(dateRange.start, dateRange.end, planId);

  // Reschedule mutation with optimistic update
  const { rescheduleWorkout, isRescheduling } = useRescheduleWorkout();

  // Fetch current week compliance for drag preview
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const { entries: complianceEntries } = useNcaaWeeklyHours(currentWeekStart);

  // Calculate current week hours for compliance preview during drag
  const currentWeekHours = useMemo(() => {
    if (complianceEntries.length === 0) return 0;
    return complianceEntries.reduce((max, entry) => Math.max(max, entry.totalHours), 0);
  }, [complianceEntries]);

  // Projected compliance status for drag target
  const projectedComplianceStatus = useMemo((): ComplianceStatus => {
    if (!draggingEvent || !dragTargetDate) return 'ok';
    // Simple projection: current week hours (the event's duration is already counted)
    // In a more sophisticated version, we'd recalculate based on which week the event lands in
    return calculateComplianceStatus(currentWeekHours);
  }, [draggingEvent, dragTargetDate, currentWeekHours]);

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
      if (!draggingEvent) {
        onSelectEvent?.(event);
      }
    },
    [onSelectEvent, draggingEvent]
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

  // Handle drag start
  const handleDragStart = useCallback((args: { event: CalendarEvent }) => {
    setDraggingEvent(args.event);
    setDragTargetDate(null);
  }, []);

  // Handle event drop (reschedule)
  const handleEventDrop = useCallback(
    ({
      event,
      start,
      end,
      isAllDay,
    }: withDragAndDropProps<CalendarEvent>['onEventDrop'] extends (args: infer A) => any
      ? A
      : never) => {
      setDraggingEvent(null);
      setDragTargetDate(null);

      // Get the workout ID from the event
      const workoutId = event.resource?.workoutId || event.id;
      if (!workoutId) {
        console.error('No workout ID found for event:', event);
        return;
      }

      // Get the planId from the event resource (REQUIRED for reschedule API)
      const eventPlanId = event.resource?.planId;
      if (!eventPlanId) {
        console.error('No planId found for event:', event);
        return;
      }

      // Don't reschedule recurring event instances (per Phase 10-05 decision)
      if (event.resource?.isRecurring && event.resource?.parentId) {
        console.warn('Cannot reschedule recurring event instance. Edit the parent event instead.');
        return;
      }

      const newDate = start as Date;

      // Trigger the reschedule mutation with planId (optimistic update handled by hook)
      rescheduleWorkout(
        { id: workoutId, planId: eventPlanId, scheduledDate: newDate },
        {
          onSuccess: () => {
            onRescheduleSuccess?.(workoutId, newDate);
          },
          onError: (err) => {
            console.error('Failed to reschedule workout:', err);
            onRescheduleError?.(err as Error);
          },
        }
      );
    },
    [rescheduleWorkout, onRescheduleSuccess, onRescheduleError]
  );

  // Handle event resize (change duration)
  const handleEventResize = useCallback(
    ({
      event,
      start,
      end,
    }: withDragAndDropProps<CalendarEvent>['onEventResize'] extends (args: infer A) => any
      ? A
      : never) => {
      // For now, we only support rescheduling (moving events)
      // Resizing would require updating duration, which is a more complex operation
      console.log('Event resize not implemented:', event.title);
    },
    []
  );

  // Determine if an event is draggable
  // Recurring event instances can't be dragged individually (per Phase 10-05 decision)
  const draggableAccessor = useCallback((event: CalendarEvent) => {
    if (event.resource?.isRecurring && event.resource?.parentId) {
      return false;
    }
    if (!event.resource?.planId) {
      return false;
    }
    return true;
  }, []);

  // Determine if an event is resizable
  const resizableAccessor = useCallback(() => {
    return false;
  }, []);

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
    <div className={`drag-drop-calendar ${className}`}>
      {/* Loading overlay */}
      {(isLoading || isRescheduling) && (
        <div className="absolute inset-0 bg-bg-surface/50 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-interactive-primary" />
            {isRescheduling && <span className="text-sm text-txt-secondary">Rescheduling...</span>}
          </div>
        </div>
      )}

      <div className="h-[600px] relative">
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view}
          date={currentDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onDragStart={handleDragStart}
          draggableAccessor={draggableAccessor}
          resizableAccessor={resizableAccessor}
          selectable
          resizable={false}
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

      {/* Drag feedback overlay with spring physics and compliance preview */}
      {draggingEvent && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <DragFeedback
            event={draggingEvent}
            newDate={dragTargetDate}
            complianceStatus={projectedComplianceStatus}
            projectedHours={currentWeekHours}
          />
        </div>
      )}

      {/* Calendar Custom Styles - V3 Design Tokens + drag-drop styles */}
      <style jsx global>{`
        .drag-drop-calendar .rbc-calendar {
          font-family: inherit;
          background-color: var(--color-bg-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 0.5rem;
        }

        .drag-drop-calendar .rbc-header {
          padding: 0.75rem 0.5rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border-default);
        }

        .drag-drop-calendar .rbc-month-view,
        .drag-drop-calendar .rbc-time-view {
          border: none;
        }

        .drag-drop-calendar .rbc-day-bg {
          background-color: var(--color-bg-surface);
        }

        .drag-drop-calendar .rbc-day-bg + .rbc-day-bg,
        .drag-drop-calendar .rbc-month-row + .rbc-month-row {
          border-color: var(--color-border-default);
        }

        .drag-drop-calendar .rbc-off-range-bg {
          background-color: var(--color-bg-base);
        }

        .drag-drop-calendar .rbc-today {
          background-color: var(--glow-good);
        }

        .drag-drop-calendar .rbc-date-cell {
          padding: 0.25rem 0.5rem;
          text-align: right;
        }

        .drag-drop-calendar .rbc-date-cell > a {
          color: var(--color-text-primary);
        }

        .drag-drop-calendar .rbc-date-cell.rbc-now > a {
          color: var(--color-interactive-primary);
          font-weight: 600;
        }

        .drag-drop-calendar .rbc-event {
          border-radius: 4px;
          padding: 0;
          font-size: 0.75rem;
        }

        .drag-drop-calendar .rbc-event:focus {
          outline: 2px solid var(--color-interactive-primary);
          outline-offset: 1px;
        }

        /* Drag-drop specific styles - spring physics visual */
        .drag-drop-calendar .rbc-addons-dnd-drag-preview {
          opacity: 0.85;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
          transform: scale(1.02) rotate(1deg);
          transition:
            transform 0.15s cubic-bezier(0.2, 0, 0, 1),
            box-shadow 0.15s ease-out;
        }

        .drag-drop-calendar .rbc-addons-dnd-dragged-event {
          opacity: 0.3;
        }

        .drag-drop-calendar .rbc-addons-dnd-over-drop-zone {
          background-color: var(--glow-good) !important;
        }

        .drag-drop-calendar .rbc-addons-dnd-row-body {
          position: relative;
        }

        .drag-drop-calendar .rbc-time-header {
          border-bottom: 1px solid var(--color-border-default);
        }

        .drag-drop-calendar .rbc-time-content {
          border-top: none;
        }

        .drag-drop-calendar .rbc-time-slot {
          border-top: 1px solid var(--color-border-subtle);
        }

        .drag-drop-calendar .rbc-timeslot-group {
          border-bottom: 1px solid var(--color-border-default);
        }

        .drag-drop-calendar .rbc-time-gutter {
          color: var(--color-text-tertiary);
          font-size: 0.75rem;
          font-family: var(--font-mono);
        }

        .drag-drop-calendar .rbc-current-time-indicator {
          background-color: var(--data-poor);
        }

        .drag-drop-calendar .rbc-show-more {
          color: var(--color-interactive-primary);
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Dark mode adjustments */
        .v2[data-theme='dark'] .drag-drop-calendar .rbc-day-bg {
          background-color: var(--color-bg-surface);
        }

        .v2[data-theme='dark'] .drag-drop-calendar .rbc-addons-dnd-drag-preview {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default DragDropCalendar;
