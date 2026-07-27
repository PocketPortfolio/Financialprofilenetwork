'use client';

import { useEffect } from 'react';
import { storeLandingPage } from '../lib/analytics/events';
import { captureFirstTouchAttribution } from '../lib/analytics/attribution';
import { purifyClientAcquisitionFromUrl } from '../lib/analytics/clean-tracker';

/**
 * Client-side component to track landing page and UTM parameters
 * for attribution in Google Analytics events.
 * Self-UTM loops (json_api cluster) are purified out of acquisition.
 */
export default function LandingPageTracker() {
  useEffect(() => {
    const currentPage = window.location.pathname;
    storeLandingPage(currentPage);
    purifyClientAcquisitionFromUrl();
    captureFirstTouchAttribution();
  }, []);

  return null;
}

