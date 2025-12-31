/**
 * MODE 3: Funnel Tracker Component
 * Automatically tracks user journey through conversion funnel
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackFunnelStage, 
  trackScrollDepth, 
  trackTimeOnPage,
  FunnelStage 
} from '@/app/lib/analytics/conversion';

interface FunnelTrackerProps {
  funnelName?: string;
  stage: FunnelStage;
  autoTrackScroll?: boolean;
  autoTrackTime?: boolean;
}

export default function FunnelTracker({
  funnelName = 'user_onboarding',
  stage,
  autoTrackScroll = true,
  autoTrackTime = true
}: FunnelTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Track funnel stage entry
    trackFunnelStage(stage, funnelName, {
      page: pathname,
      timestamp: new Date().toISOString()
    });
  }, [stage, funnelName, pathname]);

  useEffect(() => {
    if (!autoTrackScroll && !autoTrackTime) return;

    let scrollDepth = 0;
    let timeStart = Date.now();
    let scrollTracked: Set<number> = new Set();
    let timeTracked: Set<number> = new Set();

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round(
        (scrollTop / (documentHeight - windowHeight)) * 100
      );

      if (autoTrackScroll && scrollPercent > scrollDepth) {
        scrollDepth = scrollPercent;
        trackScrollDepth(scrollPercent, pathname);
      }
    };

    // Track time on page
    const handleTimeTracking = () => {
      const seconds = Math.floor((Date.now() - timeStart) / 1000);
      const milestones = [30, 60, 120, 300, 600];
      
      milestones.forEach(milestone => {
        if (autoTrackTime && seconds >= milestone && !timeTracked.has(milestone)) {
          timeTracked.add(milestone);
          trackTimeOnPage(milestone, pathname);
        }
      });
    };

    // Set up event listeners
    if (autoTrackScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    if (autoTrackTime) {
      const timeInterval = setInterval(handleTimeTracking, 10000); // Check every 10s
      
      return () => {
        if (autoTrackScroll) {
          window.removeEventListener('scroll', handleScroll);
        }
        if (autoTrackTime) {
          clearInterval(timeInterval);
          // Track final time on page
          const finalSeconds = Math.floor((Date.now() - timeStart) / 1000);
          if (finalSeconds > 0) {
            trackTimeOnPage(finalSeconds, pathname);
          }
        }
      };
    }

    return () => {
      if (autoTrackScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pathname, autoTrackScroll, autoTrackTime]);

  return null; // This component doesn't render anything
}


















