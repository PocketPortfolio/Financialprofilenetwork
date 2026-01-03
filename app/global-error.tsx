'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'var(--bg)',
          color: 'var(--text)'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text)'
          }}>
            500
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            Something went wrong!
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-warm)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'opacity 0.2s'
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
















