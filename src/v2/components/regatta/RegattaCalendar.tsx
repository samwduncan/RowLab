import { useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Regatta } from '../../types/regatta';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup localizer (same pattern as training calendar)
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday start
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  regatta: Regatta;
};

type RegattaCalendarProps = {
  regattas: Regatta[];
  onSelectRegatta: (regatta: Regatta) => void;
  onSelectDate?: (date: Date) => void;
};

export function RegattaCalendar({
  regattas,
  onSelectRegatta,
  onSelectDate,
}: RegattaCalendarProps) {
  // Convert regattas to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return regattas.map(regatta => {
      const start = parseISO(regatta.date);
      // For multi-day, use endDate; otherwise same day
      const end = regatta.endDate ? parseISO(regatta.endDate) : start;

      return {
        id: regatta.id,
        title: regatta.name,
        start,
        end,
        regatta,
      };
    });
  }, [regattas]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectRegatta(event.regatta);
    },
    [onSelectRegatta]
  );

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      onSelectDate?.(start);
    },
    [onSelectDate]
  );

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const isMultiDay = event.regatta.endDate && event.regatta.endDate !== event.regatta.date;
    return {
      style: {
        backgroundColor: isMultiDay ? 'var(--accent-primary)' : 'var(--accent-secondary, #6366f1)',
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '0.875rem',
        padding: '2px 6px',
      },
    };
  }, []);

  return (
    <div className="h-[600px] regatta-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK]}
        defaultView={Views.MONTH}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
        className="v2-calendar"
      />

      {/* Custom styles to match V2 design */}
      <style>{`
        .regatta-calendar .rbc-calendar {
          background: var(--surface-default);
          color: var(--txt-primary);
          border-radius: 8px;
          overflow: hidden;
        }

        .regatta-calendar .rbc-header {
          background: var(--surface-elevated);
          border-color: var(--bdr-default);
          padding: 8px;
          font-weight: 500;
        }

        .regatta-calendar .rbc-off-range-bg {
          background: var(--surface-sunken);
        }

        .regatta-calendar .rbc-today {
          background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.1);
        }

        .regatta-calendar .rbc-event {
          cursor: pointer;
        }

        .regatta-calendar .rbc-event:hover {
          opacity: 0.9;
          transform: scale(1.02);
          transition: all 0.15s ease;
        }

        .regatta-calendar .rbc-toolbar {
          background: var(--surface-elevated);
          padding: 12px;
          border-bottom: 1px solid var(--bdr-default);
          margin-bottom: 0;
        }

        .regatta-calendar .rbc-toolbar button {
          background: var(--surface-default);
          border: 1px solid var(--bdr-default);
          color: var(--txt-primary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .regatta-calendar .rbc-toolbar button:hover {
          background: var(--surface-hover);
        }

        .regatta-calendar .rbc-toolbar button.rbc-active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .regatta-calendar .rbc-month-view,
        .regatta-calendar .rbc-time-view {
          border: 1px solid var(--bdr-default);
          border-radius: 0 0 8px 8px;
        }

        .regatta-calendar .rbc-day-bg,
        .regatta-calendar .rbc-time-slot {
          border-color: var(--bdr-subtle);
        }

        .regatta-calendar .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
        }

        .regatta-calendar .rbc-show-more {
          color: var(--accent-primary);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
