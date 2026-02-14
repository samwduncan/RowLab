/**
 * WhiteboardPage -- structured notes board with view/edit toggle.
 *
 * Coaches can view and edit the whiteboard. Athletes with team access
 * see a read-only view. Save triggers POST /api/v1/whiteboards via
 * useSaveWhiteboard mutation.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ClipboardList, ShieldAlert } from 'lucide-react';
import { listContainerVariants, listItemVariants, SPRING_SMOOTH } from '@/lib/animations';
import { useAuth } from '@/features/auth/useAuth';
import { whiteboardOptions, useSaveWhiteboard } from '../api';
import { WhiteboardView } from './WhiteboardView';
import { WhiteboardEditor } from './WhiteboardEditor';

export function WhiteboardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { activeTeamRole } = useAuth();

  const canEdit =
    activeTeamRole === 'OWNER' || activeTeamRole === 'ADMIN' || activeTeamRole === 'COACH';
  const readOnly = !canEdit;

  const { data: whiteboard, isLoading } = useQuery(whiteboardOptions());
  const saveMutation = useSaveWhiteboard();

  const handleSave = (content: string) => {
    const today = new Date().toISOString().split('T')[0]!;
    saveMutation.mutate({ date: today, content }, { onSuccess: () => setIsEditing(false) });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.03]" />
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 pb-20 md:pb-6">
      <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div
          variants={listItemVariants}
          transition={SPRING_SMOOTH}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-5 w-5 text-white/40" />
              <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                Team Notes
              </p>
            </div>
            <h1 className="text-2xl font-bold text-white/95 tracking-tight">Whiteboard</h1>
          </div>

          <div className="flex items-center gap-2">
            {readOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 border border-white/[0.06]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Read Only
              </span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={listItemVariants} transition={SPRING_SMOOTH}>
          {isEditing ? (
            <WhiteboardEditor
              initialContent={whiteboard?.content ?? ''}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSaving={saveMutation.isPending}
            />
          ) : (
            <WhiteboardView
              whiteboard={whiteboard ?? null}
              canEdit={canEdit}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
