import { Upload, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  useC2SyncConfig,
  useUpdateC2SyncConfig,
  useSyncC2ToStrava,
} from '@v2/hooks/useIntegrations';

/**
 * Toggle switch component for sync settings
 */
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function Toggle({ enabled, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base
        ${enabled ? 'bg-interactive-primary' : 'bg-bg-surface-elevated'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${enabled ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

/**
 * C2StravaSync - Concept2 to Strava sync configuration
 *
 * Only shown when both C2 and Strava are connected.
 *
 * Features:
 * - Master toggle: "Auto-Upload to Strava"
 * - Warning banner if !hasWriteScope (need to reconnect Strava)
 * - Activity type toggles (when enabled and hasWriteScope)
 * - Manual sync button with loading state
 * - Sync results display
 */
export function C2StravaSync() {
  // Hooks for C2 sync configuration
  const { config, isEnabled, hasWriteScope, isLoading } = useC2SyncConfig();
  const { updateConfig, isUpdating } = useUpdateC2SyncConfig();
  const { sync: syncToStrava, isSyncing, syncResult } = useSyncC2ToStrava();

  /**
   * Handle master toggle change
   */
  const handleToggleEnabled = (enabled: boolean) => {
    updateConfig({ enabled });
  };

  /**
   * Handle activity type toggle change
   */
  const handleTypeToggle = (type: string, enabled: boolean) => {
    if (!config) return;
    updateConfig({
      types: {
        ...config.types,
        [type]: enabled,
      },
    });
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
            <Upload className="w-4 h-4 text-interactive-primary" />
          </div>
          <h3 className="text-lg font-semibold text-txt-primary">Concept2 to Strava Sync</h3>
        </div>
        <div className="p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-txt-tertiary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
          <Upload className="w-4 h-4 text-interactive-primary" />
        </div>
        <h3 className="text-lg font-semibold text-txt-primary">Concept2 to Strava Sync</h3>
      </div>

      <div className="space-y-4">
        {/* Write permission warning */}
        {!hasWriteScope && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
            <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-status-warning">
                Strava Write Permission Required
              </p>
              <p className="text-xs text-txt-secondary mt-1">
                To upload workouts to Strava, please disconnect and reconnect Strava to grant
                upload permission.
              </p>
            </div>
          </div>
        )}

        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-interactive-primary/20 border border-interactive-primary/30 flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <h4 className="font-medium text-txt-primary">Auto-Upload to Strava</h4>
              <p className="text-sm text-txt-secondary">
                Post Concept2 workouts to your Strava feed
              </p>
            </div>
          </div>
          <Toggle
            enabled={isEnabled}
            onChange={handleToggleEnabled}
            disabled={!hasWriteScope || isUpdating}
          />
        </div>

        {/* Activity type toggles */}
        {isEnabled && hasWriteScope && config?.availableTypes && (
          <div className="p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
            <h4 className="text-sm font-medium text-txt-primary mb-3">Activity Types to Sync</h4>
            <div className="space-y-3">
              {Object.entries(config.availableTypes).map(([type, info]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-txt-secondary">{info.label}</span>
                    <span className="text-xs text-txt-tertiary">→ {info.stravaType}</span>
                  </div>
                  <Toggle
                    enabled={config.types?.[type] || false}
                    onChange={(enabled) => handleTypeToggle(type, enabled)}
                    disabled={isUpdating}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual sync button */}
        {isEnabled && hasWriteScope && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
            <div>
              <p className="text-sm text-txt-secondary">Sync unsent workouts now</p>
              {config?.lastSyncedAt && (
                <p className="text-xs text-txt-tertiary mt-1">
                  Last sync: {new Date(config.lastSyncedAt).toLocaleDateString()} at{' '}
                  {new Date(config.lastSyncedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <button
              onClick={() => syncToStrava()}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-interactive-primary text-txt-inverse border border-interactive-primary hover:bg-interactive-hover hover:shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Sync to Strava
                </>
              )}
            </button>
          </div>
        )}

        {/* Sync results */}
        {syncResult && (
          <div className="p-4 rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-status-success" />
              <span className="font-medium text-txt-primary">
                Uploaded {syncResult.synced} workout{syncResult.synced !== 1 ? 's' : ''} to Strava
              </span>
            </div>
            {syncResult.skipped > 0 && (
              <p className="text-xs text-txt-tertiary">
                {syncResult.skipped} skipped (disabled type or already uploaded)
              </p>
            )}
            {syncResult.failed > 0 && (
              <p className="text-xs text-status-error">{syncResult.failed} failed to upload</p>
            )}
          </div>
        )}

        <p className="text-sm text-txt-secondary">
          Automatically post your Concept2 erg workouts to Strava. Choose which activity types to
          sync.
        </p>
      </div>
    </section>
  );
}

export default C2StravaSync;
