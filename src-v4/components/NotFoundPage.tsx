/**
 * 404 Not Found page shown for unmatched routes.
 * Provides navigation back to home and a styled empty state.
 */
import { Link } from '@tanstack/react-router';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-deep p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-raised border border-ink-border">
          <MapPinOff className="h-8 w-8 text-ink-muted" />
        </div>

        <h1 className="text-3xl font-bold text-ink-primary tracking-tight">Page Not Found</h1>
        <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-copper px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-copper-hover"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-ink-hover hover:text-ink-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
