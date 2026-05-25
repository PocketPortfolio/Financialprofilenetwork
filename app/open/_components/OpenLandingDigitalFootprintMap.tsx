'use client';

import { motion, useReducedMotion } from 'framer-motion';

const ACCENT = '#f59e0b';

/**
 * Footprint nodes tuned to slide-03 night-lights globe (Atlantic-centered projection).
 * Coords are % within the map artwork — NOT flat equirectangular lon/lat.
 */
const FOOTPRINT_NODES_DUAL: { id: string; x: number; y: number }[] = [
  { id: 'lon', x: 52, y: 34 },
  { id: 'fra', x: 54, y: 36 },
  { id: 'ams', x: 51, y: 33 },
  { id: 'sao', x: 20, y: 60 },
  { id: 'rio', x: 24, y: 62 },
  { id: 'bog', x: 14, y: 52 },
  { id: 'nyc', x: 12, y: 44 },
  { id: 'dxb', x: 60, y: 40 },
  { id: 'mum', x: 68, y: 46 },
  { id: 'sgp', x: 75, y: 50 },
  { id: 'tky', x: 85, y: 38 },
  { id: 'syd', x: 79, y: 66 },
  { id: 'jnb', x: 53, y: 64 },
  { id: 'lag', x: 45, y: 50 },
];

/** Right-half crop (tracks) — Africa / Indian Ocean / Australia hemisphere. */
const FOOTPRINT_NODES_FULL: { id: string; x: number; y: number }[] = [
  { id: 'lon', x: 58, y: 26 },
  { id: 'fra', x: 62, y: 28 },
  { id: 'jnb', x: 48, y: 56 },
  { id: 'lag', x: 40, y: 44 },
  { id: 'cai', x: 54, y: 36 },
  { id: 'dxb', x: 64, y: 34 },
  { id: 'mum', x: 72, y: 40 },
  { id: 'sgp', x: 78, y: 44 },
  { id: 'syd', x: 84, y: 60 },
  { id: 'nbo', x: 56, y: 48 },
  { id: 'sao', x: 8, y: 52 },
];

function FireflyNode({
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
  if (reduced) {
    return <circle cx={x} cy={y} r={1.8} fill={ACCENT} opacity={0.85} />;
  }
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.circle
        r={5}
        fill={ACCENT}
        initial={{ opacity: 0.06, scale: 0.5 }}
        animate={{ opacity: [0.04, 0.28, 0.04], scale: [0.45, 1.5, 0.45] }}
        transition={{ duration: 2.8 + delay * 0.3, repeat: Infinity, delay, ease: 'easeInOut' }}
        style={{ filter: 'blur(4px)' }}
      />
      <motion.circle
        r={2.2}
        fill={ACCENT}
        initial={{ opacity: 0.1, scale: 0.7 }}
        animate={{ opacity: [0.08, 0.4, 0.08], scale: [0.6, 1.15, 0.6] }}
        transition={{
          duration: 2.4 + delay * 0.25,
          repeat: Infinity,
          delay: delay * 0.4,
          ease: 'easeInOut',
        }}
        style={{ filter: 'blur(1.5px)' }}
      />
      <motion.circle
        r={1.1}
        fill={ACCENT}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }}
        transition={{ duration: 2.2 + delay * 0.2, repeat: Infinity, delay, ease: 'easeInOut' }}
      />
    </g>
  );
}

/** Digital footprint — firefly beams anchored to deck map city-light clusters. */
export default function OpenLandingDigitalFootprintMap({
  placement = 'dual-pane',
}: {
  /** dual-pane: npm terminal left + map right (bridge). full: map fills frame (tracks). */
  placement?: 'dual-pane' | 'full';
}) {
  const reduceMotion = useReducedMotion();
  const isFull = placement === 'full';
  const nodes = isFull ? FOOTPRINT_NODES_FULL : FOOTPRINT_NODES_DUAL;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        background: isFull
          ? 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.2) 100%)'
          : 'linear-gradient(90deg, rgba(9,9,11,0.72) 0%, rgba(9,9,11,0.12) 38%, transparent 52%)',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={
          isFull
            ? {
                position: 'absolute',
                inset: '4% 3%',
                width: '94%',
                height: '92%',
              }
            : {
                /* Map pane in slide-03 — right ~76% of plate after contain fit */
                position: 'absolute',
                left: '23%',
                top: '5%',
                width: '74%',
                height: '90%',
              }
        }
      >
        {nodes.map((node, i) => (
          <FireflyNode
            key={node.id}
            x={node.x}
            y={node.y}
            delay={i * 0.15}
            reduced={!!reduceMotion}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          ...(isFull ? { left: '4%' } : { right: '4%' }),
          fontSize: '9px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(245,158,11,0.65)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        Live footprint · GA4 · npm · production harness
      </div>
    </div>
  );
}
