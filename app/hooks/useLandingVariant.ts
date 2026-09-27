'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LANDING_AB_IS_ACTIVE,
  LANDING_VARIANT_COOKIE,
  LANDING_VARIANT_TEST_ID,
  type LandingPageVariant,
  parseLandingVariantParam,
} from '@/lib/landing-retail-variant';
import { initializeABTest } from '@/app/lib/analytics/ab-testing';
import { RETAIL_LANDING_IA_TEST } from '@/app/lib/analytics/retail-landing-ab';

function readVariantCookie(): LandingPageVariant | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANDING_VARIANT_COOKIE}=([^;]*)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return parseLandingVariantParam(value);
}

/**
 * Resolves landing variant: URL param > cookie > A/B assignment > retail.
 * The A/B is frozen. Server render uses retail so control does not flash.
 * `?variant=control` still opens the control page.
 */
export function useLandingVariant(): LandingPageVariant {
  const searchParams = useSearchParams();
  const paramVariant = parseLandingVariantParam(searchParams.get('variant'));
  const [cookieVariant, setCookieVariant] = useState<LandingPageVariant | null>(null);
  const [abVariant, setAbVariant] = useState<LandingPageVariant | null>(null);

  useEffect(() => {
    setCookieVariant(readVariantCookie());
  }, [paramVariant]);

  useEffect(() => {
    if (!LANDING_AB_IS_ACTIVE) return;
    if (paramVariant) return;
    if (readVariantCookie()) return;
    const assigned = initializeABTest(RETAIL_LANDING_IA_TEST);
    if (!assigned) return;
    setAbVariant(assigned.variantId === 'retail' ? 'retail' : 'control');
  }, [paramVariant, cookieVariant]);

  return useMemo(() => {
    if (paramVariant) return paramVariant;
    if (cookieVariant) return cookieVariant;
    if (abVariant) return abVariant;
    return 'retail';
  }, [paramVariant, cookieVariant, abVariant]);
}

export function useLandingVariantTestId(): string {
  return LANDING_VARIANT_TEST_ID;
}
