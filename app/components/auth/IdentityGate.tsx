'use client';

import React, { useMemo, useState } from 'react';
import { getFirstTouchAttribution } from '@/app/lib/analytics/attribution';
import { trackEvent } from '@/app/lib/analytics/events';

type GateAction =
  | 'export_csv'
  | 'export_json'
  | 'save_view'
  | 'share_reasoning'
  | 'share_portfolio';

type IdentityGateProps = {
  action: GateAction;
  contextId?: string;
  /** Called after identity is captured (or already unlocked). */
  onContinue: () => void | Promise<void>;
  /** Render prop that receives an onClick handler. */
  children: (args: { request: () => void; isUnlocked: boolean }) => React.ReactNode;
};

const IDENTIFIED_KEY = 'pp_identified_v1';
const IDENTIFIED_EMAIL_KEY = 'pp_identified_email_v1';

function isUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(IDENTIFIED_KEY) === '1';
}

function setUnlocked(email: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IDENTIFIED_KEY, '1');
    localStorage.setItem(IDENTIFIED_EMAIL_KEY, email);
  } catch {
    // ignore storage failures
  }
}

export default function IdentityGate({ action, contextId, onContinue, children }: IdentityGateProps) {
  const unlocked = useMemo(() => isUnlocked(), []);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = () => {
    if (typeof window === 'undefined') return;
    if (isUnlocked()) {
      void Promise.resolve(onContinue());
      return;
    }
    setError(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setSubmitting(false);
    setError(null);
  };

  const submit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const ft = getFirstTouchAttribution();
    try {
      const res = await fetch('/api/identity/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          action,
          context_id: contextId || null,
          first_touch: ft,
          page_path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body?.error === 'string' ? body.error : 'Capture failed');
      }

      setUnlocked(trimmed);

      trackEvent('lead_captured', {
        action,
        context_id: contextId || 'null',
      });

      close();
      await onContinue();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Capture failed');
      setSubmitting(false);
    }
  };

  return (
    <>
      {children({ request, isUnlocked: unlocked })}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pp-identity-gate-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.55)',
          }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="pp-identity-gate-title"
              style={{
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
              }}
            >
              Your sovereign export is ready
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Where should we send your session recovery key and export summary?
            </div>

            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                placeholder="you@domain.com"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {error && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(239, 68, 68, 0.95)' }}>{error}</div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Local-first: we only capture an email as a routing key, plus first-touch attribution metadata (no
                portfolio/trade data).
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={close}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-warm)',
                  background: submitting ? 'rgba(245, 158, 11, 0.10)' : 'rgba(245, 158, 11, 0.14)',
                  color: 'var(--accent-warm)',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

