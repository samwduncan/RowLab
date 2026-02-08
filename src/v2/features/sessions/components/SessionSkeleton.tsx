import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * SessionsListSkeleton - Loading skeleton for SessionsPage (list view)
 *
 * Matches the session list layout:
 * - Header bar with breadcrumbs and new session button
 * - Session cards with type badge, title, date, status, piece count
 *
 * Uses react-loading-skeleton with theme-aware CSS custom properties.
 */

interface SessionsListSkeletonProps {
  /** Number of session cards to show */
  cardCount?: number;
  className?: string;
}

export function SessionsListSkeleton({ cardCount = 5, className = '' }: SessionsListSkeletonProps) {
  return (
    <SkeletonTheme baseColor="var(--color-bg-surface)" highlightColor="var(--color-bg-hover)">
      <div className={`p-6 space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton height={14} width={120} />
            <Skeleton height={28} width={140} style={{ marginTop: 8 }} />
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border border-bdr-default rounded-lg overflow-hidden">
              <Skeleton height={36} width={36} />
              <Skeleton height={36} width={36} />
            </div>
            <Skeleton height={40} width={140} borderRadius={8} />
          </div>
        </div>

        {/* Session cards */}
        <div className="space-y-3">
          {Array.from({ length: cardCount }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}

/**
 * SessionCardSkeleton - Single session card in list
 */
function SessionCardSkeleton() {
  return (
    <div className="bg-bg-surface-elevated rounded-lg border border-bdr-default p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type badge */}
          <Skeleton height={26} width={48} borderRadius={4} />
          {/* Session info */}
          <div>
            <Skeleton height={18} width={180} />
            <Skeleton height={14} width={130} style={{ marginTop: 4 }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <Skeleton height={26} width={70} borderRadius={4} />
          {/* Chevron */}
          <Skeleton circle width={20} height={20} />
        </div>
      </div>
    </div>
  );
}

/**
 * SessionDetailSkeleton - Loading skeleton for SessionDetailPage
 *
 * Matches the session detail layout:
 * - Breadcrumbs
 * - Session info card (title, type, status, date, pieces)
 * - Pieces list grouped by segment
 */

interface SessionDetailSkeletonProps {
  className?: string;
}

export function SessionDetailSkeleton({ className = '' }: SessionDetailSkeletonProps) {
  return (
    <SkeletonTheme baseColor="var(--color-bg-surface)" highlightColor="var(--color-bg-hover)">
      <div className={`p-6 space-y-6 ${className}`}>
        {/* Breadcrumbs */}
        <Skeleton height={14} width={240} />

        {/* Session info card */}
        <div className="bg-bg-surface-elevated rounded-lg border border-bdr-default p-6">
          <div className="flex items-start justify-between">
            <div>
              {/* Title + badges */}
              <div className="flex items-center gap-3 mb-2">
                <Skeleton height={28} width={220} />
                <Skeleton height={24} width={50} borderRadius={4} />
                <Skeleton height={24} width={70} borderRadius={4} />
              </div>
              {/* Metadata row */}
              <div className="flex items-center gap-4">
                <Skeleton height={16} width={100} />
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={70} />
              </div>
              {/* Notes */}
              <Skeleton height={14} width={300} style={{ marginTop: 12 }} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Skeleton height={40} width={110} borderRadius={8} />
              <Skeleton height={40} width={40} borderRadius={8} />
              <Skeleton height={40} width={40} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* Pieces section */}
        <div className="space-y-4">
          <Skeleton height={22} width={140} />

          {/* Segment groups */}
          {['Warmup', 'Main Set', 'Cooldown'].map((segment) => (
            <div key={segment} className="space-y-2">
              <Skeleton height={14} width={80} />
              <div className="space-y-2">
                {Array.from({ length: segment === 'Main Set' ? 3 : 1 }).map((_, i) => (
                  <PieceCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}

/**
 * PieceCardSkeleton - Single session piece card
 */
function PieceCardSkeleton() {
  return (
    <div className="bg-bg-surface-elevated rounded-lg border border-bdr-default p-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height={16} width={160} />
          <Skeleton height={14} width={220} style={{ marginTop: 4 }} />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton height={14} width={50} />
          <Skeleton height={14} width={80} />
          <Skeleton height={14} width={50} />
        </div>
      </div>
    </div>
  );
}
