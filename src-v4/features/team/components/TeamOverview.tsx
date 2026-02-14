/**
 * Team Overview tab: Strava-style 3-column layout.
 *
 * Desktop (lg+): [Stats sidebar 280px] [Activity feed flex-1] [Announcements sidebar 280px]
 * Mobile: stacked -- stats, announcements, then feed.
 *
 * Coach view: tool link cards, inline announcement compose.
 * Athlete view: upcoming team events focus (placeholder for events system).
 */
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
  Users,
  Dumbbell,
  Calendar,
  Gauge,
  ClipboardList,
  Ship,
  Megaphone,
  Pin,
  Send,
} from 'lucide-react';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';
import { formatNumber } from '@/lib/format';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTeamData } from '../hooks/useTeamData';
import { useCreateAnnouncement } from '../hooks/useTeamMutations';
import { isCoachOrAbove } from '../types';
import { TeamActivityFeed } from './TeamActivityFeed';
import type { TeamDetail, Announcement } from '../types';

interface TeamOverviewProps {
  team: TeamDetail;
}

export function TeamOverview({ team }: TeamOverviewProps) {
  const isDesktop = useIsDesktop();
  const { overview, announcements } = useTeamData(team.id);
  const isCoach = isCoachOrAbove(team.role);

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const recentAnnouncements = announcements.filter((a) => !a.isPinned).slice(0, 5);

  if (isDesktop) {
    return (
      <motion.div
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 flex gap-6"
      >
        {/* Left sidebar: stats + tools */}
        <motion.div
          variants={listItemVariants}
          transition={SPRING_SMOOTH}
          className="w-72 shrink-0 space-y-4"
        >
          <StatsPanel overview={overview} memberCount={team.memberCount} />
          {isCoach && <CoachTools teamIdentifier={team.slug || team.generatedId} />}
        </motion.div>

        {/* Center: activity feed */}
        <motion.div
          variants={listItemVariants}
          transition={SPRING_SMOOTH}
          className="min-w-0 flex-1"
        >
          {isCoach && <AnnouncementCompose teamId={team.id} />}
          {!isCoach && <UpcomingEventsPlaceholder />}
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
              Recent Activity
            </h3>
            <TeamActivityFeed teamId={team.id} compact />
          </div>
        </motion.div>

        {/* Right sidebar: announcements */}
        <motion.div
          variants={listItemVariants}
          transition={SPRING_SMOOTH}
          className="w-72 shrink-0 space-y-4"
        >
          <AnnouncementsSidebar pinned={pinnedAnnouncements} recent={recentAnnouncements} />
        </motion.div>
      </motion.div>
    );
  }

  // Mobile/tablet: stacked layout
  return (
    <motion.div
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      className="mt-4 space-y-6"
    >
      <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
        <StatsPanel overview={overview} memberCount={team.memberCount} />
      </motion.div>

      {isCoach && (
        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <AnnouncementCompose teamId={team.id} />
        </motion.div>
      )}

      <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
        <AnnouncementsSidebar pinned={pinnedAnnouncements} recent={recentAnnouncements} />
      </motion.div>

      {!isCoach && (
        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          <UpcomingEventsPlaceholder />
        </motion.div>
      )}

      <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
          Recent Activity
        </h3>
        <TeamActivityFeed teamId={team.id} compact />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats Panel                                                         */
/* ------------------------------------------------------------------ */

function StatsPanel({
  overview,
  memberCount,
}: {
  overview: { totalMeters: number; activeMembers: number; workoutsThisWeek: number };
  memberCount: number;
}) {
  const stats = [
    { icon: Gauge, label: 'Total Meters', value: formatNumber(overview.totalMeters) },
    { icon: Users, label: 'Members', value: String(memberCount) },
    { icon: Users, label: 'Active Members', value: String(overview.activeMembers) },
    { icon: Dumbbell, label: 'Workouts This Week', value: String(overview.workoutsThisWeek) },
  ];

  return (
    <GlassCard padding="md" as="section">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-ink-muted">
        Team Stats
      </h3>
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-well">
                <Icon size={16} className="text-accent-copper" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-muted">{stat.label}</p>
                <p className="text-sm font-semibold tabular-nums text-ink-primary">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Coach Tool Cards                                                    */
/* ------------------------------------------------------------------ */

function CoachTools({ teamIdentifier }: { teamIdentifier: string }) {
  const navigate = useNavigate();

  const tools = [
    {
      icon: ClipboardList,
      label: 'Lineup Builder',
      desc: 'Build and manage race lineups',
      route: `/team/${teamIdentifier}/coach/lineup-builder`,
    },
    {
      icon: Ship,
      label: 'Fleet',
      desc: 'Manage boats and equipment',
      route: `/team/${teamIdentifier}/coach/fleet`,
    },
    {
      icon: Calendar,
      label: 'Practice Schedule',
      desc: 'Plan and schedule practices',
      route: `/team/${teamIdentifier}/coach/schedule`,
    },
  ];

  return (
    <GlassCard padding="md" as="section">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-ink-muted">
        Coach Tools
      </h3>
      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              onClick={() => navigate({ to: tool.route as string })}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-ink-well/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-well">
                <Icon size={16} className="text-accent-copper" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-primary">{tool.label}</p>
                <p className="text-xs text-ink-muted">{tool.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Announcement Compose (Coach only)                                   */
/* ------------------------------------------------------------------ */

function AnnouncementCompose({ teamId }: { teamId: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const createMutation = useCreateAnnouncement(teamId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setIsExpanded(false);
        },
      }
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-ink-well/60 p-4 text-left transition-colors hover:border-accent-copper/40 hover:bg-ink-well/30"
      >
        <Megaphone size={18} className="text-ink-muted" />
        <span className="text-sm text-ink-muted">Post an announcement...</span>
      </button>
    );
  }

  return (
    <GlassCard padding="md" as="section">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-accent-copper" />
          <h3 className="text-sm font-medium text-ink-primary">New Announcement</h3>
        </div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg bg-ink-well/50 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:ring-1 focus:ring-accent-copper/50"
          autoFocus
        />
        <textarea
          placeholder="Write your announcement..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg bg-ink-well/50 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:ring-1 focus:ring-accent-copper/50"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || createMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-accent-copper px-3 py-1.5 text-sm font-medium text-ink-deep transition-colors hover:bg-accent-copper/90 disabled:opacity-50"
          >
            <Send size={14} />
            Post
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Announcements Sidebar                                               */
/* ------------------------------------------------------------------ */

function AnnouncementsSidebar({
  pinned,
  recent,
}: {
  pinned: Announcement[];
  recent: Announcement[];
}) {
  if (pinned.length === 0 && recent.length === 0) {
    return (
      <GlassCard padding="md" as="section">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
          Announcements
        </h3>
        <p className="text-sm text-ink-tertiary">No announcements yet.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {pinned.length > 0 && (
        <GlassCard padding="md" as="section">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-ink-muted">
            <Pin size={14} />
            Pinned
          </h3>
          <div className="space-y-3">
            {pinned.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </GlassCard>
      )}
      {recent.length > 0 && (
        <GlassCard padding="md" as="section">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            Recent
          </h3>
          <div className="space-y-3">
            {recent.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const dateStr = new Date(announcement.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border-b border-ink-well/40 pb-3 last:border-0 last:pb-0">
      <p className="text-sm font-medium text-ink-primary">{announcement.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-ink-secondary">{announcement.content}</p>
      <p className="mt-1.5 text-xs text-ink-tertiary">
        {announcement.authorName} &middot; {dateStr}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Upcoming Events Placeholder (Athlete view)                          */
/* ------------------------------------------------------------------ */

function UpcomingEventsPlaceholder() {
  return (
    <GlassCard padding="md" as="section">
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
        Upcoming Team Events
      </h3>
      <div className="flex items-center gap-3 rounded-lg bg-ink-well/30 p-4">
        <Calendar size={20} className="text-ink-muted" />
        <div>
          <p className="text-sm text-ink-secondary">No upcoming events scheduled.</p>
          <p className="text-xs text-ink-tertiary">
            Your coach will post events and practice schedules here.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
