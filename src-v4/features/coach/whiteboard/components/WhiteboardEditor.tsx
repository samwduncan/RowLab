/**
 * WhiteboardEditor -- textarea-based editor with view/edit toggle.
 *
 * Uses a plain textarea for editing with markdown hints in the toolbar.
 * Save and Cancel buttons control the flow.
 */
import { useState } from 'react';
import { Bold, Italic, List, Heading2, Save, X } from 'lucide-react';

interface WhiteboardEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

/** Insert markdown syntax at cursor position or wrap selection */
function insertMarkdown(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  setContent: (value: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);

  const newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
  setContent(newText);

  // Restore cursor position after state update
  requestAnimationFrame(() => {
    textarea.focus();
    const cursorPos = selected
      ? start + prefix.length + selected.length + suffix.length
      : start + prefix.length;
    textarea.setSelectionRange(cursorPos, cursorPos);
  });
}

export function WhiteboardEditor({
  initialContent,
  onSave,
  onCancel,
  isSaving,
}: WhiteboardEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  const toolbarActions = [
    {
      icon: Bold,
      label: 'Bold',
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, '**', '**', setContent),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, '_', '_', setContent),
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, '## ', '', setContent),
    },
    {
      icon: List,
      label: 'List',
      action: (ta: HTMLTextAreaElement) => insertMarkdown(ta, '- ', '', setContent),
    },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-base font-semibold text-white/90">Edit Whiteboard</h2>
        <p className="text-xs text-white/40 mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-white/[0.04]">
        {toolbarActions.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => {
              const ta = document.getElementById('whiteboard-editor') as HTMLTextAreaElement | null;
              if (ta) action(ta);
            }}
            className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="ml-2 text-[10px] text-white/20">Markdown supported</span>
      </div>

      {/* Textarea */}
      <div className="p-6">
        <textarea
          id="whiteboard-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter today's whiteboard content (markdown supported)..."
          rows={16}
          className="w-full resize-y rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-white/[0.08] font-mono leading-relaxed"
          maxLength={50000}
        />
        <p className="mt-1 text-right text-[10px] text-white/20">
          {content.length.toLocaleString()} / 50,000
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Whiteboard'}
        </button>
      </div>
    </div>
  );
}
