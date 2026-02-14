/**
 * Single activity event in the team feed.
 *
 * Layout: [Avatar circle] [Event description] [Timestamp]
 * Event type determines icon, color, and text formatting.
 */
import {
  UserPlus,
  UserMinus,
  Shield,
  Megaphone,
  Sparkles,
  Settings,
  Link2,
  Dumbbell,
  Trophy,
  Medal,
  CheckCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActivityEvent, ActivityEventType } from '../types';

interface ActivityItemProps {
  event: ActivityEvent;
}

interface EventConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  format: (event: ActivityEvent) => string;
}

const EVENT_CONFIG: Record<ActivityEventType, EventConfig> = {
  member_joined: {
    icon: UserPlus,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} joined the team`,
  },
  member_left: {
    icon: UserMinus,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} left the team`,
  },
  role_changed: {
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    format: (e) => {
      const data = e.data as { newRole?: string } | null;
      const role = data?.newRole ?? 'a new role';
      return `${e.actorName ?? 'Someone'} was assigned ${role}`;
    },
  },
  announcement: {
    icon: Megaphone,
    color: 'text-accent-copper',
    bgColor: 'bg-accent-copper/10',
    format: (e) => {
      const truncated = e.title.length > 60 ? e.title.slice(0, 57) + '...' : e.title;
      return `${e.actorName ?? 'Someone'} posted: ${truncated}`;
    },
  },
  team_created: {
    icon: Sparkles,
    color: 'text-accent-copper',
    bgColor: 'bg-accent-copper/10',
    format: () => 'Team created',
  },
  team_updated: {
    icon: Settings,
    color: 'text-ink-secondary',
    bgColor: 'bg-ink-well',
    format: () => 'Team settings updated',
  },
  invite_generated: {
    icon: Link2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} generated an invite code`,
  },
  workout: {
    icon: Dumbbell,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    format: (e) => {
      const data = e.data as { distance?: number; type?: string } | null;
      const distance = data?.distance ? `${data.distance}m` : '';
      const type = data?.type ?? '';
      const suffix = [distance, type].filter(Boolean).join(' ');
      return `${e.actorName ?? 'Someone'} logged${suffix ? ` ${suffix}` : ' a workout'}`;
    },
  },
  pr: {
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} set a new PR`,
  },
  session_completed: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} completed a training session`,
  },
  achievement_unlocked: {
    icon: Medal,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    format: (e) => `${e.actorName ?? 'Someone'} unlocked an achievement`,
  },
};

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityItem({ event }: ActivityItemProps) {
  const config = EVENT_CONFIG[event.type] ?? {
    icon: Settings,
    color: 'text-ink-muted',
    bgColor: 'bg-ink-well',
    format: (e: ActivityEvent) => e.title,
  };

  const Icon = config.icon;
  const description = config.format(event);
  const timeAgo = getTimeAgo(event.createdAt);

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-ink-well/30">
      {/* Actor avatar or event icon */}
      {event.actorAvatarUrl ? (
        <img
          src={event.actorAvatarUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
        >
          <Icon size={14} className={config.color} />
        </div>
      )}

      {/* Description */}
      <p className="min-w-0 flex-1 text-sm text-ink-secondary">
        {event.actorName && <span className="font-medium text-ink-primary">{event.actorName}</span>}
        {event.actorName ? description.replace(event.actorName, '') : description}
      </p>

      {/* Timestamp */}
      <time
        dateTime={event.createdAt}
        className="shrink-0 text-xs tabular-nums text-ink-tertiary"
        title={new Date(event.createdAt).toLocaleString()}
      >
        {timeAgo}
      </time>
    </div>
  );
}
