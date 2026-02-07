import { Lock, Award } from 'lucide-react';
import { useAthleteAchievements } from '../../../../hooks/useAchievements';
import type { AchievementWithProgress } from '../../../../types/gamification';

// ---- Types ----

export interface AchievementsSectionProps {
  athleteId: string;
  gamificationEnabled: boolean;
}

// ---- Rarity Colors (Phase 16 professional palette) ----

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Common: {
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
  },
  Rare: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  Epic: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  Legendary: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
};

function getRarityColors(rarity: string): { bg: string; border: string; text: string } {
  return RARITY_COLORS[rarity] ?? RARITY_COLORS['Common']!;
}

// ---- Badge Card ----

interface BadgeCardProps {
  achievement: AchievementWithProgress;
  compact?: boolean;
}

function BadgeCard({ achievement, compact }: BadgeCardProps) {
  const colors = getRarityColors(achievement.rarity);
  const isUnlocked = achievement.isUnlocked;

  return (
    <div
      className={`
        relative rounded-lg border p-3
        ${isUnlocked ? `${colors.bg} ${colors.border}` : 'bg-bg-surface/40 border-bdr-subtle'}
        ${compact ? 'min-w-[140px]' : ''}
        transition-colors
      `}
    >
      {/* Lock overlay for locked badges */}
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-lg bg-bg-base/40 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Lock className="h-4 w-4 text-txt-tertiary" />
        </div>
      )}

      {/* Badge content */}
      <div className="flex flex-col items-center text-center gap-1.5">
        {/* Icon */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg
            ${isUnlocked ? colors.bg : 'bg-bg-hover'}
          `}
        >
          {achievement.icon || (
            <Award className={`h-4 w-4 ${isUnlocked ? colors.text : 'text-txt-tertiary'}`} />
          )}
        </div>

        {/* Name */}
        <span
          className={`text-xs font-medium leading-tight line-clamp-2 ${
            isUnlocked ? 'text-txt-primary' : 'text-txt-tertiary'
          }`}
        >
          {achievement.name}
        </span>

        {/* Rarity tag */}
        <span className={`text-[9px] font-medium uppercase tracking-wider ${colors.text}`}>
          {achievement.rarity}
        </span>

        {/* Progress bar (for locked badges with partial progress) */}
        {!isUnlocked && achievement.percentComplete > 0 && (
          <div className="w-full mt-1">
            <div className="h-1 w-full rounded-full bg-bg-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-interactive-primary/60 transition-all"
                style={{ width: `${Math.min(100, achievement.percentComplete)}%` }}
              />
            </div>
            <span className="text-[9px] text-txt-tertiary mt-0.5 block">
              {Math.round(achievement.percentComplete)}%
            </span>
          </div>
        )}

        {/* Earned date */}
        {isUnlocked && achievement.unlockedAt && (
          <span className="text-[9px] text-txt-tertiary">
            {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  );
}

// ---- Skeleton ----

function AchievementsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="min-w-[140px] h-[120px] rounded-lg bg-bg-hover" />
        ))}
      </div>
    </div>
  );
}

// ---- Component ----

export function AchievementsSection({ athleteId, gamificationEnabled }: AchievementsSectionProps) {
  const { achievements, isLoading } = useAthleteAchievements(athleteId);

  if (!gamificationEnabled) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          Achievements
        </h4>
        <div className="py-6 text-center border border-dashed border-bdr-subtle rounded-lg">
          <Award className="h-5 w-5 text-txt-tertiary mx-auto mb-2" />
          <span className="text-xs text-txt-tertiary">
            Achievements are disabled. Enable in settings.
          </span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          Achievements
        </h4>
        <AchievementsSkeleton />
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          Achievements
        </h4>
        <div className="py-6 text-center border border-dashed border-bdr-subtle rounded-lg">
          <Award className="h-5 w-5 text-txt-tertiary mx-auto mb-2" />
          <span className="text-xs text-txt-tertiary">No achievements yet</span>
        </div>
      </div>
    );
  }

  // Split into unlocked and locked
  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);

  // Recent achievements: last 5 unlocked, sorted by unlock date
  const recent = [...unlocked]
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Recent Achievements (horizontal scroll) */}
      {recent.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
            Recent Achievements
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {recent.map((achievement) => (
              <BadgeCard key={achievement.id} achievement={achievement} compact />
            ))}
          </div>
        </div>
      )}

      {/* All Badges Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          All Badges
          <span className="ml-1.5 text-txt-tertiary font-normal">
            ({unlocked.length}/{achievements.length})
          </span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {/* Show unlocked first, then locked */}
          {[...unlocked, ...locked].map((achievement) => (
            <BadgeCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AchievementsSection;
