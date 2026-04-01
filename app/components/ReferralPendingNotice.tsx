'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { getReferralCodeCookie } from '@/app/lib/viral/referralCookie';

const STORAGE_KEY = 'referral_code';

/**
 * On /dashboard, reassure invitees that ref is stored even when the URL bar
 * was briefly plain /dashboard (e.g. older bookmarks or client nav).
 */
export default function ReferralPendingNotice() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pathname !== '/dashboard' || loading || user) {
      setPending(false);
      return;
    }
    try {
      const fromStore = sessionStorage.getItem(STORAGE_KEY);
      const fromCookie = getReferralCodeCookie();
      const code = fromStore || fromCookie;
      setPending(!!code && code.toUpperCase().startsWith('REF-'));
    } catch {
      setPending(false);
    }
  }, [pathname, user, loading]);

  if (!pending) return null;

  return (
    <div
      role="status"
      className="referral-pending-notice"
      style={{
        margin: 0,
        padding: '10px 16px',
        fontSize: '13px',
        lineHeight: 1.45,
        textAlign: 'center',
        color: 'var(--text)',
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.06))',
        borderBottom: '1px solid var(--border-subtle, var(--border))',
      }}
    >
      Invite link active on this device — sign in with Google to finish. Your referral code is saved
      until you sign in or clear site data.
    </div>
  );
}
