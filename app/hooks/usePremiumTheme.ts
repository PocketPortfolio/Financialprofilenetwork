'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type PremiumTheme = 'founder' | 'corporate' | null;
type Tier = 'codeSupporter' | 'featureVoter' | 'corporateSponsor' | 'foundersClub' | null;

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
    // Check localStorage first for cached tier
    const cachedTier = localStorage.getItem('pocket-portfolio-tier') as Tier;
    const cachedTheme = localStorage.getItem('pocket-portfolio-premium-theme') as PremiumTheme;

    if (cachedTier && cachedTheme) {
      setTier(cachedTier);
      setUnlockedTheme(cachedTheme);
      setIsLoading(false);
      // Still refresh in background to ensure it's up to date
    }

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
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const userTier = data.tier as Tier;
        const userThemeAccess = data.themeAccess as PremiumTheme;

        if (userTier) {
          setTier(userTier);
          localStorage.setItem('pocket-portfolio-tier', userTier);

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
          // No tier found - clear cache if it exists
          localStorage.removeItem('pocket-portfolio-tier');
          localStorage.removeItem('pocket-portfolio-premium-theme');
        }
      } catch (error) {
        console.error('Error checking tier:', error);
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

