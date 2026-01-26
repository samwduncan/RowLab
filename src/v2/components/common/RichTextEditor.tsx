import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { EditorState, LexicalEditor } from 'lexical';
import { sanitizeHtml } from '@v2/utils/sanitize';
import { RichTextToolbar } from './RichTextToolbar';

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  initialValue,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px',
  disabled = false,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {
      // Custom theme classes matching V2 design
      paragraph: 'mb-2',
      heading: {
        h1: 'text-2xl font-bold mb-4',
        h2: 'text-xl font-semibold mb-3',
      },
      list: {
        ul: 'list-disc ml-4 mb-2',
        ol: 'list-decimal ml-4 mb-2',
        listitem: 'ml-2',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    nodes: [ListNode, ListItemNode, HeadingNode],
    onError: (error: Error) => console.error(error),
    editable: !disabled,
  };

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const sanitized = sanitizeHtml(html);
      onChange(sanitized);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-bdr rounded-lg overflow-hidden bg-surface">
        <RichTextToolbar disabled={disabled} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="p-4 focus:outline-none min-h-[200px]"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-txt-tertiary pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
