'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { tier } = usePremiumTheme();
  const { syncState } = useGoogleDrive();
  useEffect(() => {
    try { sessionStorage.setItem('pp-post-auth-redirect-done', '1'); } catch (_) {}
  }, []);

  const getTierForDataAttribute = (tier: string | null): 'free' | 'founder' | 'corporate' => {
    if (tier === 'foundersClub') return 'founder';
    if (tier === 'corporateSponsor') return 'corporate';
    return 'free';
  };

  return (
    <div
      data-tier={getTierForDataAttribute(tier)}
      className="sovereign-dashboard min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <SovereignHeader
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
        lastSyncTime={syncState.lastSyncTime}
        user={user}
      />

      <main
        className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6"
        data-dashboard-content
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '16px',
          paddingTop: 'calc(var(--header-height, 64px) + 4px)',
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}
