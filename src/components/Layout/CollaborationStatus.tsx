import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface CollaborationStatusProps {
  /** Current connection state */
  state: ConnectionState;
  /** Whether sync is required (out of date) */
  syncRequired?: boolean;
  /** Callback to trigger sync/reconnect */
  onReconnect?: () => void;
  /** Show minimal (dot only) or full indicator */
  variant?: 'minimal' | 'full';
}

/**
 * CollaborationStatus - Connection status indicator
 *
 * Precision Instrument design:
 * - Subtle status indicator with appropriate colors
 * - Minimal variant: just a colored dot
 * - Full variant: icon + text with hover tooltip
 * - Action button for reconnect when needed
 */
export function CollaborationStatus({
  state,
  syncRequired = false,
  onReconnect,
  variant = 'minimal',
}: CollaborationStatusProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Status configurations
  const statusConfig = {
    connected: {
      color: 'bg-success-green',
      textColor: 'text-success-green',
      icon: Wifi,
      label: 'Connected',
      description: 'Real-time sync active',
    },
    connecting: {
      color: 'bg-blade-blue',
      textColor: 'text-blade-blue',
      icon: RefreshCw,
      label: 'Connecting',
      description: 'Establishing connection...',
    },
    disconnected: {
      color: 'bg-text-muted',
      textColor: 'text-text-muted',
      icon: WifiOff,
      label: 'Offline',
      description: 'Click to reconnect',
    },
    error: {
      color: 'bg-danger-red',
      textColor: 'text-danger-red',
      icon: AlertTriangle,
      label: 'Connection Error',
      description: 'Unable to connect',
    },
  };

  const config = statusConfig[state];
  const Icon = config.icon;

  // Handle click outside to close tooltip
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => {
            if (state === 'disconnected' || state === 'error') {
              onReconnect?.();
            } else {
              setShowTooltip(!showTooltip);
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center justify-center"
          aria-label={config.label}
        >
          <div className={`w-2 h-2 rounded-full ${config.color} ${state === 'connecting' ? 'animate-pulse' : ''}`} />
          {syncRequired && state === 'connected' && (
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-caution-yellow" />
          )}
        </button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-40 rounded-lg bg-void-surface/95 backdrop-blur-xl saturate-[180%] border border-white/[0.08] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] p-2 z-50"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={config.textColor} />
                <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
              </div>
              <p className="text-[10px] text-text-muted mt-1">{config.description}</p>
              {syncRequired && state === 'connected' && (
                <p className="text-[10px] text-caution-yellow mt-1">Changes pending sync</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (state === 'disconnected' || state === 'error') {
            onReconnect?.();
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center gap-2 h-8 px-2 rounded-lg border transition-all duration-fast
          ${state === 'connected'
            ? 'bg-success-green/10 border-success-green/20 text-success-green'
            : state === 'connecting'
            ? 'bg-blade-blue/10 border-blade-blue/20 text-blade-blue'
            : state === 'error'
            ? 'bg-danger-red/10 border-danger-red/20 text-danger-red cursor-pointer hover:bg-danger-red/20'
            : 'bg-white/[0.02] border-white/[0.06] text-text-muted cursor-pointer hover:bg-white/[0.04]'
          }
        `}
        aria-label={config.label}
        disabled={state === 'connected' || state === 'connecting'}
      >
        <Icon
          size={14}
          className={state === 'connecting' ? 'animate-spin' : ''}
        />
        <span className="text-xs font-medium">{config.label}</span>
        {syncRequired && state === 'connected' && (
          <div className="w-1.5 h-1.5 rounded-full bg-caution-yellow" />
        )}
      </button>

      {/* Tooltip for full variant */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-void-surface/95 backdrop-blur-xl saturate-[180%] border border-white/[0.08] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] p-3 z-50"
          >
            <p className="text-xs text-text-secondary">{config.description}</p>
            {syncRequired && state === 'connected' && (
              <button
                onClick={onReconnect}
                className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-caution-yellow bg-caution-yellow/10 border border-caution-yellow/20 rounded-md hover:bg-caution-yellow/20 transition-colors"
              >
                <RefreshCw size={12} />
                Sync Now
              </button>
            )}
            {(state === 'disconnected' || state === 'error') && (
              <button
                onClick={onReconnect}
                className={`
                  mt-2 w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${state === 'error'
                    ? 'text-danger-red bg-danger-red/10 border border-danger-red/20 hover:bg-danger-red/20'
                    : 'text-blade-blue bg-blade-blue/10 border border-blade-blue/20 hover:bg-blade-blue/20'
                  }
                `}
              >
                <RefreshCw size={12} />
                Reconnect
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollaborationStatus;
