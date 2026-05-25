'use client';

import { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const ACCENT = '#f59e0b';
const TEXT = '#e2e8f0';
const MUTED = '#a1a1aa';

const exposurePanelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'clamp(6%, 8%, 12%)',
  left: 'clamp(3%, 4%, 6%)',
  width: 'min(52%, 420px)',
  maxHeight: '88%',
  padding: 'clamp(12px, 2.5vw, 20px) clamp(14px, 2.8vw, 22px)',
  background: 'rgba(9, 9, 11, 0.78)',
  border: '1px solid rgba(245, 158, 11, 0.35)',
  borderLeft: `3px solid ${ACCENT}`,
  borderRadius: '6px',
  pointerEvents: 'none',
  zIndex: 4,
  overflow: 'hidden',
  fontFamily: MONO,
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 clamp(10px, 2vw, 14px) 0',
  fontSize: 'clamp(9px, 1.65vw, 11px)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: ACCENT,
  lineHeight: 1.35,
};

const metricStyle: React.CSSProperties = {
  margin: '0 0 2px 0',
  fontSize: 'clamp(10px, 1.9vw, 12px)',
  fontWeight: 700,
  color: ACCENT,
  lineHeight: 1.3,
};

const bodyStyle: React.CSSProperties = {
  margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
  fontSize: 'clamp(7.5px, 1.45vw, 9.5px)',
  fontWeight: 400,
  color: TEXT,
  lineHeight: 1.5,
};

function ExposureOverlay() {
  const items = [
    { metric: 'GBP 4.45M', label: 'Average Breach Cost (Financial Services)' },
    { metric: 'EUR 35M or 7%', label: 'EU AI Act (Art. 99 Tier-1 ceiling)' },
    { metric: 'EUR 20M or 4%', label: 'GDPR (Art. 83(5) higher-tier ceiling)' },
  ];

  return (
    <div role="presentation" aria-hidden style={exposurePanelStyle}>
      <p style={titleStyle}>The inflection point: 2025 exposure</p>
      {items.map((item) => (
        <div key={item.metric} style={{ marginBottom: 'clamp(6px, 1.2vw, 10px)' }}>
          <p style={metricStyle}>{item.metric}</p>
          <p style={{ ...bodyStyle, marginBottom: 0 }}>· {item.label}</p>
        </div>
      ))}
      <p style={{ ...bodyStyle, marginBottom: 0, color: MUTED, fontSize: 'clamp(7px, 1.35vw, 9px)' }}>
        Legacy aggregators require persistent PII storage to run generative AI, triggering maximum
        regulatory exposure.
      </p>
    </div>
  );
}

function MoatStepCard({
  index,
  title,
  body,
  active,
}: {
  index: number;
  title: string;
  body: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        flex: '0 0 min(100%, 280px)',
        scrollSnapAlign: 'start',
        padding: '12px 14px',
        background: active ? 'rgba(9, 9, 11, 0.88)' : 'rgba(9, 9, 11, 0.72)',
        border: `1px solid ${active ? 'rgba(245,158,11,0.55)' : 'rgba(245,158,11,0.25)'}`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '6px',
        fontFamily: MONO,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `1px solid ${ACCENT}`,
            color: ACCENT,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        <p style={{ margin: 0, fontSize: 'clamp(9px, 1.7vw, 11px)', fontWeight: 700, color: TEXT }}>
          {title}
        </p>
      </div>
      <p style={{ margin: 0, fontSize: 'clamp(8px, 1.5vw, 10px)', lineHeight: 1.55, color: MUTED }}>
        {body}
      </p>
    </div>
  );
}

/** Full-width bottom dock — no vertical clip; horizontal scroll on narrow viewports. */
function MoatOverlay({ adapterCount }: { adapterCount: number }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      title: 'Ingest @ Edge',
      body: `@pocket-portfolio/importer (MIT, ${adapterCount}+ adapters) normalizes data entirely client-side.`,
    },
    {
      title: 'Context Engine',
      body: 'buildPortfolioContext() physically compresses raw rows into bounded aggregates (totals + top 10).',
    },
    {
      title: 'Stateless API',
      body: 'POST /api/ai/chat receives only the sanitized context payload. Zero DB writes. Zero payload persistence.',
    },
  ];

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / Math.max(el.offsetWidth * 0.85, 240));
    setActive(Math.min(steps.length - 1, Math.max(0, idx)));
  }, [steps.length]);

  return (
    <div
      role="region"
      aria-label="Architectural moat — three-step sanitization pipeline"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        padding: '10px 12px 12px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.94) 28%, rgba(9,9,11,0.97) 100%)',
        pointerEvents: 'auto',
      }}
    >
      <p
        style={{
          margin: '0 0 8px 4px',
          fontSize: 'clamp(8px, 1.5vw, 10px)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ACCENT,
          fontFamily: MONO,
        }}
      >
        The architectural moat: sanitization by construction
      </p>
      <div
        onScroll={onScroll}
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
        }}
      >
        {steps.map((step, i) => (
          <MoatStepCard
            key={step.title}
            index={i + 1}
            title={step.title}
            body={step.body}
            active={active === i}
          />
        ))}
      </div>
      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}
        >
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                width: active === i ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: active === i ? ACCENT : 'rgba(161,161,170,0.45)',
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function OpenLandingPlateOverlay({
  variant,
  adapterCount = 19,
}: {
  variant: 'exposure' | 'moat';
  adapterCount?: number;
}) {
  if (variant === 'exposure') return <ExposureOverlay />;
  return <MoatOverlay adapterCount={adapterCount} />;
}
