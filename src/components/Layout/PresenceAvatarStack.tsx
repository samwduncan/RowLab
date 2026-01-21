import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import type { PresenceUser } from '@/types';

interface PresenceAvatarStackProps {
  /** Array of currently connected users */
  users: PresenceUser[];
  /** Maximum number of avatars to display before overflow */
  maxDisplay?: number;
  /** Current user ID to exclude from display */
  currentUserId?: string;
  /** Connection status */
  isConnected?: boolean;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * PresenceAvatarStack - Shows active collaborators with stacked avatars
 *
 * Precision Instrument design:
 * - Overlapping circular avatars with colored borders
 * - User initials as fallback
 * - Overflow indicator (+N) for many users
 * - Hover tooltip with user names
 * - Subtle animation on join/leave
 */
export function PresenceAvatarStack({
  users,
  maxDisplay = 4,
  currentUserId,
  isConnected = false,
  onClick,
}: PresenceAvatarStackProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter out current user
  const otherUsers = users.filter((u) => u.id !== currentUserId);

  // Split into displayed and overflow
  const displayedUsers = otherUsers.slice(0, maxDisplay);
  const overflowCount = otherUsers.length - maxDisplay;

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if no other users
  if (otherUsers.length === 0 && isConnected) {
    return (
      <div className="flex items-center gap-2 h-9 px-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-text-muted">
        <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
        <span className="text-xs">Connected</span>
      </div>
    );
  }

  if (otherUsers.length === 0) {
    return null;
  }

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => {
          setShowTooltip(!showTooltip);
          onClick?.();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center h-9 px-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-fast"
        aria-label={`${otherUsers.length} collaborator${otherUsers.length !== 1 ? 's' : ''} online`}
      >
        {/* Connection status dot */}
        <div className={`w-2 h-2 mr-2 rounded-full ${isConnected ? 'bg-success-green animate-pulse' : 'bg-text-muted'}`} />

        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          <AnimatePresence mode="popLayout">
            {displayedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="relative"
                style={{ zIndex: displayedUsers.length - index }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-void-deep"
                  style={{
                    backgroundColor: `${user.color}20`,
                    borderColor: user.color,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    color: user.color,
                  }}
                >
                  {getInitials(user.name)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Overflow indicator */}
          {overflowCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-7 h-7 rounded-full bg-void-elevated border-2 border-white/10 flex items-center justify-center text-[10px] font-medium text-text-secondary ring-2 ring-void-deep"
              style={{ zIndex: 0 }}
            >
              +{overflowCount}
            </motion.div>
          )}
        </div>

        {/* User count */}
        <span className="ml-2 text-xs text-text-muted">
          <Users size={12} className="inline mr-1" />
          {otherUsers.length}
        </span>
      </button>

      {/* Tooltip with user list */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-void-surface/95 backdrop-blur-xl saturate-[180%] border border-white/[0.08] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {otherUsers.length} Collaborator{otherUsers.length !== 1 ? 's' : ''} Online
              </p>
            </div>

            {/* User list */}
            <div className="max-h-48 overflow-y-auto py-1">
              {otherUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: `${user.color}20`,
                      borderColor: user.color,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      color: user.color,
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                    {user.activeBoatId && (
                      <p className="text-[10px] text-text-muted truncate">
                        Working on boat
                      </p>
                    )}
                  </div>
                  {/* Active indicator */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: user.color }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PresenceAvatarStack;
