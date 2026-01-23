import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface WhiteboardEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

/**
 * WhiteboardEditor - Markdown editor for whiteboard
 *
 * Uses MDEditor with live preview for rich markdown editing.
 * Save button disabled when content empty or saving in progress.
 */
export function WhiteboardEditor({ initialContent = '', onSave, onCancel, isSaving }: WhiteboardEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="rounded-xl border border-bdr-primary bg-card-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-bdr-primary bg-surface">
        <h2 className="text-lg font-semibold text-txt-primary">Edit Whiteboard</h2>
        <p className="text-sm text-txt-secondary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Editor */}
      <div className="p-6" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={400}
          preview="live"
          textareaProps={{
            placeholder: "Enter today's whiteboard content (markdown supported)...",
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-bdr-primary bg-surface">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-txt-primary border border-bdr-primary rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
          disabled={isSaving || !content.trim()}
        >
          {isSaving ? 'Saving...' : 'Post Whiteboard'}
        </button>
      </div>
    </div>
  );
}
