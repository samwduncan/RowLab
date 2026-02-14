/**
 * Reusable trend chart for profile Overview tab.
 * Supports area chart (volume/frequency) and stacked bar chart (sport breakdown).
 * Uses design-system CSS variables for all colors.
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts';

import type { TrendBucket } from '../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const COPPER = 'var(--color-accent-copper)';
const GRID_COLOR = 'var(--color-ink-border)';
const TICK_COLOR = 'var(--color-ink-tertiary)';

/** Sport color mapping for stacked bar segments */
const SPORT_COLORS: Record<string, string> = {
  RowErg: 'var(--color-accent-copper)',
  SkiErg: 'var(--color-data-good)',
  BikeErg: 'var(--color-data-warning)',
  Running: 'var(--color-data-excellent)',
  Strength: 'var(--color-data-poor)',
  Other: 'var(--color-ink-tertiary)',
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface TrendChartProps {
  data: TrendBucket[];
  dataKey: 'meters' | 'workouts';
  type: 'area' | 'stacked-bar';
  label?: string;
}

/* ------------------------------------------------------------------ */
/* Formatters                                                          */
/* ------------------------------------------------------------------ */

function formatWeekLabel(week: string): string {
  // 'YYYY-Www' -> 'Www' for compact display
  return week.split('-')[1] ?? week;
}

function formatKValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                      */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-ink-raised border border-ink-border rounded-lg shadow-card p-2.5 min-w-[120px]">
      <p className="text-ink-tertiary text-[10px] uppercase tracking-wider mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-sm text-ink-primary">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {typeof entry.value === 'number' ? formatKValue(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TrendChart                                                          */
/* ------------------------------------------------------------------ */

export function TrendChart({ data, dataKey, type, label }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-ink-raised rounded-xl border border-ink-border p-4">
        {label && (
          <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">
            {label}
          </p>
        )}
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-ink-tertiary">No trend data available</p>
        </div>
      </div>
    );
  }

  // Extract unique sport keys for stacked bar
  const sportKeys =
    type === 'stacked-bar' ? Array.from(new Set(data.flatMap((b) => Object.keys(b.byType)))) : [];

  return (
    <div className="bg-ink-raised rounded-xl border border-ink-border p-4">
      {label && (
        <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">{label}</p>
      )}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeekLabel}
                tick={{ fontSize: 10, fill: TICK_COLOR }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatKValue}
                tick={{ fontSize: 10, fill: TICK_COLOR }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                name={dataKey === 'meters' ? 'Volume' : 'Workouts'}
                stroke={COPPER}
                strokeWidth={2}
                fill={COPPER}
                fillOpacity={0.15}
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeekLabel}
                tick={{ fontSize: 10, fill: TICK_COLOR }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatKValue}
                tick={{ fontSize: 10, fill: TICK_COLOR }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              {sportKeys.map((sport) => (
                <Bar
                  key={sport}
                  dataKey={`byType.${sport}`}
                  name={sport}
                  stackId="sport"
                  fill={SPORT_COLORS[sport] ?? SPORT_COLORS.Other}
                  radius={
                    sportKeys.indexOf(sport) === sportKeys.length - 1 ? [2, 2, 0, 0] : undefined
                  }
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
