'use client';

import { motion, useReducedMotion } from 'framer-motion';

const ACCENT = '#f59e0b';

/** Ordered grid slots — regulated org alignment → frontier AI column. */
const GRID_SLOTS = [
  { x: 72, y: 22, label: 'FIN' },
  { x: 82, y: 22, label: 'HEALTH' },
  { x: 92, y: 22, label: 'DEF' },
  { x: 72, y: 38, label: 'EDGE' },
  { x: 82, y: 38, label: 'OSS' },
  { x: 92, y: 38, label: 'AI' },
  { x: 72, y: 54, label: 'AUDIT' },
  { x: 82, y: 54, label: 'SDK' },
  { x: 92, y: 54, label: 'API' },
];

function GlassCube({
  x,
  y,
  delay,
  reduced,
}: {
  x: number;
  y: number;
  delay: number;
  reduced: boolean;
}) {
  const size = 7;
  if (reduced) {
    return (
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        rx={1.2}
        fill="rgba(245,158,11,0.12)"
        stroke={ACCENT}
        strokeWidth={0.35}
        opacity={0.9}
      />
    );
  }
  return (
    <motion.g
      initial={{ opacity: 0, x: x - 12, y: y + 8, scale: 0.6 }}
      animate={{
        opacity: [0.5, 1, 0.75],
        x: [x - 10, x, x],
        y: [y + 10, y, y],
        scale: [0.55, 1, 1],
      }}
      transition={{
        duration: 1.4,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <motion.rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        rx={1.2}
        fill="rgba(245,158,11,0.1)"
        stroke={ACCENT}
        strokeWidth={0.4}
        animate={{
          strokeOpacity: [0.45, 1, 0.55],
          fillOpacity: [0.06, 0.18, 0.08],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: delay + 0.5, ease: 'easeInOut' }}
      />
      <motion.rect
        x={x - size / 2 + 1.2}
        y={y - size / 2 + 1.2}
        width={size - 2.4}
        height={size - 2.4}
        rx={0.8}
        fill={ACCENT}
        animate={{ opacity: [0.15, 0.45, 0.15] }}
        transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
      />
    </motion.g>
  );
}

/** Hero — sovereign glass nodes snap into regulated-perimeter grid (right zone). */
export default function OpenLandingSovereignGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        {/* Amber alignment rails */}
        <g stroke={ACCENT} strokeOpacity={0.2} strokeWidth={0.2}>
          <line x1={68} y1={16} x2={68} y2={60} />
          <line x1={78} y1={16} x2={78} y2={60} />
          <line x1={88} y1={16} x2={88} y2={60} />
          <line x1={98} y1={16} x2={98} y2={60} />
          <line x1={66} y1={28} x2={100} y2={28} />
          <line x1={66} y1={44} x2={100} y2={44} />
        </g>
        {!reduceMotion && (
          <motion.path
            d="M 66 36 H 100"
            fill="none"
            stroke={ACCENT}
            strokeWidth={0.35}
            strokeDasharray="2 3"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0.2, 0.7, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {GRID_SLOTS.map((slot, i) => (
          <GlassCube key={slot.label} x={slot.x} y={slot.y} delay={0.08 * i} reduced={!!reduceMotion} />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          maxWidth: '42%',
          fontSize: 'clamp(7px, 1.1vw, 9px)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(245,158,11,0.85)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          textAlign: 'left',
          lineHeight: 1.55,
          padding: '8px 10px',
          background: 'rgba(9, 9, 11, 0.72)',
          borderLeft: `2px solid ${ACCENT}`,
          borderRadius: '0 4px 4px 0',
        }}
      >
        Regulated verticals · frontier AI
        <br />
        <span style={{ color: 'rgba(228,228,231,0.75)' }}>Systematic perimeter alignment</span>
      </div>
    </div>
  );
}
