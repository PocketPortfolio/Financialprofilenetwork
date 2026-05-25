'use client';

import { motion, useReducedMotion } from 'framer-motion';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const ACCENT = '#f59e0b';
const TEXT = '#e2e8f0';

const TERMINAL_LINES = [
  '$ npm i @pocket-portfolio/importer',
  '→ normalizeTrades() @ client edge',
  '→ 19 broker adapters · MIT',
  '→ zero server-side PII path',
  'published: @pocket-portfolio/fidelity-csv-export',
  'published: @pocket-portfolio/coinbase-transaction-parser',
  'published: @pocket-portfolio/universal-csv-importer',
];

/** Packages section — always-visible npm substrate terminal (HTML, not plate-dependent). */
export default function OpenLandingPackageTerminal() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        background:
          'linear-gradient(135deg, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.15) 45%, rgba(9,9,11,0.35) 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '8% 6%',
          border: '1px solid rgba(245,158,11,0.35)',
          borderLeft: `3px solid ${ACCENT}`,
          borderRadius: '8px',
          background: 'rgba(9, 9, 11, 0.82)',
          padding: 'clamp(14px, 3vw, 22px)',
          fontFamily: MONO,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: 'clamp(9px, 1.6vw, 11px)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: ACCENT,
          }}
        >
          OSS substrate · npm org
        </p>
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: 'clamp(11px, 2vw, 14px)',
            fontWeight: 700,
            color: TEXT,
          }}
        >
          @pocket-portfolio/importer
        </p>
        {TERMINAL_LINES.map((line, i) => (
          <motion.p
            key={line}
            initial={reduceMotion ? undefined : { opacity: 0, x: -8 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.12 * i, duration: 0.4 }}
            style={{
              margin: '0 0 6px 0',
              fontSize: 'clamp(8px, 1.45vw, 10px)',
              lineHeight: 1.5,
              color: line.startsWith('$') ? ACCENT : 'rgba(161,161,170,0.95)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {line}
          </motion.p>
        ))}
        {!reduceMotion && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              marginTop: 10,
              width: 8,
              height: 14,
              background: ACCENT,
              display: 'inline-block',
            }}
          />
        )}
      </div>
    </div>
  );
}
