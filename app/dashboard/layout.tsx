'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import FoundersClubBanner from '../components/FoundersClubBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { tier } = usePremiumTheme();
  const { syncState } = useGoogleDrive();

  // Map tier to data-tier attribute for CSS targeting
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
      {/* 🎨 HEADER - Persists across all dashboard pages */}
      <SovereignHeader 
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'} 
        lastSyncTime={syncState.lastSyncTime}
        user={user}
      />

      {/* Founders Club Banner - Sticky at top for free tier users */}
      <FoundersClubBanner />

      {/* 🎨 CONTENT SLOT - Where sub-pages render */}
      <main 
        className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6"
        data-dashboard-content
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '16px',
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}

