'use client';

import { useEffect } from 'react';
import {
  oneDriveService,
  isMsalPopupHashReturn,
  hasMsalAuthResponse,
  clearExpectRedirect,
  MSAL_EXPECT_REDIRECT_KEY,
} from '@/app/lib/onedrive/oneDriveService';

/**
 * Completes MSAL full-page redirect when the URL has an auth response
 * (hash or query), then returns to Settings for App Folder setup.
 */
export default function MsalRedirectBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const authResponse = hasMsalAuthResponse();
    let expectRedirect = false;
    try {
      expectRedirect = sessionStorage.getItem(MSAL_EXPECT_REDIRECT_KEY) === '1';
    } catch {
      /* ignore */
    }

    if (isMsalPopupHashReturn()) {
      return;
    }

    // Stale expect without auth response — clear and init
    if (expectRedirect && !authResponse) {
      clearExpectRedirect();
      void oneDriveService.initialize();
      return;
    }

    if (!authResponse) {
      void oneDriveService.initialize();
      return;
    }

    // Auth response present (with or without expect flag) — complete it
    void (async () => {
      try {
        await oneDriveService.initialize();
        await oneDriveService.requestAccess({ interactive: false });
        if (window.location.hash || window.location.search.includes('code=')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        if (window.location.pathname !== '/settings') {
          window.location.replace('/settings');
        }
      } catch (err) {
        console.warn('MSAL redirect bootstrap:', err);
      }
    })();
  }, []);

  return null;
}
