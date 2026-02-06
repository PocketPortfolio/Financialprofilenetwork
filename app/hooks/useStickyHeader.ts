'use client';

import { useEffect } from 'react';

/**
 * Hook to ensure header stays visible when scrolling by using fixed positioning
 * as a fallback when sticky positioning doesn't work due to layout constraints.
 * Re-runs when the global founders banner appears or resizes (e.g. after tier revoke + refresh).
 */
export function useStickyHeader(headerSelector: string = 'header.brand-header, header.mobile-header, nav[style*="position: sticky"]') {
  useEffect(() => {
    const header = document.querySelector(headerSelector);
    if (!header) return;

    const applyFixedPositioning = () => {
      const rect = header.getBoundingClientRect();
      const headerHeight = rect.height;
      const computed = window.getComputedStyle(header);

      // Detect global founders club banner (may appear after tier is cleared on refresh)
      const banner = document.querySelector('.founder-banner, .global-founders-banner');
      let bannerHeight = 0;
      if (banner) {
        const bannerRect = banner.getBoundingClientRect();
        bannerHeight = bannerRect.height;
      }

      // Always use fixed for reliable behavior across all pages
      (header as HTMLElement).style.position = 'fixed';
      (header as HTMLElement).style.top = `${bannerHeight}px`; // Position below banner
      (header as HTMLElement).style.left = '0';
      (header as HTMLElement).style.right = '0';
      (header as HTMLElement).style.width = '100%';
      (header as HTMLElement).style.zIndex = computed.zIndex || '1000';

      // Add padding to body so content starts below fixed header and banner
      const totalHeaderHeight = bannerHeight + headerHeight;
      document.body.style.paddingTop = `${totalHeaderHeight}px`;
    };

    // Apply immediately, after a short delay (banner may not be in DOM yet), and on resize
    applyFixedPositioning();
    const t1 = setTimeout(applyFixedPositioning, 100);
    const t2 = setTimeout(applyFixedPositioning, 400); // Catch banner appearing after tier revalidate
    const t3 = setTimeout(applyFixedPositioning, 1000);
    window.addEventListener('resize', applyFixedPositioning, { passive: true });

    // Re-run when banner resizes (e.g. tier revoke: banner appears and we need to re-run)
    let resizeObserver: ResizeObserver | undefined;
    const observeBanner = () => {
      const banner = document.querySelector('.founder-banner, .global-founders-banner');
      if (banner && typeof ResizeObserver !== 'undefined' && !resizeObserver) {
        resizeObserver = new ResizeObserver(applyFixedPositioning);
        resizeObserver.observe(banner);
      }
    };
    observeBanner();
    const t4 = setTimeout(() => { observeBanner(); applyFixedPositioning(); }, 600);

    return () => {
      window.removeEventListener('resize', applyFixedPositioning);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      resizeObserver?.disconnect();
      // Cleanup body padding only if this is the last header
      const otherHeaders = document.querySelectorAll(headerSelector);
      if (otherHeaders.length === 1) {
        document.body.style.paddingTop = '';
      }
    };
  }, [headerSelector]);
}


















