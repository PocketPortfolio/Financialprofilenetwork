'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import MobileHeader from '@/app/components/nav/MobileHeader';

interface SupportSubmission {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  attachmentCount: number;
  attachmentNames: string[];
  createdAt: string | null;
}

export default function AdminSupportPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [submissions, setSubmissions] = useState<SupportSubmission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCheckingAdmin(false);
      return;
    }
    const check = async () => {
      try {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims?.admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    check();
  }, [user]);

  useEffect(() => {
    if (!isAdmin || !user) return;
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        const token = await user.getIdToken(true);
        const res = await fetch('/api/admin/support', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 403 && (data.code === 'ADMIN_CLAIM_REQUIRED' || data.hint)) {
            setError(`Admin access required. ${data.hint ?? 'Sign out and sign back in.'}`);
          } else if (res.status === 401) {
            setError('Please sign in to view support submissions.');
          } else {
            const msg = data.error ?? 'Failed to fetch submissions';
            setError(res.status >= 500 ? `${msg} In production, set FIREBASE_* and ADMIN_EMAIL_OVERRIDE in Vercel (see docs/VERCEL-ENV-SUPPORT-ADMIN.md).` : msg);
          }
          setSubmissions([]);
          return;
        }
        setSubmissions(data.submissions ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load submissions');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isAdmin, user]);

  const isAuthenticated = !!user;

  if (loading || checkingAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--space-6)', background: 'var(--bg)', color: 'var(--text)' }}>
        <MobileHeader />
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-8)' }}>
          <p>{!isAuthenticated ? 'Please sign in to access this page.' : 'You need admin privileges to access this page.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <MobileHeader />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <Link href="/admin/analytics" style={{ padding: '8px 16px', borderRadius: '6px', background: 'var(--muted)', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Analytics</Link>
          <Link href="/admin/sales" style={{ padding: '8px 16px', borderRadius: '6px', background: 'var(--muted)', color: 'var(--text)', textDecoration: 'none', fontSize: '14px' }}>Sales</Link>
          <span style={{ padding: '8px 16px', borderRadius: '6px', background: 'var(--signal)', color: 'var(--text)', fontSize: '14px', fontWeight: 600 }}>Support</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Support submissions</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-4)' }}>This page is the source of truth for support requests. All submissions are stored here. A copy is also sent to ai@pocketportfolio.app (and to SUPPORT_EMAIL_TO if set); that copy may not appear in Resend Inbound or /admin/analytics.</p>
        {error && <p style={{ color: 'var(--destructive)', marginBottom: 'var(--space-4)' }}>{error}</p>}
        {loadingData ? (
          <p>Loading...</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No submissions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {submissions.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: 'var(--space-4)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <strong style={{ fontSize: '16px' }}>{s.subject}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>From:</strong> {s.name} &lt;{s.email}&gt;</p>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', margin: 'var(--space-2) 0', padding: 'var(--space-2)', background: 'var(--muted)', borderRadius: '4px' }}>{s.message}</pre>
                {s.attachmentCount > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Attachments: {s.attachmentNames.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
