/**
 * Dashboard layout orchestrator.
 * Composes all dashboard sections with staggered entrance animations.
 * Sections: Hero → Stats Grid → Recent Workouts → PR Highlights → Team Context (conditional).
 */

import { motion } from 'motion/react';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';
import { HeroSection } from './HeroSection';
import { QuickStatsGrid } from './QuickStatsGrid';
import { RecentWorkouts } from './RecentWorkouts';
import { PRHighlights } from './PRHighlights';
import { TeamContext } from './TeamContext';
import type { DashboardData, TeamContextData } from '../types';

interface DashboardContentProps {
  data: DashboardData;
  userName: string;
  teamContext: TeamContextData | null;
}

export function DashboardContent({ data, userName, teamContext }: DashboardContentProps) {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-20 md:pb-6">
      <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <HeroSection userName={userName} streak={data.stats.streak} />
        </motion.div>

        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <QuickStatsGrid stats={data.stats} className="mt-6" />
        </motion.div>

        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <RecentWorkouts
            workouts={data.workouts.items}
            totalCount={data.workouts.totalCount}
            className="mt-8"
          />
        </motion.div>

        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <PRHighlights records={data.prs.records} className="mt-8" />
        </motion.div>

        {teamContext && (
          <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
            <TeamContext teamContext={teamContext} className="mt-8" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
