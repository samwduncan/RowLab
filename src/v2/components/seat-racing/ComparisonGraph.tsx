import { useEffect, useRef, useMemo, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useComparisonGraph } from '../../hooks/useAdvancedRankings';
import { SLIDE_PANEL_VARIANTS, SPRING_CONFIG } from '../../utils/animations';
import type { ComparisonNode, ComparisonEdge, ComparisonGap } from '../../types/advancedRanking';

interface ComparisonGraphProps {
  onNodeClick?: (athleteId: string) => void;
  onGapClick?: (gap: ComparisonGap) => void;
  showGaps?: boolean;
  height?: string;
}

export function ComparisonGraph({
  onNodeClick,
  onGapClick,
  showGaps = true,
  height = '400px',
}: ComparisonGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [selectedGap, setSelectedGap] = useState<ComparisonGap | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const { nodes, edges, gaps, statistics, isLoading, error } = useComparisonGraph();

  // Get CSS variable colors for theme awareness
  const chartColors = useMemo(
    () => ({
      excellent: getComputedStyle(document.documentElement)
        .getPropertyValue('--data-excellent')
        .trim(),
      good: getComputedStyle(document.documentElement).getPropertyValue('--data-good').trim(),
      warning: getComputedStyle(document.documentElement).getPropertyValue('--data-warning').trim(),
      poor: getComputedStyle(document.documentElement).getPropertyValue('--data-poor').trim(),
    }),
    []
  );

  // Find selected athlete's data
  const selectedAthlete = useMemo(() => {
    if (!selectedAthleteId) return null;
    return nodes.find((n) => n.athleteId === selectedAthleteId);
  }, [selectedAthleteId, nodes]);

  // Get direct comparisons for selected athlete
  const athleteComparisons = useMemo(() => {
    if (!selectedAthleteId) return [];

    const comparisons = edges
      .filter((e) => e.from === selectedAthleteId || e.to === selectedAthleteId)
      .map((edge) => {
        const isFrom = edge.from === selectedAthleteId;
        const opponentId = isFrom ? edge.to : edge.from;
        const opponent = nodes.find((n) => n.athleteId === opponentId);

        return {
          opponentName: opponent?.label || 'Unknown',
          comparisons: edge.comparisons,
          avgMargin: edge.avgMarginSeconds,
          // Approximate win rate based on margin (simple heuristic)
          winRate: isFrom
            ? edge.avgMarginSeconds < 0
              ? 0.7
              : 0.3
            : edge.avgMarginSeconds > 0
              ? 0.7
              : 0.3,
        };
      });

    return comparisons;
  }, [selectedAthleteId, edges, nodes]);

  // Format data for vis-network
  const visData = useMemo(() => {
    // Nodes with styling based on comparison count
    const formattedNodes = nodes.map((node) => ({
      id: node.athleteId,
      label: node.label,
      value: Math.max(10, node.comparisonCount * 3), // Size based on comparisons
      title: `${node.label}\n${node.comparisonCount} comparisons`,
      color: getNodeColor(node),
      font: { size: 12, color: '#1f2937' },
    }));

    // Edges with thickness based on comparison count
    const formattedEdges = edges.map((edge, idx) => ({
      id: idx,
      from: edge.from,
      to: edge.to,
      value: edge.comparisons,
      title: `${edge.comparisons} races, avg margin: ${edge.avgMarginSeconds.toFixed(1)}s`,
      color: getEdgeColor(edge),
      width: Math.min(5, 1 + edge.comparisons),
    }));

    return {
      nodes: new DataSet(formattedNodes),
      edges: new DataSet(formattedEdges),
    };
  }, [nodes, edges]);

  // Initialize network
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 15,
          max: 40,
          label: {
            enabled: true,
            min: 12,
            max: 16,
          },
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        color: { inherit: 'from' },
        smooth: {
          type: 'continuous',
        },
      },
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
        },
        stabilization: {
          iterations: 100,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
      },
    };

    const network = new Network(containerRef.current, visData, options);
    networkRef.current = network;

    // Handle node click - toggle athlete detail panel
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedId = params.nodes[0] as string;
        // Toggle: if same athlete clicked, close panel; otherwise show new athlete
        setSelectedAthleteId((prev) => (prev === clickedId ? null : clickedId));
        onNodeClick?.(clickedId);
      } else {
        // Clicked empty area - close panel
        setSelectedAthleteId(null);
      }
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [visData, onNodeClick]);

  const handleGapClick = (gap: ComparisonGap) => {
    setSelectedGap(gap);
    onGapClick?.(gap);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-bg-surface rounded-lg" style={{ height }}>
        <div className="text-txt-secondary">Loading comparison graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-bg-surface rounded-lg" style={{ height }}>
        <div style={{ color: chartColors.poor }}>Failed to load comparison graph</div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center bg-bg-surface rounded-lg" style={{ height }}>
        <div className="text-txt-secondary">No seat racing data available</div>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4">
      {/* Graph container */}
      <div className="flex-1 space-y-4">
        <div
          ref={containerRef}
          className="bg-bg-surface rounded-lg border border-bdr-default"
          style={{ height }}
        />

        {/* Statistics bar */}
        <div className="flex items-center gap-6 text-sm text-txt-secondary">
          <span>
            <span className="font-medium text-txt-primary">{statistics?.totalNodes || 0}</span>{' '}
            athletes
          </span>
          <span>
            <span className="font-medium text-txt-primary">{statistics?.totalEdges || 0}</span>{' '}
            comparisons
          </span>
          <span>
            Coverage:{' '}
            <span className="font-medium text-txt-primary">
              {((statistics?.connectivity || 0) * 100).toFixed(0)}%
            </span>
          </span>
          {statistics?.isConnected ? (
            <span style={{ color: chartColors.excellent }}>Fully connected</span>
          ) : (
            <span style={{ color: chartColors.warning }}>{statistics?.totalGaps || 0} gaps</span>
          )}
        </div>

        {/* Gaps list */}
        {showGaps && gaps.length > 0 && (
          <div className="bg-bg-surface rounded-lg p-4">
            <h4 className="text-sm font-medium text-txt-primary mb-2">
              Missing Comparisons ({gaps.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gaps.slice(0, 10).map((gap, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGapClick(gap)}
                  className="w-full text-left px-3 py-2 rounded text-sm hover:bg-bg-surface-elevated transition-colors"
                  style={{
                    backgroundColor:
                      selectedGap === gap ? `${chartColors.good}20` : 'var(--ink-raised)',
                    border:
                      selectedGap === gap
                        ? `1px solid ${chartColors.good}`
                        : '1px solid transparent',
                  }}
                >
                  <span className="text-txt-primary">
                    {gap.athlete1.firstName} {gap.athlete1.lastName}
                  </span>
                  <span className="text-txt-secondary mx-2">vs</span>
                  <span className="text-txt-primary">
                    {gap.athlete2.firstName} {gap.athlete2.lastName}
                  </span>
                  <span
                    className="ml-2 px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor:
                        gap.priority === 'high'
                          ? `${chartColors.poor}20`
                          : gap.priority === 'medium'
                            ? `${chartColors.warning}20`
                            : 'var(--ink-raised)',
                      color:
                        gap.priority === 'high'
                          ? chartColors.poor
                          : gap.priority === 'medium'
                            ? chartColors.warning
                            : 'var(--ink-secondary)',
                    }}
                  >
                    {gap.priority}
                  </span>
                </button>
              ))}
              {gaps.length > 10 && (
                <p className="text-xs text-txt-secondary text-center py-2">
                  +{gaps.length - 10} more gaps
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Athlete detail mini panel */}
      <AnimatePresence>
        {selectedAthleteId && selectedAthlete && (
          <motion.div
            key={selectedAthleteId}
            variants={{
              hidden: { x: 300, opacity: 0 },
              visible: { x: 0, opacity: 1 },
              exit: { x: 300, opacity: 0 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={SPRING_CONFIG}
            className="w-80 bg-bg-surface border border-bdr-default rounded-lg p-4 overflow-y-auto"
            style={{ height: height }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-txt-primary">{selectedAthlete.label}</h3>
                <p className="text-sm text-txt-secondary">
                  {selectedAthlete.comparisonCount} direct comparisons
                </p>
              </div>
              <button
                onClick={() => setSelectedAthleteId(null)}
                className="text-txt-secondary hover:text-txt-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Side indicator */}
            {selectedAthlete.side && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      selectedAthlete.side === 'Port'
                        ? chartColors.poor
                        : selectedAthlete.side === 'Starboard'
                          ? chartColors.excellent
                          : chartColors.good,
                  }}
                />
                <span className="text-sm text-txt-secondary">{selectedAthlete.side}</span>
              </div>
            )}

            {/* Comparison history */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-txt-primary">Direct Comparisons</h4>
              {athleteComparisons.length > 0 ? (
                athleteComparisons.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-bg-base rounded border border-bdr-default">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-txt-primary">
                        {comp.opponentName}
                      </span>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            comp.avgMargin < 0
                              ? `${chartColors.excellent}20`
                              : `${chartColors.poor}20`,
                          color: comp.avgMargin < 0 ? chartColors.excellent : chartColors.poor,
                        }}
                      >
                        {comp.avgMargin > 0 ? '+' : ''}
                        {comp.avgMargin.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-txt-secondary">
                      <span>{comp.comparisons} races</span>
                      <span>·</span>
                      <span>{(comp.winRate * 100).toFixed(0)}% win rate</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-txt-secondary italic">No direct comparisons yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions for node/edge coloring using V3 tokens
function getNodeColor(node: ComparisonNode): string {
  // Get colors from CSS variables
  const excellent = getComputedStyle(document.documentElement)
    .getPropertyValue('--data-excellent')
    .trim();
  const good = getComputedStyle(document.documentElement).getPropertyValue('--data-good').trim();
  const poor = getComputedStyle(document.documentElement).getPropertyValue('--data-poor').trim();
  const secondary = getComputedStyle(document.documentElement)
    .getPropertyValue('--ink-secondary')
    .trim();

  // Color by side
  if (node.side === 'Port') return poor;
  if (node.side === 'Starboard') return excellent;
  if (node.side === 'Cox') return good;
  return secondary;
}

function getEdgeColor(edge: ComparisonEdge): { color: string; highlight: string } {
  // Get blue color from CSS variable
  const good = getComputedStyle(document.documentElement).getPropertyValue('--data-good').trim();

  // Parse RGB from color
  const match = good.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const rgb = match ? `${match[1]}, ${match[2]}, ${match[3]}` : '59, 130, 246';

  // More comparisons = darker/more saturated
  const intensity = Math.min(1, edge.comparisons / 5);
  const baseColor = `rgba(${rgb}, ${0.3 + intensity * 0.7})`;

  return {
    color: baseColor,
    highlight: good,
  };
}

export default ComparisonGraph;
