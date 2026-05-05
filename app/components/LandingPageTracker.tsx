'use client';

import { useEffect } from 'react';
import { storeLandingPage } from '../lib/analytics/events';
import { captureFirstTouchAttribution } from '../lib/analytics/attribution';

/**
 * Client-side component to track landing page and UTM parameters
 * for attribution in Google Analytics events
 */
export default function LandingPageTracker() {
  useEffect(() => {
    // Store landing page and UTM parameters on first page load
    const currentPage = window.location.pathname;
    storeLandingPage(currentPage);
    captureFirstTouchAttribution();
  }, []);

  return null;
}

