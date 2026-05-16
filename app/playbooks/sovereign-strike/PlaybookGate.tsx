'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingLink from '@/app/components/MarketingLink';
import { useRouter } from 'next/navigation';

export function PlaybookGate() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/playbooks/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Access denied');
        return;
      }
      setSecret('');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '28rem',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '3rem 1rem',
        color: 'hsl(var(--foreground))',
      }}
    >
      <div style={{ width: '100%', marginBottom: '1.25rem' }}>
        <MarketingLink
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#94a3b8',
            textDecoration: 'none',
          }}
        >
          ← Main app (Dashboard)
        </MarketingLink>
        <p style={{ marginTop: '0.35rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
          Full navigation: bar fixed at bottom of screen
        </p>
      </div>
      <div
        className="rounded-lg border p-6"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--surface-elevated)',
        }}
      >
        <h1 className="mb-1 font-mono text-lg font-semibold">Internal playbook</h1>
        <p className="mb-4 text-sm opacity-80">
          Enter the team access code to open the Sovereign Strike matrix.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-wide opacity-70">Access code</label>
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="rounded border px-3 py-2 font-mono text-sm"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--surface)',
              color: 'inherit',
            }}
            placeholder="••••••••"
          />
          {error && (
            <p className="text-sm" style={{ color: '#ef4444' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="rounded px-4 py-2 font-mono text-sm font-semibold disabled:opacity-50"
            style={{
              background: 'var(--accent-warm)',
              color: '#0b0d10',
            }}
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </main>
  );
}
