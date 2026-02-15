/**
 * Athletes roster page. Shows team athletes with search, side filter,
 * and basic info (name, side, weight class, year).
 * Requires active team context (guarded by _team layout).
 */
import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Users, Search, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';

export const Route = createFileRoute('/_authenticated/_team/athletes')({
  component: AthletesPage,
  staticData: {
    breadcrumb: 'Athletes',
  },
});

interface Athlete {
  id: string;
  name: string;
  side: string | null;
  weightClass: string | null;
  year: string | null;
  status: string | null;
}

function useAthletes() {
  return useQuery<Athlete[]>({
    queryKey: ['athletes', 'list'],
    queryFn: async () => {
      const res = await api.get('/api/v1/athletes');
      return res.data.data.athletes as Athlete[];
    },
    staleTime: 120_000,
  });
}

type SideFilter = 'all' | 'Port' | 'Starboard' | 'Cox';

const SIDE_TABS: { value: SideFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Port', label: 'Port' },
  { value: 'Starboard', label: 'Starboard' },
  { value: 'Cox', label: 'Cox' },
];

function AthletesPage() {
  const { activeTeamRole } = useAuth();
  const { data: athletes = [], isLoading, error } = useAthletes();
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');

  const filtered = useMemo(() => {
    let result = athletes;
    if (sideFilter !== 'all') {
      result = result.filter((a) => a.side === sideFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    return result;
  }, [athletes, sideFilter, search]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton height="2rem" width="12rem" rounded="lg" />
        <SkeletonGroup className="gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="3.5rem" rounded="lg" />
          ))}
        </SkeletonGroup>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <GlassCard padding="lg">
          <p className="text-data-poor text-sm">Failed to load athletes. Please try again.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 pb-20 md:pb-6">
      <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-ink-muted" />
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Team</p>
          </div>
          <h1 className="text-2xl font-bold text-heading-gradient tracking-tight">
            Athletes
            {athletes.length > 0 && (
              <span className="ml-2 text-base font-normal text-ink-muted">({athletes.length})</span>
            )}
          </h1>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          variants={listItemVariants}
          transition={SPRING_SMOOTH}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-ink-well border border-ink-border pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent-copper/50"
            />
          </div>
          <div className="flex gap-1 p-1 bg-ink-well/40 rounded-xl w-fit">
            {SIDE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSideFilter(tab.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${
                    sideFilter === tab.value
                      ? 'bg-ink-raised text-ink-primary shadow-sm'
                      : 'text-ink-muted hover:text-ink-secondary'
                  }
                `.trim()}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* List */}
        {filtered.length === 0 ? (
          <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
            <EmptyState
              icon={Users}
              title={search || sideFilter !== 'all' ? 'No matching athletes' : 'No athletes yet'}
              description={
                search || sideFilter !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Athletes will appear here once they join the team.'
              }
            />
          </motion.div>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {filtered.map((athlete) => (
              <motion.div
                key={athlete.id}
                variants={listItemVariants}
                transition={SPRING_SMOOTH}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-hover transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-raised shrink-0">
                  <User className="h-4 w-4 text-ink-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-primary truncate">{athlete.name}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    {athlete.side && <span>{athlete.side}</span>}
                    {athlete.weightClass && (
                      <>
                        {athlete.side && <span className="text-ink-border">|</span>}
                        <span>{athlete.weightClass}</span>
                      </>
                    )}
                    {athlete.year && (
                      <>
                        <span className="text-ink-border">|</span>
                        <span>{athlete.year}</span>
                      </>
                    )}
                  </div>
                </div>
                {athlete.status && (
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      athlete.status === 'active'
                        ? 'bg-data-good/10 text-data-good'
                        : 'bg-ink-well text-ink-muted'
                    }`}
                  >
                    {athlete.status}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
