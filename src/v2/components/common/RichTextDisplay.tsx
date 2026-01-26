import { sanitizeHtml } from '@v2/utils/sanitize';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * Display sanitized rich text content.
 * Always sanitizes before rendering to prevent XSS.
 */
export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const sanitized = sanitizeHtml(content);

  return (
    <div
      className={`prose prose-sm max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
