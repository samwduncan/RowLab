// ---- Full-page Skeleton Loader for AthleteDetailPage ----

/**
 * Full-page skeleton for the AthleteDetailPage loading state.
 * Mimics the two-column layout: hero, sparkline, heatmap, timeline (left)
 * and edit card, actions, achievements (right).
 * Uses animate-pulse with theme-aware colors.
 */
export function ProfileSkeletonLoader() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-bg-hover" />
        <div className="h-4 w-2 rounded bg-bg-hover" />
        <div className="h-4 w-32 rounded bg-bg-hover" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero section skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-bg-hover shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 rounded bg-bg-hover" />
                <div className="flex gap-2">
                  <div className="h-4 w-16 rounded bg-bg-hover" />
                  <div className="h-4 w-14 rounded bg-bg-hover" />
                  <div className="h-4 w-10 rounded bg-bg-hover" />
                </div>
              </div>
            </div>
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="rounded-lg bg-bg-hover h-20" />
              ))}
            </div>
          </div>

          {/* Erg Sparkline skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-3">
            <div className="h-4 w-24 rounded bg-bg-hover" />
            <div className="h-[160px] rounded-lg bg-bg-hover" />
            {/* Erg tests table skeleton */}
            <div className="space-y-2 mt-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-10 rounded bg-bg-hover" />
              ))}
            </div>
          </div>

          {/* Attendance heatmap skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-3">
            <div className="h-4 w-20 rounded bg-bg-hover" />
            <div className="h-[140px] rounded-lg bg-bg-hover" />
          </div>

          {/* Activity timeline skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-3">
            <div className="h-4 w-28 rounded bg-bg-hover" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-bg-hover shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 rounded bg-bg-hover" />
                  <div className="h-3 w-1/4 rounded bg-bg-hover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Edit card skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-4">
            <div className="h-4 w-20 rounded bg-bg-hover" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 rounded bg-bg-hover" />
                <div className="h-9 w-full rounded bg-bg-hover" />
              </div>
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-3">
            <div className="h-4 w-24 rounded bg-bg-hover" />
            <div className="flex gap-2">
              <div className="flex-1 h-10 rounded-lg bg-bg-hover" />
              <div className="flex-1 h-10 rounded-lg bg-bg-hover" />
            </div>
          </div>

          {/* Achievements skeleton */}
          <div className="rounded-xl bg-bg-surface border border-bdr-subtle p-6 space-y-3">
            <div className="h-4 w-24 rounded bg-bg-hover" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-[120px] rounded-lg bg-bg-hover" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeletonLoader;
