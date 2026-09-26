'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import SignInOptions from '@/app/components/auth/SignInOptions';

/**
 * Canonical login URL for Pocket Portfolio.
 * Auth: Google or Microsoft (identity). Drive / OneDrive sync is a separate paid consent.
 */
export default function LoginPage() {
  const { isAuthenticated, signInWithGoogle, signInWithMicrosoft, user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 48px)',
        background: 'var(--background)',
        color: 'var(--text)',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 12,
          }}
        >
          Pocket Portfolio
        </p>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          Private local-first dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          Sign in with Google or Microsoft. Optional Sovereign Sync to a cloud folder you own is
          available on paid seats — identity consent stays separate from file access.
        </p>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Checking session…</p>
        ) : isAuthenticated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <p style={{ fontSize: 14 }}>Signed in as {user?.email || 'your account'}</p>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent-warm)',
                color: '#0a0a0a',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(245, 158, 11, 0.55)',
              }}
            >
              Open dashboard
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <SignInOptions
              busy={busy}
              emphasizeGoogle
              layout="stack"
              onGoogle={async () => {
                setBusy(true);
                try {
                  await signInWithGoogle();
                } finally {
                  setBusy(false);
                }
              }}
              onMicrosoft={async () => {
                setBusy(true);
                try {
                  await signInWithMicrosoft();
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e);
                  if (!msg.includes('popup-blocked')) {
                    alert(msg || 'Microsoft sign-in failed');
                  }
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>
        )}

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          Prefer CSV first?{' '}
          <Link href="/import" style={{ color: 'var(--accent-warm)' }}>
            Import without leaving your device
          </Link>
        </p>
      </div>
    </main>
  );
}
