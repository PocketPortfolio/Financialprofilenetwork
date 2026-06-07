'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { DesktopNavProvider } from '../hooks/useDesktopNav';
import { SovereignHeader } from '../components/dashboard/SovereignHeader';
import DesktopNav from '../components/nav/DesktopNav';
import layoutStyles from './DashboardClientLayout.module.css';

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
    <DesktopNavProvider>
      <div
        data-tier={getTierForDataAttribute(tier)}
        className={`sovereign-dashboard pp-dashboard-shell ${layoutStyles.shell}`}
        style={{
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <SovereignHeader
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
          lastSyncTime={syncState.lastSyncTime}
          user={user}
        />

        <div className={`pp-dashboard-shell-row ${layoutStyles.shellRow}`}>
          <DesktopNav />

          <main data-dashboard-content className={`pp-dashboard-main ${layoutStyles.mainViewport}`}>
            <div className={layoutStyles.mainContent}>{children}</div>
          </main>
        </div>
      </div>
    </DesktopNavProvider>
  );
}
