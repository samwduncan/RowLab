/**
 * Clipboard Hook - Copy PNG images to clipboard
 * Phase 38-04
 *
 * Browser compatibility:
 * - Requires ClipboardItem API (Chrome 76+, Safari 13.1+, Firefox 87+)
 * - Falls back with error message for unsupported browsers
 *
 * Usage:
 * const { copyImage, copied, error } = useClipboard();
 * await copyImage('https://example.com/card.png');
 */

import { useState, useCallback } from 'react';

/**
 * Check if browser supports clipboard image copy
 */
function isClipboardSupported() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    typeof ClipboardItem !== 'undefined'
  );
}

/**
 * Copy a PNG image URL to clipboard
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const copyImage = useCallback(async (imageUrl) => {
    setError(null);
    setCopied(false);

    // Check browser compatibility
    if (!isClipboardSupported()) {
      const errorMsg = 'Clipboard image copy not supported in this browser. Use Download instead.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();

      // Create ClipboardItem with PNG mime type
      const clipboardItem = new ClipboardItem({
        'image/png': blob,
      });

      // Write to clipboard
      await navigator.clipboard.write([clipboardItem]);

      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to copy image to clipboard';
      setError(errorMsg);
      console.error('Clipboard copy error:', err);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    copyImage,
    copied,
    error,
    isSupported: isClipboardSupported(),
  };
}
