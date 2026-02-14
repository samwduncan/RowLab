/**
 * ProfileHero -- Strava-style hero banner with avatar, stats, and team badges.
 *
 * Stub: full implementation in Task 3.
 */
import type { ProfileData, StatsData } from '../types';

interface ProfileHeroProps {
  profile: ProfileData;
  stats: StatsData;
}

export function ProfileHero({ profile, stats }: ProfileHeroProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h1 className="text-2xl font-display font-semibold text-ink-primary">{profile.name}</h1>
      {profile.bio && <p className="text-ink-secondary mt-1">{profile.bio}</p>}
      <div className="flex gap-4 mt-3 text-sm text-ink-tertiary">
        <span>{stats.allTime.totalMeters.toLocaleString()}m total</span>
        <span>{stats.allTime.workoutCount} workouts</span>
        <span>{stats.streak.current} day streak</span>
      </div>
    </div>
  );
}
