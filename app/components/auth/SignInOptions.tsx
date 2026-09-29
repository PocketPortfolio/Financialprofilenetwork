'use client';

import React from 'react';

type SignInOptionsProps = {
  onGoogle: () => void | Promise<void>;
  onMicrosoft: () => void | Promise<void>;
  busy?: boolean;
  layout?: 'stack' | 'row';
  /** When true, Google is the amber CTA. Microsoft stays elevated surface with a warm border. */
  emphasizeGoogle?: boolean;
};

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

/**
 * Dual identity CTAs. Anyone may use either. Sync remains a separate paid plane.
 */
export default function SignInOptions({
  onGoogle,
  onMicrosoft,
  busy = false,
  layout = 'stack',
  emphasizeGoogle = true,
}: SignInOptionsProps) {
  const secondaryChrome: React.CSSProperties = {
    background: 'var(--surface-elevated)',
    color: 'var(--text)',
    border: '1px solid var(--border-warm)',
    borderRadius: 4,
    appearance: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
  };

  const googleStyle: React.CSSProperties = emphasizeGoogle
    ? {
        padding: '12px 20px',
        background: 'var(--accent-warm)',
        color: '#0a0a0a',
        border: '1px solid rgba(245, 158, 11, 0.55)',
        borderRadius: 4,
        fontSize: 14,
        fontWeight: 700,
        cursor: busy ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: busy ? 0.6 : 1,
        width: layout === 'stack' ? '100%' : undefined,
        appearance: 'none',
        WebkitAppearance: 'none',
        boxSizing: 'border-box',
      }
    : {
        ...secondaryChrome,
        padding: '10px 16px',
        fontSize: 14,
        cursor: busy ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: busy ? 0.6 : 1,
      };

  const microsoftStyle: React.CSSProperties = {
    ...secondaryChrome,
    padding: emphasizeGoogle ? '12px 20px' : '10px 16px',
    fontSize: 14,
    fontWeight: emphasizeGoogle ? 600 : 500,
    cursor: busy ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: busy ? 0.6 : 1,
    width: layout === 'stack' ? '100%' : undefined,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'stack' ? 'column' : 'row',
        gap: 10,
        alignItems: layout === 'stack' ? 'stretch' : 'center',
        flexWrap: 'wrap',
      }}
    >
      <button type="button" disabled={busy} onClick={() => void onGoogle()} style={googleStyle}>
        <GoogleMark />
        Sign in with Google
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onMicrosoft()}
        style={microsoftStyle}
      >
        <MicrosoftMark />
        Sign in with Microsoft
      </button>
    </div>
  );
}
