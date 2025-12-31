'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { trackSEOPageView, getSEOPageAttribution, trackSEOSignupConversion } from '../lib/analytics/seo';

/**
 * Client-side component to track SEO page views
 * Tracks views for all SEO-focused routes:
 * - /tools/* (conversion tools)
 * - /for/* (advisor tools)
 * - /s/* (ticker pages)
 * - /static/* (static SEO pages)
 * - /import/* (broker import pages)
 * Also tracks conversions when users sign up from these pages
 */
export default function SEOPageTracker() {
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAuth();
  const wasAuthenticatedRef = useRef(false);
  const hasTrackedConversionRef = useRef(false);

  useEffect(() => {
    // Track all SEO pages
    const isSEOPage = 
      pathname.startsWith('/tools/') ||
      pathname.startsWith('/for/') ||
      pathname.startsWith('/s/') ||
      pathname.startsWith('/static/') ||
      pathname.startsWith('/import/') ||
      pathname === '/openbrokercsv' ||
      pathname === '/blog';

    if (isSEOPage && !loading) {
      // Track page view (never mark as converted on view - only on actual signup)
      trackSEOPageView(pathname, false);
    }
  }, [pathname, loading]);

  // Track conversion when user signs up from SEO page
  useEffect(() => {
    if (loading) return;
    
    const wasAuthenticated = wasAuthenticatedRef.current;
    const isNowAuthenticated = isAuthenticated && !!user;
    
    // Detect signup: user was not authenticated, now they are
    if (!wasAuthenticated && isNowAuthenticated && !hasTrackedConversionRef.current) {
      // Check if user has SEO page attribution
      const attribution = getSEOPageAttribution();
      
      if (attribution) {
        // User signed up after viewing an SEO page - track conversion
        trackSEOSignupConversion(attribution.path);
        hasTrackedConversionRef.current = true;
      }
    }
    
    // Update ref for next render
    wasAuthenticatedRef.current = isNowAuthenticated;
  }, [isAuthenticated, user, loading]);

  return null;
}

