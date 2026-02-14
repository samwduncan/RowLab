/**
 * LiveSessionPage - Live training session with real-time erg dashboard.
 *
 * Shows pulsing LIVE indicator and End Session button when session is ACTIVE.
 * Socket.IO connects lazily only when session status is ACTIVE.
 * States: loading skeleton, not-active warning, active with live dashboard.
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Square, Radio } from 'lucide-react';

import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { sessionDetailOptions, useEndSession } from '../api';
import { LiveErgDashboard } from './LiveErgDashboard';
import { useSocket } from '../hooks/useSocket';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function LiveSkeleton() {
  return (
    <SkeletonGroup className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton height="0.75rem" width="2rem" rounded="sm" />
        <Skeleton height="1rem" width="4rem" rounded="sm" />
        <Skeleton height="2rem" width="14rem" rounded="sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-ink-raised border border-ink-border rounded-lg p-4 space-y-3">
            <Skeleton height="0.875rem" width="8rem" rounded="sm" />
            <Skeleton height="2rem" width="5rem" rounded="sm" className="mx-auto" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton height="0.75rem" width="4rem" rounded="sm" />
              <Skeleton height="0.75rem" width="4rem" rounded="sm" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LiveSessionPageProps {
  sessionId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LiveSessionPage({ sessionId }: LiveSessionPageProps) {
  const navigate = useNavigate();
  const [confirmEnd, setConfirmEnd] = useState(false);

  const { data: session, isLoading, error } = useQuery(sessionDetailOptions(sessionId));

  const isActive = session?.status === 'ACTIVE';
  const { isConnected, ergData, sessionEnded } = useSocket(sessionId, isActive);
  const endMutation = useEndSession();

  // If session ended via Socket.IO event, navigate to detail
  useEffect(() => {
    if (sessionEnded) {
      void navigate({ to: '/training/sessions/$sessionId', params: { sessionId } });
    }
  }, [sessionEnded, navigate, sessionId]);

  const handleBack = useCallback(() => {
    void navigate({ to: '/training/sessions/$sessionId', params: { sessionId } });
  }, [navigate, sessionId]);

  const handleEndSession = useCallback(async () => {
    if (!confirmEnd) {
      setConfirmEnd(true);
      // Auto-dismiss confirm after 3 seconds
      setTimeout(() => setConfirmEnd(false), 3000);
      return;
    }
    await endMutation.mutateAsync(sessionId);
    void navigate({ to: '/training/sessions/$sessionId', params: { sessionId } });
  }, [confirmEnd, endMutation, sessionId, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <LiveSkeleton />
      </div>
    );
  }

  // Error / not found
  if (error || !session) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => void navigate({ to: '/training/sessions' })}
          className="flex items-center gap-1 text-sm text-ink-secondary hover:text-ink-primary transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Back to Sessions
        </button>
        <p className="text-ink-secondary text-sm">Session not found.</p>
      </div>
    );
  }

  // Not active state
  if (!isActive) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-ink-secondary hover:text-ink-primary transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Back to Session
        </button>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
          <p className="text-sm font-medium text-amber-400 mb-2">Session Not Currently Active</p>
          <p className="text-sm text-ink-secondary mb-4">
            This session is not currently active. The live dashboard is only available for active
            sessions.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ink-border text-sm text-ink-secondary hover:text-ink-primary hover:bg-ink-hover transition-colors"
          >
            <ChevronLeft size={14} />
            View Session Details
          </button>
        </div>
      </div>
    );
  }

  // Get target pace from first MAIN piece
  const mainPiece = session.pieces.find((p) => p.segment === 'MAIN');
  const targetPace = mainPiece?.targetSplit ?? null;

  return (
    <div className="h-full flex flex-col">
      {/* Header with live indicator */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-4 border-b border-ink-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back */}
              <button
                type="button"
                onClick={handleBack}
                className="text-ink-secondary hover:text-ink-primary transition-colors flex-shrink-0"
                aria-label="Back to session"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Pulsing LIVE indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  LIVE
                </span>
              </div>

              <div className="hidden sm:block h-5 w-px bg-ink-border/30" />

              {/* Session name */}
              <h1 className="text-lg sm:text-xl font-semibold text-ink-primary truncate">
                {session.name}
              </h1>
            </div>

            {/* End Session button */}
            <button
              type="button"
              onClick={handleEndSession}
              disabled={endMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                confirmEnd
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
              } disabled:opacity-50`}
            >
              <Square size={14} />
              {confirmEnd ? 'Confirm End Session' : 'End Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Dashboard */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <LiveErgDashboard
            ergData={ergData}
            isConnected={isConnected}
            targetPace={targetPace}
            sessionCode={session.sessionCode}
          />
        </div>
      </div>

      {/* Status footer */}
      <div className="border-t border-ink-border/30 px-4 lg:px-6 py-2 bg-ink-well/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] font-mono text-ink-muted uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Radio size={10} />
            {session.name}
          </span>
          <span>{isConnected ? 'CONNECTED' : 'RECONNECTING...'}</span>
          {session.sessionCode && <span>CODE: {session.sessionCode}</span>}
        </div>
      </div>
    </div>
  );
}
