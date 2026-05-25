'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ACCENT, IAD_META, type IadId, MONO, MUTED, TEXT } from './constants';
import NodeRouterIAD from './NodeRouterIAD';
import PerimeterSortIAD from './PerimeterSortIAD';
import StatelessChessIAD from './StatelessChessIAD';

const SELECTORS: IadId[] = ['chess', 'sort', 'router'];

function IadCanvas({ id }: { id: IadId }) {
  switch (id) {
    case 'chess':
      return <StatelessChessIAD />;
    case 'sort':
      return <PerimeterSortIAD />;
    case 'router':
      return <NodeRouterIAD />;
  }
}

/** Contact section — Interactive Architecture Demonstrations mounted on slide-05 console frames. */
export default function OpenLandingBriefingConsole() {
  const [active, setActive] = useState<IadId>('chess');
  const [engaged, setEngaged] = useState(false);
  const reduceMotion = useReducedMotion();
  const meta = IAD_META[active];

  return (
    <div
      role="region"
      aria-label="Interactive architecture demonstrations"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 7,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          top: '6%',
          height: '52%',
          padding: 'clamp(8px, 1.5vw, 14px)',
          background: 'rgba(9, 9, 11, 0.88)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onPointerDown={() => setEngaged(true)}
      >
        <div style={{ flexShrink: 0, marginBottom: 6, fontFamily: MONO }}>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(7px, 1.2vw, 9px)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: ACCENT,
            }}
          >
            Interactive architecture demo · {meta.subtitle}
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 'clamp(6px, 1vw, 8px)',
              color: MUTED,
              lineHeight: 1.35,
            }}
          >
            {meta.takeaway}
          </p>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {!engaged && !reduceMotion ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: 'clamp(8px, 1.3vw, 10px)',
                color: TEXT,
                textAlign: 'center',
                padding: 12,
              }}
            >
              Tap to engage · {meta.title}
            </motion.div>
          ) : (
            <IadCanvas id={active} />
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '7%',
          right: '7%',
          bottom: '8%',
          height: '28%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(6px, 1.2vw, 12px)',
        }}
      >
        {SELECTORS.map((id) => {
          const m = IAD_META[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActive(id);
                setEngaged(true);
              }}
              aria-pressed={isActive}
              aria-label={`${m.title} demonstration`}
              style={{
                margin: 0,
                padding: '8px 6px',
                cursor: 'pointer',
                background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(9,9,11,0.75)',
                border: `1px solid ${isActive ? ACCENT : 'rgba(245,158,11,0.28)'}`,
                borderRadius: 6,
                fontFamily: MONO,
                color: isActive ? ACCENT : MUTED,
                boxShadow: isActive ? `0 0 20px rgba(245,158,11,0.15)` : undefined,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: 0,
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(7px, 1.1vw, 9px)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {m.title}
              </span>
              <span style={{ fontSize: 'clamp(6px, 0.95vw, 7px)', color: isActive ? TEXT : MUTED }}>
                {m.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '8%',
          bottom: '37%',
          fontSize: 'clamp(6px, 0.9vw, 7px)',
          fontFamily: MONO,
          color: 'rgba(161,161,170,0.55)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        IAD · not a game · claims demo
      </div>
    </div>
  );
}
