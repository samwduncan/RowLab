/**
 * Roster member card with avatar, name, role badge, and activity summary.
 *
 * Glass card styling with subtle hover border glow.
 * Avatar: first letter fallback if no avatarUrl.
 * Role badge: colored per role (Admin=copper, Coach=blue, Athlete=default).
 */
import { GlassCard } from '@/components/ui/GlassCard';
import { formatRelativeDate } from '@/lib/format';
import { ROLE_DISPLAY } from '../types';
import type { RosterMember } from '../types';

interface MemberCardProps {
  member: RosterMember;
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  OWNER: 'bg-accent-copper/20 text-accent-copper',
  COACH: 'bg-blue-500/20 text-blue-400',
  ATHLETE: 'bg-ink-well text-ink-secondary',
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

export function MemberCard({ member }: MemberCardProps) {
  const roleBadgeClass = ROLE_BADGE_COLORS[member.role] ?? ROLE_BADGE_COLORS.ATHLETE;
  const roleLabel = ROLE_DISPLAY[member.role] ?? member.role;
  const activityText =
    member.workoutsLast30Days > 0
      ? `${member.workoutsLast30Days} workout${member.workoutsLast30Days !== 1 ? 's' : ''} last 30d`
      : 'No recent activity';
  const lastWorkout = member.lastWorkoutDate
    ? formatRelativeDate(member.lastWorkoutDate)
    : '\u2014';

  return (
    <GlassCard hover padding="md" as="article">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-well text-sm font-semibold text-ink-secondary">
            {getInitials(member.name)}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-ink-primary">{member.name}</h4>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${roleBadgeClass}`}
            >
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

      {/* Joined */}
      <p className="mt-2 text-[11px] text-ink-tertiary">{getJoinedRelative(member.joinedAt)}</p>
    </GlassCard>
  );
}
