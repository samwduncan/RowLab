/**
 * Search registry: static entries for pages and commands used in the Cmd+K palette.
 * Pages are derived from navigation config. Commands are action entries.
 */
import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  BarChart3,
  Trophy,
  Medal,
  Users,
  ClipboardList,
  UserCheck,
  Rows3,
  Sailboat,
  Warehouse,
  Settings,
  User,
  Plus,
  ArrowLeftRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface SearchEntry {
  type: 'page' | 'command';
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  keywords: string[];
  path?: string;
  action?: () => void;
}

/* === PAGE ENTRIES === */

const pages: SearchEntry[] = [
  {
    type: 'page',
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Personal training overview',
    icon: LayoutDashboard,
    keywords: ['home', 'dashboard', 'overview', 'main'],
    path: '/',
  },
  {
    type: 'page',
    id: 'workouts',
    label: 'Workouts',
    description: 'Training log and history',
    icon: Dumbbell,
    keywords: ['workouts', 'training', 'log', 'exercise', 'erg'],
    path: '/workouts',
  },
  {
    type: 'page',
    id: 'calendar',
    label: 'Calendar',
    description: 'Training schedule',
    icon: Calendar,
    keywords: ['calendar', 'schedule', 'plan', 'date'],
    path: '/calendar',
  },
  {
    type: 'page',
    id: 'stats',
    label: 'Personal Stats',
    description: 'Performance metrics and trends',
    icon: BarChart3,
    keywords: ['stats', 'statistics', 'metrics', 'performance', 'analytics'],
    path: '/stats',
  },
  {
    type: 'page',
    id: 'prs',
    label: 'PRs',
    description: 'Personal records',
    icon: Trophy,
    keywords: ['prs', 'personal records', 'best', 'records', 'pb'],
    path: '/prs',
  },
  {
    type: 'page',
    id: 'achievements',
    label: 'Achievements',
    description: 'Badges and milestones',
    icon: Medal,
    keywords: ['achievements', 'badges', 'milestones', 'awards'],
    path: '/achievements',
  },
  {
    type: 'page',
    id: 'team',
    label: 'Team Dashboard',
    description: 'Team overview',
    icon: Users,
    keywords: ['team', 'squad', 'group', 'crew'],
    path: '/team',
  },
  {
    type: 'page',
    id: 'athletes',
    label: 'Athletes',
    description: 'Team roster',
    icon: ClipboardList,
    keywords: ['athletes', 'roster', 'members', 'rowers'],
    path: '/athletes',
  },
  {
    type: 'page',
    id: 'attendance',
    label: 'Attendance',
    description: 'Practice attendance tracking',
    icon: UserCheck,
    keywords: ['attendance', 'check-in', 'practice', 'present'],
    path: '/team/attendance',
  },
  {
    type: 'page',
    id: 'lineups',
    label: 'Lineup Builder',
    description: 'Create and manage boat lineups',
    icon: Rows3,
    keywords: ['lineup', 'builder', 'boats', 'seating', 'arrange'],
    path: '/team/coach/lineups',
  },
  {
    type: 'page',
    id: 'seat-racing',
    label: 'Seat Racing',
    description: 'Compare rower performance',
    icon: Sailboat,
    keywords: ['seat', 'racing', 'compare', 'selection'],
    path: '/team/coach/seat-racing',
  },
  {
    type: 'page',
    id: 'fleet',
    label: 'Fleet',
    description: 'Boat and equipment management',
    icon: Warehouse,
    keywords: ['fleet', 'boats', 'equipment', 'shells', 'oars'],
    path: '/team/coach/fleet',
  },
  {
    type: 'page',
    id: 'settings',
    label: 'Settings',
    description: 'App preferences',
    icon: Settings,
    keywords: ['settings', 'preferences', 'config', 'options'],
    path: '/settings',
  },
  {
    type: 'page',
    id: 'profile',
    label: 'Profile',
    description: 'Your account',
    icon: User,
    keywords: ['profile', 'account', 'me', 'user'],
    path: '/profile',
  },
];

/* === COMMAND ENTRIES (populated with actions at runtime) === */

interface CommandTemplate {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  keywords: string[];
  /** 'navigate' commands use path; 'action' commands use the action callback */
  actionType: 'navigate' | 'action';
  path?: string;
  actionKey?: string;
}

const commandTemplates: CommandTemplate[] = [
  {
    id: 'cmd-log-workout',
    label: 'Log workout',
    description: 'Record a new training session',
    icon: Plus,
    keywords: ['log', 'add', 'workout', 'new', 'record', 'training'],
    actionType: 'navigate',
    path: '/workouts/new',
  },
  {
    id: 'cmd-switch-team',
    label: 'Switch team',
    description: 'Change active team context',
    icon: ArrowLeftRight,
    keywords: ['switch', 'team', 'change', 'swap'],
    actionType: 'action',
    actionKey: 'switchTeam',
  },
  {
    id: 'cmd-settings',
    label: 'Go to settings',
    icon: Settings,
    keywords: ['settings', 'preferences', 'config'],
    actionType: 'navigate',
    path: '/settings',
  },
  {
    id: 'cmd-profile',
    label: 'View profile',
    icon: User,
    keywords: ['profile', 'account', 'me'],
    actionType: 'navigate',
    path: '/profile',
  },
  {
    id: 'cmd-logout',
    label: 'Logout',
    description: 'Sign out of RowLab',
    icon: LogOut,
    keywords: ['logout', 'sign out', 'exit', 'leave'],
    actionType: 'action',
    actionKey: 'logout',
  },
];

/**
 * Returns the full search registry with actions wired up.
 * Call this from the command palette component with navigate and action callbacks.
 */
export function getSearchRegistry(
  navigate: (path: string) => void,
  actions: Record<string, () => void>
): SearchEntry[] {
  const commands: SearchEntry[] = commandTemplates.map((tpl) => ({
    type: 'command' as const,
    id: tpl.id,
    label: tpl.label,
    description: tpl.description,
    icon: tpl.icon,
    keywords: tpl.keywords,
    action:
      tpl.actionType === 'navigate' && tpl.path
        ? () => navigate(tpl.path!)
        : tpl.actionKey && actions[tpl.actionKey]
          ? actions[tpl.actionKey]
          : undefined,
  }));

  return [...pages, ...commands];
}

/**
 * Returns only page entries (for recents / suggestions when no actions needed).
 */
export function getPageEntries(): SearchEntry[] {
  return pages;
}
