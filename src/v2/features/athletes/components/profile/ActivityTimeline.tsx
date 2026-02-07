import { useQuery } from '@tanstack/react-query';
import { Timer, CalendarCheck, Users, Trophy, Award, Activity } from 'lucide-react';
import api from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';
import type { ApiResponse } from '../../../../types/athletes';

// ---- Types ----

interface TimelineActivity {
  id: string;
  type: 'erg_test' | 'attendance' | 'lineup' | 'seat_race' | 'achievement' | 'other';
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

interface TimelineGroup {
  label: string;
  activities: TimelineActivity[];
}

export interface ActivityTimelineProps {
  athleteId: string;
}

// ---- Data Hook ----

function useAthleteActivities(athleteId: string) {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ['athlete-activities', athleteId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ activities: TimelineActivity[] }>>(
        `/api/v1/activities?athleteId=${athleteId}&limit=20`
      );
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch activities');
      }
      return response.data.data.activities;
    },
    enabled: !!athleteId && isInitialized && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

// ---- Helpers ----

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  erg_test: <Timer className="h-3.5 w-3.5" />,
  attendance: <CalendarCheck className="h-3.5 w-3.5" />,
  lineup: <Users className="h-3.5 w-3.5" />,
  seat_race: <Trophy className="h-3.5 w-3.5" />,
  achievement: <Award className="h-3.5 w-3.5" />,
  other: <Activity className="h-3.5 w-3.5" />,
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupActivities(activities: TimelineActivity[]): TimelineGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayGroup: TimelineActivity[] = [];
  const yesterdayGroup: TimelineActivity[] = [];
  const thisWeekGroup: TimelineActivity[] = [];
  const earlierGroup: TimelineActivity[] = [];

  for (const activity of activities) {
    const actDate = new Date(activity.date);
    const actDay = new Date(actDate.getFullYear(), actDate.getMonth(), actDate.getDate());

    if (actDay.getTime() >= today.getTime()) {
      todayGroup.push(activity);
    } else if (actDay.getTime() >= yesterday.getTime()) {
      yesterdayGroup.push(activity);
    } else if (actDay.getTime() >= weekAgo.getTime()) {
      thisWeekGroup.push(activity);
    } else {
      earlierGroup.push(activity);
    }
  }

  const groups: Array<[string, TimelineActivity[]]> = [
    ['Today', todayGroup],
    ['Yesterday', yesterdayGroup],
    ['This Week', thisWeekGroup],
    ['Earlier', earlierGroup],
  ];

  return groups
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, activities: items }));
}

// ---- Skeleton ----

function TimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-bg-hover shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-3/4 rounded bg-bg-hover" />
            <div className="h-3 w-1/3 rounded bg-bg-hover" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Component ----

export function ActivityTimeline({ athleteId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useAthleteActivities(athleteId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          Recent Activity
        </h4>
        <TimelineSkeleton />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
          Recent Activity
        </h4>
        <div className="py-8 text-center border border-dashed border-bdr-subtle rounded-lg">
          <Activity className="h-5 w-5 text-txt-tertiary mx-auto mb-2" />
          <span className="text-xs text-txt-tertiary">No recent activity</span>
        </div>
      </div>
    );
  }

  const groups = groupActivities(activities);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
        Recent Activity
      </h4>

      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <span className="text-[10px] font-medium text-txt-tertiary uppercase tracking-wider">
            {group.label}
          </span>

          <div className="relative pl-5">
            {/* Connecting line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-bdr-subtle" />

            {group.activities.map((activity, idx) => (
              <div key={activity.id || idx} className="relative flex gap-3 py-1.5">
                {/* Timeline dot */}
                <div className="absolute left-[-13px] top-2.5 w-[7px] h-[7px] rounded-full bg-interactive-primary ring-2 ring-bg-surface z-10" />

                {/* Icon */}
                <div className="w-7 h-7 rounded-full bg-bg-hover flex items-center justify-center text-txt-secondary shrink-0">
                  {ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.other}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-txt-primary leading-snug truncate">
                    {activity.description}
                  </p>
                  <span className="text-[10px] text-txt-tertiary">
                    {getRelativeTime(activity.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTimeline;
