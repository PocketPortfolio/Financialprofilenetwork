'use client';

import React, { useEffect, useState } from 'react';

const AMBER = '#f59e0b';

type Props = {
  strings: string[];
  /** Blinking block cursor color */
  cursorColor?: string;
  /** Typing speed (ms per character) */
  typeSpeed?: number;
  /** Pause at end of string (ms) before delete */
  pauseEnd?: number;
  /** Delete speed (ms per character) */
  deleteSpeed?: number;
  /** Pause after delete before next string (ms) */
  pauseStart?: number;
  /** Optional className for the container */
  className?: string;
  style?: React.CSSProperties;
};

export default function Typewriter({
  strings,
  cursorColor = AMBER,
  typeSpeed = 60,
  pauseEnd = 2000,
  deleteSpeed = 35,
  pauseStart = 500,
  className,
  style,
}: Props) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const current = strings[index] ?? '';

  useEffect(() => {
    if (reducedMotion) return;
    if (phase === 'typing') {
      if (subIndex < current.length) {
        const t = setTimeout(() => setSubIndex((s) => s + 1), typeSpeed);
        return () => clearTimeout(t);
      }
      setPhase('pause');
      const t = setTimeout(() => setPhase('deleting'), pauseEnd);
      return () => clearTimeout(t);
    }
    if (phase === 'deleting') {
      if (subIndex > 0) {
        const t = setTimeout(() => setSubIndex((s) => s - 1), deleteSpeed);
        return () => clearTimeout(t);
      }
      setPhase('typing');
      setIndex((i) => (i + 1) % strings.length);
      const t = setTimeout(() => setPhase('typing'), pauseStart);
      return () => clearTimeout(t);
    }
  }, [phase, subIndex, current.length, typeSpeed, pauseEnd, deleteSpeed, pauseStart, strings.length, reducedMotion]);

  if (reducedMotion) {
    return (
      <span className={className} style={style}>
        {strings[0]}
      </span>
    );
  }

  const displayText = current.slice(0, subIndex);

  return (
    <span className={className} style={style}>
      {displayText}
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: '2ch',
          height: '1.1em',
          verticalAlign: 'text-bottom',
          backgroundColor: cursorColor,
          marginLeft: '2px',
          animation: 'typewriter-blink 1s step-end infinite',
        }}
      />
    </span>
  );
}
