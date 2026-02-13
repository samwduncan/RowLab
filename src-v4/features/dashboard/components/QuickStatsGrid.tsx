/**
 * Quick stats grid — 4 animated stat cards in responsive layout.
 * Displays total meters, workout count, active days, and current streak.
 */

import { motion } from 'motion/react';
import type { Variant } from 'motion/react';
import { Waves, Dumbbell, CalendarDays, Flame } from 'lucide-react';
import { StatCard } from './StatCard';
import type { StatsData } from '../types';
import { formatNumber } from '@/lib/format';

interface QuickStatsGridProps {
  stats: StatsData;
  className?: string;
}

const containerVariants: Record<string, Variant> = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Record<string, Variant> = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function QuickStatsGrid({ stats, className = '' }: QuickStatsGridProps) {
  const { allTime, streak } = stats;

  return (
    <motion.div
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Waves}
          label="Total Meters"
          value={allTime.totalMeters}
          formattedValue={formatNumber(allTime.totalMeters)}
          footnote="All time"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Dumbbell}
          label="Workouts"
          value={allTime.workoutCount}
          footnote="All time"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatCard
          icon={CalendarDays}
          label="Active Days"
          value={allTime.activeDays}
          footnote="All time"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={streak.current}
          footnote={streak.longest > 0 ? `Best: ${streak.longest} days` : undefined}
        />
      </motion.div>
    </motion.div>
  );
}
