'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to ensure header stays visible when scrolling by using fixed positioning
 * as a fallback when sticky positioning doesn't work due to layout constraints
 */
export function useStickyHeader(headerSelector: string = 'header.brand-header, header.mobile-header, nav[style*="position: sticky"]') {
  const appliedRef = useRef(false);

  useEffect(() => {
    const header = document.querySelector(headerSelector);
    if (!header || appliedRef.current) return;

    const applyFixedPositioning = () => {
      const rect = header.getBoundingClientRect();
      const headerHeight = rect.height;
      const computed = window.getComputedStyle(header);
      
      // Always use fixed for reliable behavior across all pages
      (header as HTMLElement).style.position = 'fixed';
      (header as HTMLElement).style.top = '0';
      (header as HTMLElement).style.left = '0';
      (header as HTMLElement).style.right = '0';
      (header as HTMLElement).style.width = '100%';
      (header as HTMLElement).style.zIndex = computed.zIndex || '1000';
      
      // Add padding to body to prevent content from jumping under fixed header
      const bodyPadding = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
      if (bodyPadding < headerHeight) {
        document.body.style.paddingTop = `${headerHeight}px`;
      }
      
      appliedRef.current = true;
    };
    
    // Apply immediately and on resize
    applyFixedPositioning();
    setTimeout(applyFixedPositioning, 100);
    window.addEventListener('resize', applyFixedPositioning, { passive: true });
    
    return () => {
      window.removeEventListener('resize', applyFixedPositioning);
      // Cleanup body padding only if this is the last header
      const otherHeaders = document.querySelectorAll(headerSelector);
      if (otherHeaders.length === 1) {
        document.body.style.paddingTop = '';
      }
    };
  }, [headerSelector]);
}


















