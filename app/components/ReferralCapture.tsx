'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { trackViralReferral } from '@/app/lib/analytics/viral';
import { VIRAL_REFERRAL_CAMPAIGN_DEFAULT } from '@/app/lib/viral/referralCodeServer';

const REFERRAL_CODE_KEY = 'referral_code';
const REFERRAL_SOURCE_KEY = 'referral_source';

/**
 * Captures ?ref=REF-* on landing, logs click once per code, and completes referral reward after sign-in.
 */
export default function ReferralCapture() {
  const { user, loading } = useAuth();
  const clickLoggedRef = useRef(false);
  const completeInFlightRef = useRef(false);

  // Landing: persist ref + fire click analytics once (Strict Mode safe via ref + sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (!ref || !ref.toUpperCase().startsWith('REF-')) return;

      const normalized = ref.toUpperCase();
      sessionStorage.setItem(REFERRAL_CODE_KEY, normalized);
      const src = params.get('source') || params.get('utm_source') || 'landing';
      sessionStorage.setItem(REFERRAL_SOURCE_KEY, src);

      const logKey = `referral_click_logged_${normalized}`;
      if (sessionStorage.getItem(logKey)) return;
      if (clickLoggedRef.current) return;
      clickLoggedRef.current = true;
      sessionStorage.setItem(logKey, '1');

      const campaign =
        params.get('utm_campaign') || VIRAL_REFERRAL_CAMPAIGN_DEFAULT;
      void trackViralReferral({
        action: 'click',
        referralCode: normalized,
        source: src,
        campaign,
        metadata: { campaign },
      });
    } catch {
      /* ignore */
    }
  }, []);

  // Post-auth: server-authoritative referral completion (idempotent on server)
  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === 'undefined') return;

    let code: string | null = null;
    try {
      code = sessionStorage.getItem(REFERRAL_CODE_KEY);
    } catch {
      return;
    }
    if (!code) return;

    const sessionFlag = `referral_complete_ok_${code}`;
    if (sessionStorage.getItem(sessionFlag)) return;
    if (completeInFlightRef.current) return;
    completeInFlightRef.current = true;

    void (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/referral/complete', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            referralCode: code,
            campaign: VIRAL_REFERRAL_CAMPAIGN_DEFAULT,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          code?: string;
        };

        if (res.ok && data.ok) {
          try {
            sessionStorage.setItem(sessionFlag, '1');
            sessionStorage.removeItem(REFERRAL_CODE_KEY);
            sessionStorage.removeItem(REFERRAL_SOURCE_KEY);
          } catch {
            /* ignore */
          }
          return;
        }

        if (data.code === 'REFEREE_NOT_NEW' || res.status === 403) {
          try {
            sessionStorage.setItem(sessionFlag, '1');
            sessionStorage.removeItem(REFERRAL_CODE_KEY);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* network error — allow retry on next navigation */
      } finally {
        completeInFlightRef.current = false;
      }
    })();
  }, [user, loading]);

  return null;
}
