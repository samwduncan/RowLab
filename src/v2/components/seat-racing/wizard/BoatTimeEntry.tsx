/**
 * BoatTimeEntry - Specialized time input for boat finish times
 *
 * Features:
 * - Accepts multiple formats: "1:32.5", "1:32", "92.5", "92"
 * - Displays as MM:SS.s format
 * - Validates on blur
 */

import { useState, useEffect, FocusEvent } from 'react';

interface BoatTimeEntryProps {
  value: string;
  onChange: (seconds: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

/**
 * Parse time input from various formats to seconds
 */
function parseTimeInput(input: string): number | null {
  if (!input || input.trim() === '') return null;

  // Try MM:SS.s or MM:SS format
  const colonMatch = input.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
  if (colonMatch) {
    const mins = parseInt(colonMatch[1], 10);
    const secs = parseFloat(colonMatch[2]);
    if (secs >= 60) return null; // Invalid seconds
    return mins * 60 + secs;
  }

  // Try plain seconds
  const num = parseFloat(input);
  if (!isNaN(num) && num > 0) return num;

  return null;
}

/**
 * Format seconds to MM:SS.s display format
 */
function formatTimeDisplay(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, '0')}`;
}

export function BoatTimeEntry({
  value,
  onChange,
  placeholder = 'M:SS.s',
  disabled = false,
  error,
}: BoatTimeEntryProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop changes (from external form state)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value);
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw input on focus for editing
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      // Empty input clears the value
      onChange(null);
      setDisplayValue('');
      return;
    }

    const parsed = parseTimeInput(inputValue);
    if (parsed !== null) {
      // Valid input - format and update
      const formatted = formatTimeDisplay(parsed);
      setDisplayValue(formatted);
      onChange(parsed);
    } else {
      // Invalid input - revert to previous value
      setDisplayValue(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  return (
    <div className="flex flex-col">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-24 px-3 py-1.5
          font-mono text-sm
          bg-surface border rounded-md
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-border'}
        `}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}
