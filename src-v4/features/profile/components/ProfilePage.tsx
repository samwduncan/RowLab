/**
 * ProfilePage -- top-level orchestrator for the profile feature.
 *
 * Fetches profile and stats data, renders the hero section,
 * tab bar, and active tab content. Tab state is read from
 * URL search params via the route module.
 */
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';

import { profileQueryOptions, profileStatsQueryOptions } from '../api';
import { ProfileHero } from './ProfileHero';
import { ProfileTabs } from './ProfileTabs';
import { fadeIn } from '@/lib/animations';
import { Route } from '@/routes/_authenticated/profile';
import type { ProfileTab } from '../types';

export function ProfilePage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();

  const { data: profile } = useQuery(profileQueryOptions());
  const { data: stats } = useQuery(profileStatsQueryOptions());

  const handleTabChange = (newTab: string) => {
    void navigate({
      to: '/profile',
      search: { tab: newTab as ProfileTab },
    });
  };

  if (!profile || !stats) return null;

  return (
    <motion.div className="max-w-4xl mx-auto" {...fadeIn}>
      <ProfileHero profile={profile} stats={stats} />
      <ProfileTabs activeTab={tab} onTabChange={handleTabChange} />

      {/* Tab content */}
      <div className="px-4 py-6" role="tabpanel" aria-label={`${tab} tab content`}>
        {tab === 'overview' && (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-ink-secondary text-sm">Overview tab content coming in Plan 03.</p>
          </div>
        )}
        {tab === 'training-log' && (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-ink-secondary text-sm">
              Training Log tab content coming in Plan 03.
            </p>
          </div>
        )}
        {tab === 'prs' && (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-ink-secondary text-sm">PRs tab content coming in Plan 04.</p>
          </div>
        )}
        {tab === 'achievements' && (
          <div className="glass rounded-xl p-6 text-center">
            <p className="text-ink-secondary text-sm">
              Achievements tab content coming in Plan 04.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
