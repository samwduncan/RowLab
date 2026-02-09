import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UploadSimple,
  Users,
  Calendar,
  Barbell,
  Trophy,
  Rows,
  Target,
} from '@phosphor-icons/react';
import { getShortcutByAction } from '@v2/lib/keyboardShortcuts';

export interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  category: 'athletes' | 'training' | 'performance' | 'gamification' | 'navigation';
  keywords: string[];
  shortcut?: string; // Display key like "⌘ N"
  onSelect: () => void;
}

/**
 * Hook providing all available command palette actions
 * Returns actions with navigation handlers and keyboard shortcuts
 */
export function useCommandActions(): CommandAction[] {
  const navigate = useNavigate();

  const actions: CommandAction[] = [
    // Athletes
    {
      id: 'create_athlete',
      label: 'Create athlete',
      icon: UserPlus,
      category: 'athletes',
      keywords: ['create', 'new', 'athlete', 'add', 'roster'],
      shortcut: getShortcutByAction('create_athlete')?.displayKeys,
      onSelect: () => navigate('/app/athletes?action=create'),
    },
    {
      id: 'import_athletes',
      label: 'Import athletes',
      icon: UploadSimple,
      category: 'athletes',
      keywords: ['import', 'csv', 'bulk', 'upload', 'athletes'],
      onSelect: () => navigate('/app/athletes?action=import'),
    },
    {
      id: 'view_roster',
      label: 'View roster',
      icon: Users,
      category: 'athletes',
      keywords: ['roster', 'athletes', 'list', 'team'],
      onSelect: () => navigate('/app/athletes'),
    },

    // Training
    {
      id: 'start_practice',
      label: 'Start practice',
      icon: Calendar,
      category: 'training',
      keywords: ['practice', 'session', 'start', 'training', 'workout'],
      shortcut: getShortcutByAction('start_practice')?.displayKeys,
      onSelect: () => navigate('/app/training/sessions?action=create'),
    },
    {
      id: 'log_attendance',
      label: 'Log attendance',
      icon: Calendar,
      category: 'training',
      keywords: ['attendance', 'log', 'practice', 'present', 'absent'],
      onSelect: () => navigate('/app/attendance'),
    },
    {
      id: 'create_workout',
      label: 'Create workout',
      icon: Calendar,
      category: 'training',
      keywords: ['workout', 'create', 'training', 'plan'],
      onSelect: () => navigate('/app/training?action=create'),
    },

    // Performance
    {
      id: 'log_erg_test',
      label: 'Log erg test',
      icon: Barbell,
      category: 'performance',
      keywords: ['erg', 'test', 'log', 'result', '2k', '6k', 'performance'],
      shortcut: getShortcutByAction('log_erg_test')?.displayKeys,
      onSelect: () => navigate('/app/erg-tests?action=create'),
    },

    // Gamification
    {
      id: 'create_challenge',
      label: 'Create challenge',
      icon: Target,
      category: 'gamification',
      keywords: ['challenge', 'create', 'competition', 'goal'],
      onSelect: () => navigate('/app/challenges?action=create'),
    },
    {
      id: 'view_achievements',
      label: 'View achievements',
      icon: Trophy,
      category: 'gamification',
      keywords: ['achievements', 'badges', 'awards', 'milestones'],
      onSelect: () => navigate('/app/achievements'),
    },

    // Navigation
    {
      id: 'go_dashboard',
      label: 'Go to dashboard',
      icon: Calendar,
      category: 'navigation',
      keywords: ['dashboard', 'home', 'overview'],
      onSelect: () => navigate('/app'),
    },
    {
      id: 'go_lineup_builder',
      label: 'Go to lineup builder',
      icon: Rows,
      category: 'navigation',
      keywords: ['lineup', 'builder', 'boats', 'crew'],
      onSelect: () => navigate('/app/coach/lineup-builder'),
    },
  ];

  return actions;
}
