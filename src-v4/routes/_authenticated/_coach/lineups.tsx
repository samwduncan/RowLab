/**
 * Lineup Builder placeholder route.
 * Will be replaced by the full implementation in 50-03.
 */
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/_coach/lineups')({
  component: () => (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-ink-primary">Lineup Builder</h1>
      <p className="mt-2 text-ink-secondary">Coming in Phase 50-03.</p>
    </div>
  ),
});
