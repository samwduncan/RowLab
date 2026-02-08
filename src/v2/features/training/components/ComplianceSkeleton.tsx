import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * ComplianceSkeleton - Loading skeleton for the compliance dashboard
 *
 * Matches the ComplianceDashboard layout:
 * - NCAA alert banner placeholder
 * - Summary stat cards (total hours, athletes over, athletes approaching)
 * - Tab bar (Hours / Load / Attendance)
 * - Week navigation
 * - Main content: weekly hours table with header + rows
 *
 * Uses react-loading-skeleton with theme-aware CSS custom properties.
 */

interface ComplianceSkeletonProps {
  className?: string;
}

export function ComplianceSkeleton({ className = '' }: ComplianceSkeletonProps) {
  return (
    <SkeletonTheme baseColor="var(--color-bg-surface)" highlightColor="var(--color-bg-hover)">
      <div className={`space-y-6 ${className}`}>
        {/* NCAA alert banner placeholder */}
        <div className="p-4 bg-bg-surface-elevated rounded-lg border border-bdr-default">
          <div className="flex items-center gap-3">
            <Skeleton circle width={24} height={24} />
            <Skeleton height={16} width={300} />
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-bg-surface-elevated rounded-lg border border-bdr-default"
            >
              <Skeleton height={12} width={100} style={{ marginBottom: 8 }} />
              <Skeleton height={32} width={50} />
              <Skeleton height={10} width={80} style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>

        {/* Header with week navigation */}
        <div className="flex items-center justify-between">
          <Skeleton height={24} width={180} />
          <div className="flex items-center gap-2">
            <Skeleton circle width={36} height={36} />
            <Skeleton height={20} width={140} />
            <Skeleton circle width={36} height={36} />
          </div>
        </div>

        {/* Weekly hours table */}
        <div className="bg-bg-surface-elevated rounded-lg border border-bdr-default overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-9 gap-px bg-bg-surface border-b border-bdr-default">
            <div className="p-3 col-span-2">
              <Skeleton height={14} width={60} />
            </div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="p-3 text-center">
                <Skeleton height={14} width={30} />
              </div>
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-9 gap-px border-b border-bdr-default last:border-b-0"
            >
              <div className="p-3 col-span-2 flex items-center gap-2">
                <Skeleton circle width={28} height={28} />
                <Skeleton height={14} width={100} />
              </div>
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="p-3 text-center">
                  <Skeleton height={18} width={28} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default ComplianceSkeleton;
