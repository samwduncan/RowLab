/**
 * Roster member card with avatar, name, prominent role badge, and activity summary.
 *
 * GlassCard with interactive hover lift.
 * Role badges: Owner=copper with crown, Admin=copper, Coach=blue, Athlete=subtle.
 * Last-active indicator: green dot if active in last 24h.
 */
import { Crown, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatRelativeDate } from '@/lib/format';
import { ROLE_DISPLAY } from '../types';
import type { RosterMember } from '../types';

interface MemberCardProps {
  member: RosterMember;
}

interface RoleBadgeConfig {
  classes: string;
  icon?: typeof Crown;
}

const ROLE_BADGE_CONFIG: Record<string, RoleBadgeConfig> = {
  OWNER: {
    classes:
      'bg-accent-copper/15 text-accent-copper border border-accent-copper/30 font-semibold px-2.5 py-1 rounded-lg text-xs',
    icon: Crown,
  },
  ADMIN: {
    classes:
      'bg-accent-copper/10 text-accent-copper border border-accent-copper/20 px-2.5 py-1 rounded-lg text-xs',
    icon: Shield,
  },
  COACH: {
    classes:
      'bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2.5 py-1 rounded-lg text-xs',
  },
  ATHLETE: {
    classes:
      'bg-ink-secondary/10 text-ink-secondary border border-ink-secondary/20 px-2.5 py-1 rounded-lg text-xs',
  },
};

const DEFAULT_BADGE: RoleBadgeConfig = {
  classes:
    'bg-ink-secondary/10 text-ink-secondary border border-ink-secondary/20 px-2.5 py-1 rounded-lg text-xs',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    return ((parts[0][0] ?? '') + (parts[parts.length - 1]![0] ?? '')).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getJoinedRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Joined today';
  if (diffDays === 1) return 'Joined yesterday';
  if (diffDays < 30) return `Joined ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Joined 1 month ago';
  if (diffMonths < 12) return `Joined ${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears === 1) return 'Joined 1 year ago';
  return `Joined ${diffYears} years ago`;
}

/**
 * Check if a workout date is within the last 24 hours.
 */
function isActiveRecently(lastWorkoutDate: string | null): boolean {
  if (!lastWorkoutDate) return false;
  const date = new Date(lastWorkoutDate);
  const now = new Date();
  return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
}

export function MemberCard({ member }: MemberCardProps) {
  const badgeConfig = ROLE_BADGE_CONFIG[member.role] ?? DEFAULT_BADGE;
  const roleLabel = ROLE_DISPLAY[member.role] ?? member.role;
  const BadgeIcon = badgeConfig.icon;
  const recentlyActive = isActiveRecently(member.lastWorkoutDate);

  const activityText =
    member.workoutsLast30Days > 0
      ? `${member.workoutsLast30Days} workout${member.workoutsLast30Days !== 1 ? 's' : ''} last 30d`
      : 'No recent activity';
  const lastWorkout = member.lastWorkoutDate
    ? formatRelativeDate(member.lastWorkoutDate)
    : '\u2014';

  return (
    <GlassCard hover interactive padding="md" as="article">
      <div className="flex items-start gap-3">
        {/* Avatar with optional active indicator */}
        <div className="relative shrink-0">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-well text-sm font-semibold text-ink-secondary">
              {getInitials(member.name)}
            </div>
          )}
          {/* Green active dot */}
          {recentlyActive && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-base bg-data-good"
              title="Active in last 24h"
            />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-ink-primary">{member.name}</h4>
            <span className={`inline-flex shrink-0 items-center gap-1 ${badgeConfig.classes}`}>
              {BadgeIcon && <BadgeIcon size={11} />}
              {roleLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{member.email}</p>
        </div>
      </div>

      {/* Activity summary */}
      <div className="mt-3 flex items-center justify-between border-t border-ink-well/40 pt-3">
        <span className="text-xs text-ink-secondary">{activityText}</span>
        <span className="text-xs text-ink-tertiary">Last: {lastWorkout}</span>
      </div>

      {/* Joined + active status */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-ink-tertiary">{getJoinedRelative(member.joinedAt)}</p>
        {recentlyActive && (
          <span className="text-[11px] font-medium text-data-good">Active today</span>
        )}
      </div>
    </GlassCard>
  );
}
