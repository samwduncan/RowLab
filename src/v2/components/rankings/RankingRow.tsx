import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { SPRING_CONFIG } from '../../utils/animations';
import { RankingTrendChart } from './RankingTrendChart';

export type RankingRowProps = {
  rank: number;
  teamName: string;
  speed: number | null;
  boatClass: string;
  previousRank?: number | null;
  sampleCount?: number;
  isHighlighted?: boolean;
  isOwnTeam?: boolean;
  trendData?: Array<{ date: string; speed: number }>;
  lastUpdated?: string;
  onClick?: () => void;
};

export function RankingRow({
  rank,
  teamName,
  speed,
  boatClass: _boatClass,
  previousRank,
  sampleCount = 0,
  isHighlighted = false,
  isOwnTeam = false,
  trendData,
  lastUpdated,
  onClick,
}: RankingRowProps) {
  const rankChange = previousRank ? previousRank - rank : 0;
  const hasImproved = rankChange > 0;
  const hasDropped = rankChange < 0;

  const getConfidenceColor = () => {
    if (sampleCount >= 10) return 'bg-data-excellent shadow-[0_0_6px_rgba(34,197,94,0.4)]';
    if (sampleCount >= 5) return 'bg-data-warning shadow-[0_0_6px_rgba(245,158,11,0.4)]';
    return 'bg-data-poor shadow-[0_0_6px_rgba(239,68,68,0.4)]';
  };

  const RankBadge = () => {
    if (rank === 1)
      return (
        <div className="w-8 h-8 rounded-lg bg-data-warning/[0.12] flex items-center justify-center ring-1 ring-data-warning/20">
          <Trophy className="w-4 h-4 text-data-warning" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center ring-1 ring-white/[0.08]">
          <Medal className="w-4 h-4 text-ink-body" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="w-8 h-8 rounded-lg bg-accent-copper/[0.08] flex items-center justify-center ring-1 ring-accent-copper/15">
          <Award className="w-4 h-4 text-accent-copper" />
        </div>
      );
    return (
      <span className="text-sm font-mono font-bold text-ink-muted tabular-nums w-8 text-center">
        {rank}
      </span>
    );
  };

  return (
    <motion.div
      layout
      transition={SPRING_CONFIG}
      initial={isHighlighted ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } : false}
      animate={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
      className={`group flex items-center gap-4 px-5 py-3 cursor-pointer
                  border-b border-accent-copper/10 last:border-b-0
                  hover:bg-accent-copper/[0.03] transition-colors duration-150
                  ${isOwnTeam ? 'bg-accent-copper/[0.03]' : ''}`}
      onClick={onClick}
    >
      {/* Rank */}
      <div className="w-10 flex justify-center flex-shrink-0">
        <RankBadge />
      </div>

      {/* Rank change indicator */}
      <div className="w-14 flex items-center gap-1 flex-shrink-0">
        {hasImproved && (
          <>
            <TrendingUp className="w-3.5 h-3.5 text-data-excellent" />
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-data-excellent/[0.10] text-data-excellent tabular-nums">
              +{rankChange}
            </span>
          </>
        )}
        {hasDropped && (
          <>
            <TrendingDown className="w-3.5 h-3.5 text-data-poor" />
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-data-poor/[0.10] text-data-poor tabular-nums">
              {rankChange}
            </span>
          </>
        )}
        {!hasImproved && !hasDropped && <Minus className="w-3.5 h-3.5 text-ink-muted" />}
      </div>

      {/* Team name */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate text-sm ${
            isOwnTeam ? 'text-accent-copper' : 'text-ink-bright'
          }`}
        >
          {teamName}
          {isOwnTeam && (
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent-copper/60">
              Your Team
            </span>
          )}
        </p>
      </div>

      {/* Speed estimate */}
      {speed !== null && (
        <div className="text-right flex-shrink-0 w-24">
          <p className="text-sm font-mono font-semibold text-ink-primary tabular-nums">
            {speed.toFixed(3)}
            <span className="text-ink-muted ml-0.5 text-xs font-normal">m/s</span>
          </p>
        </div>
      )}

      {/* Trend sparkline */}
      {trendData && trendData.length > 0 && (
        <div className="flex-shrink-0">
          <RankingTrendChart data={trendData} width={80} height={32} />
        </div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-2 flex-shrink-0 w-20 justify-center">
        <div className={`w-2 h-2 rounded-full ${getConfidenceColor()}`} />
        <span className="text-xs font-mono text-ink-tertiary tabular-nums">{sampleCount}</span>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <div
          className="text-xs text-ink-tertiary w-24 text-right flex-shrink-0 font-mono"
          title={format(parseISO(lastUpdated), 'PPp')}
        >
          {formatDistanceToNow(parseISO(lastUpdated), { addSuffix: true })}
        </div>
      )}
    </motion.div>
  );
}
