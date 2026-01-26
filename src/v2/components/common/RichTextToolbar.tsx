import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
} from 'lucide-react';

interface RichTextToolbarProps {
  disabled?: boolean;
}

export function RichTextToolbar({ disabled = false }: RichTextToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (tag: HeadingTagType) => {
    if (blockType !== tag) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === 'root'
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();

          if ($isHeadingNode(element)) {
            element.replace($createHeadingNode(tag));
          } else {
            const heading = $createHeadingNode(tag);
            element.replace(heading);
          }
        }
      });
    }
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      if (blockType !== 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    } else {
      if (blockType !== 'number') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    }
  };

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    title,
    disabled: buttonDisabled,
  }: {
    onClick: () => void;
    active?: boolean;
    icon: React.ComponentType<any>;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || buttonDisabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        ${
          active
            ? 'bg-accent text-white'
            : 'text-txt-secondary hover:bg-surface-hover hover:text-txt-primary'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <Icon size={18} />
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-bdr mx-1" />;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-bdr bg-surface">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => formatText('bold')}
        active={isBold}
        icon={Bold}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        onClick={() => formatText('italic')}
        active={isItalic}
        icon={Italic}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        onClick={() => formatText('underline')}
        active={isUnderline}
        icon={Underline}
        title="Underline (Ctrl+U)"
      />

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => formatHeading('h1')}
        active={blockType === 'h1'}
        icon={Heading1}
        title="Heading 1"
      />
      <ToolbarButton
        onClick={() => formatHeading('h2')}
        active={blockType === 'h2'}
        icon={Heading2}
        title="Heading 2"
      />

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => formatList('bullet')}
        active={blockType === 'bullet'}
        icon={List}
        title="Bulleted List"
      />
      <ToolbarButton
        onClick={() => formatList('number')}
        active={blockType === 'number'}
        icon={ListOrdered}
        title="Numbered List"
      />

      <Divider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        icon={Undo}
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
      />
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        icon={Redo}
        title="Redo (Ctrl+Y)"
        disabled={!canRedo}
      />
    </div>
  );
}
