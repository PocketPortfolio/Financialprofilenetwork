'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import { isPaidTier, type PaidTier } from '../lib/tier';

export type PremiumTheme = 'founder' | 'corporate' | null;
export type Tier =
  | 'codeSupporter'
  | 'featureVoter'
  | 'corporateSponsor'
  | 'foundersClub'
  | null;

type PremiumTierContextValue = {
  unlockedTheme: PremiumTheme;
  tier: Tier;
  isLoading: boolean;
  hasFounderTheme: boolean;
  hasCorporateTheme: boolean;
};

const PremiumTierContext = createContext<PremiumTierContextValue | undefined>(
  undefined
);

function themeForPaidTier(
  tier: PaidTier,
  themeAccess: PremiumTheme | null
): PremiumTheme | null {
  if (themeAccess) return themeAccess;
  if (tier === 'foundersClub') return 'founder';
  if (tier === 'corporateSponsor') return 'corporate';
  return null;
}

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
  const cachedTheme = localStorage.getItem(
    'pocket-portfolio-premium-theme'
  ) as PremiumTheme;
  const theme = themeForPaidTier(
    paid,
    cachedTheme && (cachedTheme === 'founder' || cachedTheme === 'corporate')
      ? cachedTheme
      : null
  );
  if (theme) {
    setUnlockedTheme(theme);
    localStorage.setItem('pocket-portfolio-premium-theme', theme);
  }
  localStorage.setItem('pocket-portfolio-tier', paid);
}

/**
 * Single app-wide tier fetch. Previously every usePremiumTheme() call ran its own
 * effect — many components on one page → parallel GETs and 429s.
 */
