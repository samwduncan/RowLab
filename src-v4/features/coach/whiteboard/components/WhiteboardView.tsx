/**
 * WhiteboardView -- displays formatted whiteboard content in read mode.
 *
 * Shows the date, author, and markdown-rendered content.
 * Provides Edit button for coaches, empty state when no whiteboard exists.
 */
import { ClipboardList, Pencil } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import type { WhiteboardEntry } from '../types';

interface WhiteboardViewProps {
  whiteboard: WhiteboardEntry | null;
  canEdit: boolean;
  onEdit: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function WhiteboardView({ whiteboard, canEdit, onEdit }: WhiteboardViewProps) {
  // Empty state
  if (!whiteboard) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-10 text-center">
        <ClipboardList className="mx-auto mb-4 h-12 w-12 text-white/30" />
        <p className="text-sm text-white/50 mb-5">No whiteboard posted yet.</p>
        {canEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15"
          >
            <Pencil className="h-4 w-4" />
            Create Today's Whiteboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white/90">{formatDate(whiteboard.date)}</h2>
          <p className="text-xs text-white/40 mt-0.5">Posted by {whiteboard.author.name}</p>
        </div>
        {canEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white/90"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* Content -- rendered markdown */}
      <div className="p-6" data-color-mode="dark">
        <div className="prose prose-invert prose-sm max-w-none whiteboard-content">
          <MDEditor.Markdown source={whiteboard.content} />
        </div>
      </div>

      {/* Footer -- last updated */}
      <div className="border-t border-white/[0.06] px-6 py-3">
        <p className="text-xs text-white/30">
          Last updated {new Date(whiteboard.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
