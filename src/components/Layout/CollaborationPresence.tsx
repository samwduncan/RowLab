import { PresenceAvatarStack } from './PresenceAvatarStack';
import { CollaborationStatus } from './CollaborationStatus';
import type { PresenceUser } from '@/types';

interface CollaborationPresenceProps {
  /** Array of currently connected users */
  users: PresenceUser[];
  /** Current user ID to exclude from display */
  currentUserId?: string;
  /** Connection status */
  isConnected: boolean;
  /** Whether sync is required */
  syncRequired?: boolean;
  /** Callback for reconnect */
  onReconnect?: () => void;
  /** Show/hide component (feature flag) */
  enabled?: boolean;
}

/**
 * CollaborationPresence - Combined presence and status indicator
 *
 * This component combines PresenceAvatarStack and CollaborationStatus
 * into a single unit for easy integration into TopNav.
 *
 * Features:
 * - Shows connected collaborators with stacked avatars
 * - Shows connection status
 * - Handles reconnect actions
 * - Can be entirely hidden via enabled prop
 */
export function CollaborationPresence({
  users,
  currentUserId,
  isConnected,
  syncRequired = false,
  onReconnect,
  enabled = true,
}: CollaborationPresenceProps) {
  // Don't render if feature is disabled
  if (!enabled) {
    return null;
  }

  // Filter out current user
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const hasCollaborators = otherUsers.length > 0;

  // Determine connection state
  const connectionState = isConnected ? 'connected' : 'disconnected';

  return (
    <div className="flex items-center gap-2">
      {/* Avatar stack when there are collaborators */}
      {hasCollaborators ? (
        <PresenceAvatarStack
          users={users}
          currentUserId={currentUserId}
          isConnected={isConnected}
          maxDisplay={3}
        />
      ) : isConnected ? (
        /* Show minimal status when connected but alone */
        <CollaborationStatus
          state={connectionState}
          syncRequired={syncRequired}
          onReconnect={onReconnect}
          variant="minimal"
        />
      ) : (
        /* Show full status when disconnected */
        <CollaborationStatus
          state={connectionState}
          syncRequired={syncRequired}
          onReconnect={onReconnect}
          variant="full"
        />
      )}
    </div>
  );
}

export default CollaborationPresence;
