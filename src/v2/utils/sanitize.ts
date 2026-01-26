import DOMPurify from 'dompurify';

/**
 * Allowed HTML tags for rich text content.
 * Restricted to formatting-only tags to prevent XSS.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'a', 'span'
];

/**
 * Allowed attributes - minimal for security.
 */
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use before saving to database AND before displaying.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // Allow target="_blank" for links
  });
}

/**
 * Check if HTML content is empty (only whitespace/empty tags).
 */
export function isHtmlEmpty(html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  return stripped.length === 0;
}

/**
 * Extract plain text from HTML for previews.
 */
export function htmlToPlainText(html: string, maxLength?: number): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (maxLength && text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
}
