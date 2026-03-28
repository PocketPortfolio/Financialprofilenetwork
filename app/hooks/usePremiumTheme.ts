'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { isPaidTier, type PaidTier } from '../lib/tier';

type PremiumTheme = 'founder' | 'corporate' | null;
type Tier = 'codeSupporter' | 'featureVoter' | 'corporateSponsor' | 'foundersClub' | null;

function themeForPaidTier(tier: PaidTier, themeAccess: PremiumTheme | null): PremiumTheme | null {
  if (themeAccess) return themeAccess;
  if (tier === 'foundersClub') return 'founder';
  if (tier === 'corporateSponsor') return 'corporate';
  return null;
}

/** Last known paid tier from localStorage (pocket-portfolio-tier or Settings apiKeys_* cache). */
function readCachedPaidTier(
  isAuthenticated: boolean,
  userEmail: string | null | undefined,
  sponsorEmail: string | null
): PaidTier | null {
  const pocket = localStorage.getItem('pocket-portfolio-tier');
  if (isPaidTier(pocket)) return pocket;

  const email = (isAuthenticated && userEmail) || sponsorEmail;
  if (!email) return null;
  try {
    const raw = localStorage.getItem(`apiKeys_${email}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as { tier?: string };
    if (isPaidTier(data?.tier)) return data.tier;
  } catch {
    /* ignore */
  }
  return null;
}

function applyPaidTierFromBrowserCache(
  paid: PaidTier,
  setTier: (t: Tier) => void,
  setUnlockedTheme: (t: PremiumTheme) => void
) {
  setTier(paid);
  const cachedTheme = localStorage.getItem('pocket-portfolio-premium-theme') as PremiumTheme;
  const theme = themeForPaidTier(paid, cachedTheme && (cachedTheme === 'founder' || cachedTheme === 'corporate') ? cachedTheme : null);
  if (theme) {
    setUnlockedTheme(theme);
    localStorage.setItem('pocket-portfolio-premium-theme', theme);
  }
  localStorage.setItem('pocket-portfolio-tier', paid);
}

/**
 * Hook to check user's subscription tier and unlock premium themes
 * Themes are unlocked based on tier:
 * - foundersClub → 'founder' theme
 * - corporateSponsor → 'corporate' theme
 * 
 * Automatically uses authenticated user's email when available
 */
export function usePremiumTheme() {
  const [unlockedTheme, setUnlockedTheme] = useState<PremiumTheme>(null);
  const [tier, setTier] = useState<Tier>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const cachedTier = localStorage.getItem('pocket-portfolio-tier') as Tier;
    const cachedTheme = localStorage.getItem('pocket-portfolio-premium-theme') as PremiumTheme;

    // Determine which email to use and which endpoint to call
    let emailToCheck: string | null = null;
    let useAuthenticatedEndpoint = false;

    if (isAuthenticated && user?.email) {
      // Priority 1: Use authenticated user's email
      emailToCheck = user.email;
      useAuthenticatedEndpoint = true;
      // Store in localStorage for consistency
      if (!localStorage.getItem('sponsor_email')) {
        localStorage.setItem('sponsor_email', user.email);
      }
    } else {
      // Priority 2: Fall back to localStorage email
      emailToCheck = localStorage.getItem('sponsor_email');
    }

    if (!emailToCheck) {
      setTier(null);
      setUnlockedTheme(null);
      setIsLoading(false);
      return;
    }

    // Fetch tier from API
    const checkTier = async () => {
      try {
        let response: Response;
        
        if (useAuthenticatedEndpoint && user) {
          // Use authenticated endpoint (requires Firebase ID token)
          try {
            const idToken = await user.getIdToken();
            response = await fetch('/api/api-keys/user', {
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
            });
          } catch (tokenError) {
            // If token fetch fails, fall back to query parameter endpoint (more reliable)
            console.warn('Failed to get ID token, falling back to email lookup:', tokenError);
            response = await fetch(`/api/api-keys?email=${encodeURIComponent(emailToCheck!)}`);
          }
        } else {
          // Use query parameter endpoint (more reliable than path parameter with @ symbol)
          response = await fetch(`/api/api-keys?email=${encodeURIComponent(emailToCheck)}`);
        }

        if (!response.ok) {
          // 503: unauthenticated may restore any cached tier + theme from a prior session
          if (response.status === 503 && !isAuthenticated && cachedTier && cachedTheme) {
            setTier(cachedTier);
            setUnlockedTheme(cachedTheme);
          } else if (isAuthenticated && user?.email) {
            // Transient errors (429, 5xx, etc.): keep last known paid tier so upsells (e.g. Founders banner) never target upgraded users
            const sponsorEmail = localStorage.getItem('sponsor_email');
            const paid = readCachedPaidTier(true, user.email, sponsorEmail);
            if (paid) {
              applyPaidTierFromBrowserCache(paid, setTier, setUnlockedTheme);
            } else {
              setTier(null);
              setUnlockedTheme(null);
            }
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const userTier = data.tier as Tier;
        const userThemeAccess = data.themeAccess as PremiumTheme;

        if (userTier) {
          setTier(userTier);
          localStorage.setItem('pocket-portfolio-tier', userTier);
          localStorage.setItem('pocket-portfolio-tier-timestamp', Date.now().toString());

          // Use themeAccess from API if available, otherwise map tier to theme
          let theme: PremiumTheme = userThemeAccess || null;
          if (!theme) {
            if (userTier === 'foundersClub') {
              theme = 'founder';
            } else if (userTier === 'corporateSponsor') {
              theme = 'corporate';
            }
          }

          if (theme) {
            setUnlockedTheme(theme);
            localStorage.setItem('pocket-portfolio-premium-theme', theme);
          }
        } else {
          // No tier found (e.g. revoked or free) — must reset React state, not only localStorage
          setTier(null);
          setUnlockedTheme(null);
          localStorage.removeItem('pocket-portfolio-tier');
          localStorage.removeItem('pocket-portfolio-premium-theme');
          localStorage.removeItem('pocket-portfolio-tier-timestamp');
          localStorage.removeItem('CORPORATE_KEY');
          if (user?.email) {
            const ek = `apiKeys_${user.email}`;
            localStorage.removeItem(ek);
            localStorage.removeItem(`${ek}_timestamp`);
          }
        }
      } catch (error) {
        console.error('Error checking tier:', error);
        if (!isAuthenticated && cachedTier && cachedTheme) {
          setTier(cachedTier);
          setUnlockedTheme(cachedTheme);
        } else if (isAuthenticated && user?.email) {
          const sponsorEmail = localStorage.getItem('sponsor_email');
          const paid = readCachedPaidTier(true, user.email, sponsorEmail);
          if (paid) {
            applyPaidTierFromBrowserCache(paid, setTier, setUnlockedTheme);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkTier();
  }, [user, isAuthenticated]); // Re-run when auth state changes

  // Note: Theme application is handled by PremiumThemeProvider component
  // This hook only manages the state and data fetching

  return {
    unlockedTheme,
    tier,
    isLoading,
    hasFounderTheme: tier === 'foundersClub',
    hasCorporateTheme: tier === 'corporateSponsor',
  };
}