export function PremiumTierProvider({ children }: { children: ReactNode }) {
  const [unlockedTheme, setUnlockedTheme] = useState<PremiumTheme>(null);
  const [tier, setTier] = useState<Tier>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  /** Survives transient degraded+null API responses (Firestore quota) without locking premium UI. */
  const lastKnownPaidRef = useRef<{ tier: PaidTier; theme: PremiumTheme } | null>(null);

  useEffect(() => {
    const cachedTier = localStorage.getItem('pocket-portfolio-tier') as Tier;
    const cachedTheme = localStorage.getItem(
      'pocket-portfolio-premium-theme'
    ) as PremiumTheme;
    const cachedTierTsRaw = localStorage.getItem('pocket-portfolio-tier-timestamp');
    const cachedTierTs = cachedTierTsRaw ? Number(cachedTierTsRaw) : NaN;

    // Hydrate immediately from browser cache to prevent UI "downgrade flash"
    // while network/auth tier checks are pending or Firestore is degraded.
    if (cachedTier) {
      setTier(cachedTier);
    }
    if (cachedTheme) {
      setUnlockedTheme(cachedTheme);
    }
    if (isPaidTier(cachedTier)) {
      const th =
        cachedTheme === 'founder' || cachedTheme === 'corporate'
          ? cachedTheme
          : cachedTier === 'foundersClub'
            ? 'founder'
            : 'corporate';
      lastKnownPaidRef.current = { tier: cachedTier, theme: th };
    }
    
    let emailToCheck: string | null = null;
    let useAuthenticatedEndpoint = false;

    if (isAuthenticated && user?.email) {
      emailToCheck = user.email;
      useAuthenticatedEndpoint = true;
      if (!localStorage.getItem('sponsor_email')) {
        localStorage.setItem('sponsor_email', user.email);
      }
    } else {
      emailToCheck = localStorage.getItem('sponsor_email');
    }

    if (!emailToCheck) {
      setTier(null);
      setUnlockedTheme(null);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    const checkTier = async () => {
      try {
        // If we have a recent cached tier, don't hammer Firestore during quota incidents.
        // This does not change business logic: it avoids a known-bad dependency while degraded.
        const cacheTtlMs = 10 * 60 * 1000;
        if (
          cachedTier &&
          Number.isFinite(cachedTierTs) &&
          Date.now() - cachedTierTs < cacheTtlMs
        ) {
                    setIsLoading(false);
          return;
        }

        let response: Response;

        if (useAuthenticatedEndpoint && user) {
          try {
            const idToken = await user.getIdToken();
            response = await fetch('/api/api-keys/user', {
              signal: abortController.signal,
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });
          } catch (tokenError) {
            console.warn(
              'Failed to get ID token, falling back to email lookup:',
              tokenError
            );
            response = await fetch(
              `/api/api-keys?email=${encodeURIComponent(emailToCheck!)}`,
              {
                signal: abortController.signal,
              }
            );
          }
        } else {
          response = await fetch(
            `/api/api-keys?email=${encodeURIComponent(emailToCheck)}`,
            {
              signal: abortController.signal,
            }
          );
        }

        if (!response.ok) {
                    const throttleOrUnavailable =
            response.status === 429 || response.status === 503;
          if (
            response.status === 503 &&
            !isAuthenticated &&
            cachedTier &&
            cachedTheme
          ) {
            setTier(cachedTier);
            setUnlockedTheme(cachedTheme);
          } else if (isAuthenticated && user?.email) {
            if (throttleOrUnavailable) {
              const lk = lastKnownPaidRef.current;
              if (lk) {
                setTier(lk.tier);
                setUnlockedTheme(lk.theme);
              } else {
                const sponsorEmail = localStorage.getItem('sponsor_email');
                const paid = readCachedPaidTier(true, user.email, sponsorEmail);
                if (paid) {
                  applyPaidTierFromBrowserCache(paid, setTier, setUnlockedTheme);
                } else if (cachedTier || cachedTheme) {
                  if (cachedTier) setTier(cachedTier);
                  if (cachedTheme) setUnlockedTheme(cachedTheme);
                }
              }
            } else {
              const sponsorEmail = localStorage.getItem('sponsor_email');
              const paid = readCachedPaidTier(true, user.email, sponsorEmail);
              if (paid) {
                applyPaidTierFromBrowserCache(paid, setTier, setUnlockedTheme);
              } else {
                setTier(null);
                setUnlockedTheme(null);
              }
            }
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const isDegraded =
          Boolean((data as any)?.degraded) ||
          typeof (data as any)?.degradedReason === 'string';
        const userTier = data.tier as Tier;
        const userThemeAccess = data.themeAccess as PremiumTheme;

        
        // If Firestore is throttling or unavailable, do NOT wipe premium status.
        // Keep last-known tier/theme from browser cache when available.
        if (!userTier && isDegraded) {
          if (user) {
            try {
              const tr = await user.getIdTokenResult();
              if (tr.claims.admin === true) {
                const th: PremiumTheme = 'founder';
                setTier('foundersClub');
                setUnlockedTheme(th);
                lastKnownPaidRef.current = { tier: 'foundersClub', theme: th };
                localStorage.setItem('pocket-portfolio-tier', 'foundersClub');
                localStorage.setItem('pocket-portfolio-premium-theme', th);
                localStorage.setItem('pocket-portfolio-tier-timestamp', Date.now().toString());
                setIsLoading(false);
                return;
              }
            } catch {
              /* ignore */
            }
          }
          const lk = lastKnownPaidRef.current;
          if (lk) {
                        setTier(lk.tier);
            setUnlockedTheme(lk.theme);
            setIsLoading(false);
            return;
          }
          const sponsorEmail = localStorage.getItem('sponsor_email');
          const paid = readCachedPaidTier(isAuthenticated, user?.email, sponsorEmail);
          if (paid) {
                        applyPaidTierFromBrowserCache(paid, setTier, setUnlockedTheme);
          } else {
            // Fall back to raw cached tier/theme even if it's not a paid tier (eg supporter tiers),
            // and if none exist, preserve current in-memory values rather than downgrading.
            if (cachedTier || cachedTheme) {
                            if (cachedTier) setTier(cachedTier);
              if (cachedTheme) setUnlockedTheme(cachedTheme);
            } else {
                          }
          }
          setIsLoading(false);
          return;
        }

        if (userTier) {
          setTier(userTier);
          localStorage.setItem('pocket-portfolio-tier', userTier);
          localStorage.setItem(
            'pocket-portfolio-tier-timestamp',
            Date.now().toString()
          );

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
          if (isPaidTier(userTier) && theme) {
            lastKnownPaidRef.current = { tier: userTier, theme };
          }
        } else {
          lastKnownPaidRef.current = null;
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
        const isAbort =
          (error instanceof DOMException && error.name === 'AbortError') ||
          (error instanceof Error && error.name === 'AbortError');
        if (!isAbort) {
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
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    checkTier();

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, user?.uid, user?.email]);

  const value: PremiumTierContextValue = {
    unlockedTheme,
    tier,
    isLoading,
    hasFounderTheme: tier === 'foundersClub',
    hasCorporateTheme: tier === 'corporateSponsor',
  };

  return (
    <PremiumTierContext.Provider value={value}>
      {children}
    </PremiumTierContext.Provider>
  );
}

export function usePremiumTheme(): PremiumTierContextValue {
  const ctx = useContext(PremiumTierContext);
  if (ctx === undefined) {
    throw new Error('usePremiumTheme must be used within PremiumTierProvider');
  }
  return ctx;
}
