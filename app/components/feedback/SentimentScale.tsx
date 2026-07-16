'use client';

import React from 'react';
import type { FeedbackFriction } from '@/app/lib/feedback/types';

const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
};

export function SentimentScale(props: {
  rating: number;
  onRatingChange: (rating: number) => void;
  friction: FeedbackFriction;
  onFrictionChange: (friction: FeedbackFriction) => void;
}) {
  const { rating, onRatingChange, friction, onFrictionChange } = props;
  const buttons = [1, 2, 3, 4, 5] as const;

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', ...MONO }}>
          Rating (1–5)
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {buttons.map((n) => {
            const active = rating === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onRatingChange(n)}
                aria-pressed={active}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: `1px solid ${active ? 'var(--accent-warm)' : 'var(--border-subtle)'}`,
                  background: active ? 'color-mix(in srgb, var(--accent-warm) 18%, var(--surface))' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  ...MONO,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', ...MONO }}>
          Outcome
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['frictionless', 'broken'] as const).map((v) => {
            const active = friction === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onFrictionChange(v)}
                aria-pressed={active}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${active ? 'var(--accent-warm)' : 'var(--border-subtle)'}`,
                  background: active ? 'color-mix(in srgb, var(--accent-warm) 18%, var(--surface))' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 650,
                  ...MONO,
                }}
              >
                {v === 'frictionless' ? 'Frictionless' : 'Broken'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

