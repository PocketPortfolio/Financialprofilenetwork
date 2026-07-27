'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

/**
 * Canonical navigational login URL for brand SERP ("pocket folio login").
 * Auth is Google popup; successful sessions continue to /dashboard.
 */
export default function LoginPage() {
  const { isAuthenticated, signInWithGoogle, user, loading } = useAuth();

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
          Pocket Portfolio · PocketFolio · Pocket Folio
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
          Sign in to sync preferences and unlock Drive sync. Your raw ledger stays on-device — local CSV
          import works without an account.
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
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            style={{
              padding: '12px 24px',
              background: 'var(--accent-warm)',
              color: '#0a0a0a',
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.55)',
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            Sign in with Google
          </button>
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
