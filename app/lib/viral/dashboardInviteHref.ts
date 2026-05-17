/**
 * Build /dashboard href preserving ?ref=REF-*&source= from the current URL so
 * Launch App matches user expectations; ReferralCapture also persists ref in
 * sessionStorage + pp_referral_code cookie.
 */
export function dashboardHrefWithInviteFromSearchParams(
  sp: { get(name: string): string | null } | null | undefined
): string {
  if (!sp) return '/dashboard';
  const ref = sp.get('ref');
  if (!ref || !ref.toUpperCase().startsWith('REF-')) return '/dashboard';
  const normalized = ref.toUpperCase();
  const source = sp.get('source') || sp.get('utm_source') || 'invite';
  return `/dashboard?ref=${encodeURIComponent(normalized)}&source=${encodeURIComponent(source)}`;
}
