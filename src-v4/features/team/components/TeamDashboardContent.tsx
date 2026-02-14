/**
 * Team dashboard tab container.
 *
 * 3 tabs: Overview, Roster, Activity -- state persisted via URL search params.
 * Tab bar is sticky with glass styling and active indicator.
 * Reads team data from parent layout route loader.
 */
import { Suspense } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { TeamOverview } from './TeamOverview';
import { TeamRoster } from './TeamRoster';
import { TeamActivityFeed } from './TeamActivityFeed';
import { TeamDashboardSkeleton } from './TeamDashboardSkeleton';
import type { TeamDetail } from '../types';

const parentRoute = getRouteApi('/_authenticated/team/$identifier');
const dashboardRoute = getRouteApi('/_authenticated/team/$identifier/dashboard');

const TABS = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
  { id: 'roster' as const, label: 'Roster', icon: Users },
  { id: 'activity' as const, label: 'Activity', icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function TeamDashboardContent() {
  const { team } = parentRoute.useLoaderData() as { team: TeamDetail };
  const { tab } = dashboardRoute.useSearch();
  const navigate = useNavigate();

  const activeTab = (tab || 'overview') as TabId;

  function handleTabChange(newTab: TabId) {
    void navigate({
      to: '/team/$identifier/dashboard',
      params: { identifier: team.slug || team.generatedId },
      search: { tab: newTab },
      replace: true,
    });
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 pb-20 md:pb-6">
      {/* Team header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-primary">{team.name}</h1>
        {team.description && <p className="mt-1 text-sm text-ink-secondary">{team.description}</p>}
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 pb-4 pt-1 glass">
        <nav className="flex gap-1 rounded-xl bg-ink-well/50 p-1" role="tablist">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(t.id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="team-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-ink-raised shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div role="tabpanel" aria-label={`${activeTab} tab`}>
        <Suspense fallback={<TeamDashboardSkeleton tabOnly />}>
          {activeTab === 'overview' && <TeamOverview team={team} />}
          {activeTab === 'roster' && <TeamRoster teamId={team.id} />}
          {activeTab === 'activity' && <TeamActivityFeed teamId={team.id} />}
        </Suspense>
      </div>
    </div>
  );
}
