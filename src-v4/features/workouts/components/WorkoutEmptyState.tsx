/**
 * Illustrative empty state when the user has no workouts.
 * Shows decorative icons, heading, subtext, and two CTAs:
 * "Log your first workout" (primary) and "Connect Concept2" (secondary).
 */

import { Dumbbell, Waves, Activity } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface WorkoutEmptyStateProps {
  onCreateNew: () => void;
}

/* ------------------------------------------------------------------ */
/* WorkoutEmptyState                                                   */
/* ------------------------------------------------------------------ */

export function WorkoutEmptyState({ onCreateNew }: WorkoutEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Decorative icon composition */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <Waves size={48} className="text-accent-copper/20" />
        </div>
        <div className="absolute top-1 right-2">
          <Activity size={24} className="text-accent-copper/30" />
        </div>
        <div className="absolute bottom-2 left-2">
          <Dumbbell size={28} className="text-accent-copper/25" />
        </div>
        {/* Subtle ring */}
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-ink-border" />
      </div>

      {/* Heading */}
      <h2 className="text-ink-primary text-xl font-display font-semibold mb-2">
        Your training journey starts here
      </h2>

      {/* Subtext */}
      <p className="text-ink-secondary text-sm max-w-sm mb-8">
        Log your first workout or connect your Concept2 account to automatically sync your erg
        sessions.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onCreateNew}
          className="bg-accent-copper hover:bg-accent-copper-hover text-ink-deep font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Log your first workout
        </button>
        {/* TODO(phase-48): Link to Concept2 integrations page once built */}
        <button
          type="button"
          onClick={() => {
            // Navigate to settings/integrations when available
            window.location.href = '/settings';
          }}
          className="border border-ink-border text-ink-primary hover:bg-ink-hover px-5 py-2.5 rounded-lg transition-colors"
        >
          Connect Concept2
        </button>
      </div>
    </div>
  );
}
