'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import ProductionNavbar from '../components/marketing/ProductionNavbar';

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { tier } = usePremiumTheme();
  const { syncState } = useGoogleDrive();
  useEffect(() => {
    try {
      sessionStorage.setItem('pp-post-auth-redirect-done', '1');
    } catch (_) {}
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
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <ProductionNavbar />

      <main
        className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-8"
        data-dashboard-content
        style={{
          minHeight: 'calc(100vh - 80px)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
