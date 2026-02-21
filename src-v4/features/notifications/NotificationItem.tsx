/**
 * NotificationItem: individual notification row in the dropdown panel.
 *
 * Shows icon (based on type), title, body (2 lines max), relative timestamp,
 * unread indicator (copper left border), and dismiss button on hover.
 */
import { useState } from 'react';
import { X, Info, Mail, Users, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from './api';

const typeIcons: Record<string, typeof Info> = {
  system: Info,
  invite: Mail,
  team: Users,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onNavigate?: (url: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onNavigate,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUnread = !notification.readAt;
  const Icon = typeIcons[notification.type] ?? Bell;
  const targetUrl = notification.metadata?.targetUrl as string | undefined;

  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  function handleClick() {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (targetUrl && onNavigate) {
      onNavigate(targetUrl);
    }
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    onDismiss(notification.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-void-overlay ${
        isUnread ? 'border-l-2 border-accent-teal' : 'border-l-2 border-transparent'
      }`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Type icon */}
      <div
        className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${
          isUnread ? 'bg-accent-teal/10 text-accent-teal' : 'bg-void-raised text-text-faint'
        }`}
      >
        <Icon size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            isUnread ? 'font-medium text-text-bright' : 'text-text-default'
          }`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-faint">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-[11px] text-text-faint">{relativeTime}</p>
      </div>

      {/* Dismiss button (visible on hover) */}
      {isHovered && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded p-1 text-text-faint transition-colors hover:bg-void-raised hover:text-text-bright"
          aria-label="Dismiss notification"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
