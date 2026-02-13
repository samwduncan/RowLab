/**
 * NotificationPanel: dropdown notification list below the bell.
 *
 * - Right-aligned, 320px wide (w-80)
 * - Header: "Notifications" + "Mark all read" action
 * - Scrollable list of NotificationItems (max-h-96)
 * - Loading: 3 skeleton notification items
 * - Empty: bell icon + "No notifications yet" message
 * - Animation: fade + slide down + scale via motion/react
 */
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  useNotificationList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
} from '@/features/notifications/useNotifications';
import { NotificationItem } from '@/features/notifications/NotificationItem';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { SPRING_SNAPPY } from '@/lib/animations';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotificationList(isOpen);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  function handleMarkRead(id: string) {
    markRead.mutate(id);
  }

  function handleDismiss(id: string) {
    dismiss.mutate(id);
  }

  function handleMarkAllRead() {
    markAllRead.mutate();
  }

  function handleNavigate(url: string) {
    navigate({ to: url });
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={SPRING_SNAPPY}
          className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-border bg-ink-float/95 shadow-card backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-accent-copper transition-colors hover:text-accent-copper-hover"
                disabled={markAllRead.isPending}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto overscroll-contain">
            {isLoading ? (
              /* Loading skeletons */
              <SkeletonGroup className="p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2.5">
                    <Skeleton width="30px" height="30px" rounded="lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton width="70%" height="14px" rounded="sm" />
                      <Skeleton width="90%" height="12px" rounded="sm" />
                      <Skeleton width="40%" height="10px" rounded="sm" />
                    </div>
                  </div>
                ))}
              </SkeletonGroup>
            ) : !notifications || notifications.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <div className="rounded-xl bg-ink-raised p-3">
                  <Bell size={24} className="text-ink-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-secondary">No notifications yet</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    We'll let you know when something happens
                  </p>
                </div>
              </div>
            ) : (
              /* Notification list */
              <div className="py-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDismiss={handleDismiss}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
