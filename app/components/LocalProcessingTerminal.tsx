'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Lines match local-first steps: browser parse, ledger scan, header shaping,
 * skipping empty rows / size limits (callers implement), then payload for AI/import.
 */
export const LOCAL_PROCESSING_TERMINAL_LINES = [
  '> System: Initializing local browser environment...',
  '> Scanner: Parsing raw CSV ledger...',
  '> Engine: Normalizing column headers...',
  '> Privacy: Dropping non-essential metadata...',
  '> Compiler: Constructing stateless, anonymous payload...',
  '> Status: Ready for AI analysis.',
] as const;

const LINE_DELAY_MS = 400;
const monoFont = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export interface LocalProcessingTerminalProps {
  active: boolean;
  /** Fires once after the final line is revealed (still inside browser, after staggered delays). */
  onSequenceComplete?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function LocalProcessingTerminal({
  active,
  onSequenceComplete,
  style,
  className,
}: LocalProcessingTerminalProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const onCompleteRef = useRef(onSequenceComplete);
  onCompleteRef.current = onSequenceComplete;

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const n = LOCAL_PROCESSING_TERMINAL_LINES.length;

    for (let i = 0; i < n; i++) {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === n - 1) {
          onCompleteRef.current?.();
        }
      }, (i + 1) * LINE_DELAY_MS);
      timers.push(t);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={className}
      role="log"
      aria-live="polite"
      aria-busy={active && visibleCount < LOCAL_PROCESSING_TERMINAL_LINES.length}
      style={{
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        fontFamily: monoFont,
        fontSize: '11px',
        lineHeight: 1.55,
        color: 'var(--text-secondary)',
        maxHeight: '200px',
        overflowY: 'auto',
        ...style,
      }}
    >
      {LOCAL_PROCESSING_TERMINAL_LINES.slice(0, visibleCount).map((line, idx) => (
        <div
          key={`${line}-${idx}`}
          style={{
            marginBottom: idx < visibleCount - 1 ? '4px' : 0,
            color: idx === visibleCount - 1 ? 'var(--accent-warm)' : 'var(--text-secondary)',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
