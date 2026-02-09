/**
 * CanvasConsoleReadout - Monospace instrument display
 *
 * Used for status strips. Feels like a cox box readout with pipe separators
 * and a blinking cursor at the end.
 *
 * Features:
 * - Monospace font from Geist Mono
 * - Pipe separators between items
 * - Blinking cursor at end via canvas-cursor CSS
 * - Compact horizontal layout
 *
 * Design: Canvas console readout
 */

export interface CanvasConsoleReadoutProps {
  items: Array<{ label: string; value: string }>;
  className?: string;
}

export function CanvasConsoleReadout({ items, className = '' }: CanvasConsoleReadoutProps) {
  return (
    <div className={`canvas-console flex items-center flex-wrap gap-y-2 text-xs ${className}`}>
      {items.map((pair, i) => (
        <div key={pair.label} className="flex items-center">
          {i > 0 && <span className="text-ink-muted opacity-25 mx-3 select-none">{'\u2502'}</span>}
          <span className="text-ink-muted">{pair.label}</span>
          <span className="text-ink-primary font-medium ml-2">{pair.value}</span>
        </div>
      ))}
      <span className="canvas-cursor text-ink-muted ml-1" />
    </div>
  );
}
