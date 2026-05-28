'use client';

import type { ClientBriefingState } from '@/app/hooks/useClientBriefing';

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

interface MorningBriefProps {
  briefing: ClientBriefingState;
}

function BriefingSkeleton() {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '120px',
      }}
    >
      {[1, 2, 3].map((i) => (
        <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-warm)',
              marginTop: '6px',
              flexShrink: 0,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              flex: 1,
              height: '14px',
              borderRadius: '4px',
              background: 'color-mix(in srgb, var(--accent-warm) 18%, var(--surface-elevated))',
              border: '1px solid var(--dashboard-chrome-border-subtle)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              width: i === 2 ? '92%' : '100%',
            }}
          />
        </li>
      ))}
    </ul>
  );
}

export function MorningBrief({ briefing }: MorningBriefProps) {
  const sourceLabel =
    briefing.status === 'ready'
      ? 'SOURCE: POCKET ANALYST · STATELESS INFERENCE'
      : briefing.status === 'fallback'
        ? 'SOURCE: OFFLINE SUMMARY'
        : briefing.status === 'loading'
          ? 'GENERATING CLIENT BRIEF…'
          : '';

  const bullets =
    briefing.status === 'ready'
      ? briefing.bullets
      : briefing.status === 'fallback'
        ? briefing.bullets
        : [];

  return (
    <section
      className="dashboard-card"
      data-tour="morning-brief"
      style={{
        marginBottom: '24px',
        padding: '20px',
        border: '1px solid var(--dashboard-chrome-border-subtle)',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent) 0%, var(--surface) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minHeight: '160px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '16px' }} aria-hidden>
          ◈
        </span>
        <h3
          style={{
            fontSize: '12px',
            fontFamily: MONO,
            color: 'var(--accent-warm)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            fontWeight: 600,
          }}
        >
          Client Brief · Pocket Analyst
        </h3>
      </div>

      {briefing.status === 'loading' ? (
        <BriefingSkeleton />
      ) : briefing.status === 'idle' ? (
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'hsl(var(--muted-foreground))',
            lineHeight: 1.6,
          }}
        >
          Sign in to generate a stateless client brief, or add trades to see an offline summary.
        </p>
      ) : bullets.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {bullets.slice(0, 3).map((text, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontSize: '14px',
                color: 'hsl(var(--muted-foreground))',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-warm)',
                  marginTop: '8px',
                  flexShrink: 0,
                }}
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {sourceLabel && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: 'hsl(var(--muted-foreground))',
            fontFamily: MONO,
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid hsl(var(--border))',
          }}
        >
          <span>{sourceLabel}</span>
        </div>
      )}
    </section>
  );
}
