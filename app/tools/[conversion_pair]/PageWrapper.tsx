'use client';

import { useEffect, ReactNode } from 'react';

/**
 * Wrapper component that suppresses browser extension errors
 * and ensures proper client-side rendering
 */
export default function PageWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Suppress known browser extension errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const errorMsg = args[0]?.toString() || '';
      // Suppress extension-related errors
      if (
        errorMsg.includes('checkoutUrls') ||
        errorMsg.includes('MutationObserver') ||
        errorMsg.includes('web-client-content-script') ||
        errorMsg.includes('background.js') ||
        errorMsg.includes('content.js') ||
        errorMsg.includes('Failed to execute \'observe\' on \'MutationObserver\'')
      ) {
        return; // Suppress extension errors
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const warnMsg = args[0]?.toString() || '';
      // Suppress extension-related warnings
      if (
        warnMsg.includes('checkoutUrls') ||
        warnMsg.includes('web-client-content-script')
      ) {
        return; // Suppress extension warnings
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return <>{children}</>;
}



