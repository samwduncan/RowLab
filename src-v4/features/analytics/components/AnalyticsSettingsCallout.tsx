/**
 * AnalyticsSettingsCallout -- subtle banner prompting users to configure
 * their analytics thresholds (max HR, LTHR, FTP) for more accurate data.
 *
 * Shows when the user hasn't set any custom analytics settings.
 * One-time dismissible via localStorage.
 */

import { useState, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_SMOOTH } from '@/lib/animations';

const DISMISSED_KEY = 'analytics-settings-dismissed';

interface AnalyticsSettingsCalloutProps {
  hasCustomSettings: boolean;
}

export function AnalyticsSettingsCallout({ hasCustomSettings }: AnalyticsSettingsCalloutProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Storage full or unavailable -- ignore
    }
  }, []);

  const visible = !hasCustomSettings && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={SPRING_SMOOTH}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-ink-border bg-ink-raised px-4 py-3 flex items-center gap-3 mb-4">
            <Settings className="w-4 h-4 text-accent-copper shrink-0" />
            <p className="text-sm text-ink-secondary flex-1">
              Set your max heart rate, lactate threshold, and FTP in{' '}
              <Link
                to={'/settings' as string}
                className="text-accent-copper hover:text-accent-copper/80 font-medium transition-colors"
              >
                Settings
              </Link>{' '}
              for more accurate analytics.
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-md text-ink-muted hover:text-ink-secondary hover:bg-ink-border/50 transition-colors shrink-0"
              aria-label="Dismiss analytics settings callout"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
