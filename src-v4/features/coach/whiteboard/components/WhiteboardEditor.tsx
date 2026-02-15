/**
 * WhiteboardEditor -- textarea-based editor with view/edit toggle.
 *
 * Uses a plain textarea for editing with markdown hints in the toolbar.
 * Save and Cancel buttons control the flow.
 */
import { useState } from 'react';
import { Bold, Italic, List, Heading2, Save, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

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
    <GlassCard padding="none">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-border">
        <h2 className="text-base font-semibold text-ink-primary">Edit Whiteboard</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-ink-border/50">
        {toolbarActions.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => {
              const ta = document.getElementById('whiteboard-editor') as HTMLTextAreaElement | null;
              if (ta) action(ta);
            }}
            className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-ink-hover hover:text-ink-secondary"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="ml-2 text-[10px] text-ink-tertiary">Markdown supported</span>
      </div>

      {/* Textarea */}
      <div className="p-6">
        <textarea
          id="whiteboard-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter today's whiteboard content (markdown supported)..."
          rows={16}
          className="w-full resize-y rounded-lg border border-ink-border bg-ink-base px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-copper focus:outline-none focus:ring-1 focus:ring-accent-copper/50 font-mono leading-relaxed"
          maxLength={50000}
        />
        <p className="mt-1 text-right text-[10px] text-ink-tertiary">
          {content.length.toLocaleString()} / 50,000
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-ink-border">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          loading={isSaving}
        >
          <Save className="h-4 w-4" />
          Save Whiteboard
        </Button>
      </div>
    </GlassCard>
  );
}
