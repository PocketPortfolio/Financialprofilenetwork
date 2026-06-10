'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { LandingPageVariant } from '@/lib/landing-retail-variant';
import { LANDING_VARIANT_TEST_ID } from '@/lib/landing-retail-variant';
import { getCurrentUtm } from '@/app/lib/analytics/events';
import { trackABTestExposure } from '@/app/lib/analytics/conversion';

const SESSION_KEY = 'pp_landing_ab_session';

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === 'undefined') return 'ssr';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function postLandingAbEvent(
  eventType: 'exposure' | 'bounce' | 'csv_aha' | 'checkout_start',
  landingVariant: LandingPageVariant,
  extra?: Record<string, string>
) {
  if (typeof window === 'undefined') return;
  const utm = getCurrentUtm();
  void fetch('/api/analytics/landing-ab-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      landingVariant,
      path: window.location.pathname,
      sessionId: getOrCreateSessionId(),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      ...extra,
    }),
  }).catch(() => {});
}

/** Log page exposure + proxy bounce (leave <12s without engagement). */
export function useLandingAbTelemetry(landingVariant: LandingPageVariant) {
  const pathname = usePathname();
  const engagedRef = useRef(false);
  const exposedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (pathname !== '/' && pathname !== '/landing') return;
    if (exposedRef.current) return;
    exposedRef.current = true;
    mountTimeRef.current = Date.now();
    postLandingAbEvent('exposure', landingVariant);
    trackABTestExposure({
      testId: LANDING_VARIANT_TEST_ID,
      variantId: landingVariant,
      variantName: landingVariant === 'retail' ? 'Retail (Educational IA)' : 'Control (Sovereign IA)',
      isControl: landingVariant === 'control',
    });

    const markEngaged = () => {
      engagedRef.current = true;
    };
    window.addEventListener('scroll', markEngaged, { passive: true, once: true });
    window.addEventListener('pointerdown', markEngaged, { once: true });
    window.addEventListener('keydown', markEngaged, { once: true });

    const onLeave = () => {
      if (engagedRef.current) return;
      const elapsed = Date.now() - mountTimeRef.current;
      if (elapsed < 12_000) {
        postLandingAbEvent('bounce', landingVariant);
      }
    };

    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('scroll', markEngaged);
      window.removeEventListener('pointerdown', markEngaged);
      window.removeEventListener('keydown', markEngaged);
    };
  }, [pathname, landingVariant]);
}

export function logLandingCsvAha(landingVariant: LandingPageVariant) {
  postLandingAbEvent('csv_aha', landingVariant);
}

export function logLandingCheckoutStart(landingVariant: LandingPageVariant) {
  postLandingAbEvent('checkout_start', landingVariant);
}
