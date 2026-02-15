/**
 * IntegrationCard -- reusable card for integration status display.
 *
 * Ported from v2 IntegrationCard with v4 Canvas design tokens:
 * - Surface: bg-ink-base, border-ink-border
 * - Text: text-ink-primary, text-ink-secondary, text-ink-tertiary
 * - Primary button: bg-accent-copper, text-ink-deep
 * - Error/disconnect: data-poor tokens
 * - Connected badge: accent-copper (or custom accentColor)
 */
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { IntegrationCardProps } from './types';

/**
 * Format a date string as "Jan 25, 2026 at 10:30 AM"
 */
function formatLastSynced(dateString: string): string {
  const date = new Date(dateString);
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Last synced: ${dateFormatter.format(date)} at ${timeFormatter.format(date)}`;
}

export function IntegrationCard({
  icon,
  iconBg,
  title,
  description,
  connected,
  username,
  lastSynced,
  statsLine,
  onConnect,
  onDisconnect,
  onSync,
  syncLoading = false,
  connectLoading = false,
  disconnectLoading = false,
  connectLabel = 'Connect',
  accentColor = 'text-accent-copper',
}: IntegrationCardProps) {
  return (
    <div className="glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon Container */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>

        {/* Title and Status */}
        <div className="min-w-0">
          <h4 className="font-medium text-ink-primary">{title}</h4>
          {connected ? (
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${accentColor} shrink-0`} />
                <span className={`text-sm ${accentColor} truncate`}>
                  Connected{username ? ` as ${username}` : ''}
                </span>
              </div>
              {lastSynced && (
                <p className="text-xs text-ink-tertiary truncate">{formatLastSynced(lastSynced)}</p>
              )}
              {statsLine && <p className="text-xs text-ink-secondary">{statsLine}</p>}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
        {connected ? (
          <>
            {/* Sync Now Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={syncLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-well border border-ink-border text-ink-secondary hover:bg-ink-raised hover:border-ink-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </button>
            )}

            {/* Disconnect Button */}
            <button
              onClick={onDisconnect}
              disabled={disconnectLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-data-poor/10 border border-data-poor/20 text-data-poor hover:bg-data-poor/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disconnectLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </button>
          </>
        ) : (
          /* Connect Button */
          <button
            onClick={onConnect}
            disabled={connectLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-copper text-ink-deep font-medium hover:bg-accent-copper-hover hover:shadow-glow-copper transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              connectLabel
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default IntegrationCard;
