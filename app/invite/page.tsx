'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import ReferralProgram from '../components/viral/ReferralProgram';

export default function InvitePage() {
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const { syncState } = useGoogleDrive();

  if (!isAuthenticated) {
    return (
      <div
        className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <SEOHead
          title="Invite friends - Pocket Portfolio"
          description="Share Pocket Portfolio with friends and grow the community"
        />
        <SovereignHeader
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
          lastSyncTime={syncState.lastSyncTime}
          user={user}
        />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            paddingTop: 'calc(64px + 48px + 4px)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to invite friends</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Get your referral link and share Pocket Portfolio.
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <SEOHead
        title="Invite friends - Pocket Portfolio"
        description="Share Pocket Portfolio with friends and grow the community"
      />
      <SovereignHeader
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
        lastSyncTime={syncState.lastSyncTime}
        user={user}
      />
      <main
        style={{
          flex: 1,
          padding: '20px',
          paddingTop: 'calc(64px + 48px + 4px)',
          maxWidth: '640px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--text)' }}>
            Invite friends
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', margin: 0 }}>
            Share your link and help others track their portfolio with Pocket Portfolio.
          </p>
        </div>
        <ReferralProgram userId={user?.uid} />
        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
          <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
            Back to dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
