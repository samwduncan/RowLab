import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface ELODataPoint {
  date: string;
  elo: number;
}

export interface ELOSparklineProps {
  data: ELODataPoint[];
  width?: number;
  height?: number;
}

/**
 * ELOSparkline - Inline trend visualization for athlete ELO history
 *
 * Displays a compact AreaChart showing ELO progression with trend indicator.
 * Uses recharts AreaChart (not LineChart) per Phase 28-04 decision for
 * better readability at small sizes with gradient fill.
 */
export function ELOSparkline({ data, width = 80, height = 30 }: ELOSparklineProps) {
  // Resolve CSS variable colors for chart (recharts needs hex strings)
  const chartColors = useMemo(
    () => ({
      line:
        getComputedStyle(document.documentElement).getPropertyValue('--data-good').trim() ||
        '#3B82F6',
    }),
    []
  );

  // Calculate trend: compare first vs last data point
  const trend = useMemo(() => {
    if (data.length < 2) return 'neutral';
    const first = data[0].elo;
    const last = data[data.length - 1].elo;
    const diff = last - first;
    if (diff > 10) return 'up';
    if (diff < -10) return 'down';
    return 'neutral';
  }, [data]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-[var(--data-excellent)]'
      : trend === 'down'
        ? 'text-[var(--data-poor)]'
        : 'text-[var(--ink-muted)]';

  if (data.length === 0) {
    return <span className="text-xs text-txt-tertiary">—</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.line} stopOpacity={0.3} />
              <stop offset="100%" stopColor={chartColors.line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="elo"
            stroke={chartColors.line}
            strokeWidth={1.5}
            fill="url(#eloGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
    </div>
  );
}
