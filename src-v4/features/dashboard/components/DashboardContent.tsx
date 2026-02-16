/**
 * Dashboard layout orchestrator — Strava-like personal dashboard.
 *
 * Layout:
 *   Desktop: ProfileCard → InsightsBar → [Feed (2/3) | Sidebar (1/3)]
 *   Mobile:  ProfileCard → InsightsBar → Feed → Sidebar sections
 *
 * Sections: Profile → Insights → Activity Feed + Stats/PRs/Team
 */

import { motion } from 'motion/react';
import {
  dramaticContainerVariants,
  dramaticItemVariants,
  listContainerVariants,
  listItemVariants,
  SPRING_SMOOTH,
} from '@/lib/animations';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { ProfileCard } from './ProfileCard';
import { InsightsBar } from './InsightsBar';
import { RecentWorkouts } from './RecentWorkouts';
import { QuickStatsGrid } from './QuickStatsGrid';
import { PRHighlights } from './PRHighlights';
import { TeamContext } from './TeamContext';
import type { DashboardData, TeamContextData } from '../types';

interface DashboardContentProps {
  data: DashboardData;
  userName: string;
  avatar?: string | null;
  teamContext: TeamContextData | null;
}

export function DashboardContent({ data, userName, avatar, teamContext }: DashboardContentProps) {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-20 md:pb-6">
      <motion.div variants={dramaticContainerVariants} initial="hidden" animate="visible">
        {/* Profile card — full width hero */}
        <motion.div variants={dramaticItemVariants}>
          <ProfileCard
            userName={userName}
            avatar={avatar}
            teamName={teamContext?.teamName}
            stats={data.stats}
          />
        </motion.div>

        {/* Insights bar */}
        <motion.div variants={dramaticItemVariants} className="mt-4">
          <InsightsBar stats={data.stats} prs={data.prs.records} />
        </motion.div>

        {/* Two-column layout: Feed + Sidebar */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main feed column (2/3) */}
          <motion.div
            className="lg:col-span-2"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
              <RecentWorkouts
                workouts={data.workouts.items}
                totalCount={data.workouts.totalCount}
              />
            </motion.div>
          </motion.div>

          {/* Sidebar column (1/3) */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
              <QuickStatsGrid stats={data.stats} />
            </motion.div>

            <SectionDivider spacing="my-2" />

            <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
              <PRHighlights records={data.prs.records} />
            </motion.div>

            {teamContext && (
              <>
                <SectionDivider spacing="my-2" />
                <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
                  <TeamContext teamContext={teamContext} />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
