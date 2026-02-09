/**
 * ScrambleNumber - Digit scramble animation component
 *
 * Digits randomize then settle left-to-right, like an instrument display powering on.
 * Much more distinctive than a simple count-up animation.
 *
 * Features:
 * - Preserves non-digit characters (colons, decimals, dashes)
 * - RAF-based scramble with precise settle timing
 * - Cleans up animation on unmount
 *
 * Design: Canvas instrument boot sequence
 */

import { useState, useEffect, useRef } from 'react';

export interface ScrambleNumberProps {
  value: number | string;
  className?: string;
}

export function ScrambleNumber({ value, className }: ScrambleNumberProps) {
  const target = String(value);
  const [display, setDisplay] = useState(() =>
    target.replace(/\d/g, () => String(Math.floor(Math.random() * 10)))
  );
  const rafRef = useRef(0);

  useEffect(() => {
    const chars = target.split('');
    const digitIndices: number[] = [];
    chars.forEach((ch, i) => {
      if (/\d/.test(ch)) digitIndices.push(i);
    });

    const INITIAL_DELAY = 8; // frames of pure scramble
    const SETTLE_RATE = 4; // frames between each digit locking in
    let frame = 0;
    let settled = 0;

    const tick = () => {
      frame++;

      if (frame > INITIAL_DELAY && frame % SETTLE_RATE === 0 && settled < digitIndices.length) {
        settled++;
      }

      const result = chars
        .map((ch, i) => {
          if (!/\d/.test(ch)) return ch;
          const pos = digitIndices.indexOf(i);
          if (pos < settled) return ch;
          return String(Math.floor(Math.random() * 10));
        })
        .join('');

      setDisplay(result);

      if (settled >= digitIndices.length) {
        setDisplay(target);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <span className={className}>{display}</span>;
}
