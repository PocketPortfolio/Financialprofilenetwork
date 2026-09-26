'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import {
  trackGoogleSignIn,
  trackMicrosoftSignIn,
  getLandingPage,
  getStoredUTMParameters,
} from '../lib/analytics/events';
import { trackFunnelStage, trackConversion } from '../lib/analytics/conversion';
import { getSEOPageAttribution, trackSEOSignupConversion } from '../lib/analytics/seo';

const POST_AUTH_REDIRECT_KEY = 'pp-post-auth-redirect-done';

function createMicrosoftProvider(): OAuthProvider {
  const provider = new OAuthProvider('microsoft.com');
  // Identity plane only — no Files.* (OneDrive is a separate MSAL consent)
  provider.addScope('openid');
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    tenant: 'common',
    prompt: 'select_account',
  });
  return provider;
}

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function afterAuthRedirectHome() {
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    try {
      sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, '1');
    } catch {
      /* ignore */
    }
    window.location.replace('/dashboard');
    return true;
  }
  return false;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const previousUserRef = useRef<User | null>(null);
  const welcomeEmailTriggeredRef = useRef(false);

  const handleAuthStateChange = useCallback((next: User | null) => {
    if (!previousUserRef.current && next) {
      const attribution = getSEOPageAttribution();
      if (attribution) {
        trackSEOSignupConversion(attribution.path).catch((err) => {
          console.error('Failed to track SEO signup conversion:', err);
        });
      }
      if (!welcomeEmailTriggeredRef.current) {
        welcomeEmailTriggeredRef.current = true;
        if (process.env.NODE_ENV !== 'development') {
          next
            .getIdToken()
            .then((token) => {
              fetch('/api/welcome-email', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              }).catch((err) => console.error('Welcome email trigger failed:', err));
            })
            .catch((err) => console.error('Welcome email: getIdToken failed:', err));
        }
      }
    }

    previousUserRef.current = next;
    setUser(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase auth is not available, running in offline mode');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    getRedirectResult(auth)
      .then((result) => {
        if (!result) return;
        console.log('Redirect authentication successful');
        if (afterAuthRedirectHome()) return;

        const landingPage = getLandingPage();
        const utmParams = getStoredUTMParameters();
        const providerId = result.providerId || '';
        const isMicrosoft = providerId.includes('microsoft');

        if (isMicrosoft) {
          trackMicrosoftSignIn({
            landingPage: landingPage || undefined,
            utmSource: utmParams?.utmSource,
            utmMedium: utmParams?.utmMedium,
            utmCampaign: utmParams?.utmCampaign,
            utmContent: utmParams?.utmContent,
          });
        } else {
          trackGoogleSignIn({
            landingPage: landingPage || undefined,
            utmSource: utmParams?.utmSource,
            utmMedium: utmParams?.utmMedium,
            utmCampaign: utmParams?.utmCampaign,
            utmContent: utmParams?.utmContent,
          });
        }

        trackFunnelStage('signup_complete', 'user_onboarding', {
          method: isMicrosoft ? 'microsoft_redirect' : 'redirect',
          landingPage: landingPage || undefined,
        });
        trackConversion('signup_complete', 1, 'USD', {
          method: isMicrosoft ? 'microsoft_redirect' : 'google_redirect',
          landingPage: landingPage || undefined,
        });

        const attribution = getSEOPageAttribution();
        if (attribution) {
          trackSEOSignupConversion(attribution.path).catch((err) => {
            console.error('Failed to track SEO signup conversion:', err);
          });
        }
      })
      .catch((error) => {
        console.log('No redirect result or error:', error);
      });

    return () => unsubscribe();
  }, [handleAuthStateChange]);

  const trackSuccess = (method: 'google' | 'microsoft', via: 'popup' | 'redirect') => {
    const landingPage = getLandingPage();
    const utmParams = getStoredUTMParameters();
    const payload = {
      landingPage: landingPage || undefined,
      utmSource: utmParams?.utmSource,
      utmMedium: utmParams?.utmMedium,
      utmCampaign: utmParams?.utmCampaign,
      utmContent: utmParams?.utmContent,
    };
    if (method === 'microsoft') trackMicrosoftSignIn(payload);
    else trackGoogleSignIn(payload);

    trackFunnelStage('signup_start', 'user_onboarding', {
      method: `${method}_${via}`,
      landingPage: landingPage || undefined,
    });
    trackConversion('signup_complete', 1, 'USD', {
      method: `${method}_${via}`,
      landingPage: landingPage || undefined,
    });
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn('Firebase auth is not available');
      return null;
    }

    const provider = createGoogleProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      trackSuccess('google', 'popup');
      if (afterAuthRedirectHome()) return null;
      return result.user;
    } catch (error: any) {
      console.log('Popup failed, trying redirect:', error);
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-blocked' ||
        error.message?.includes('Cross-Origin-Opener-Policy') ||
        error.message?.includes('popup-blocked')
      ) {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw error;
    }
  };

  /**
   * Sign in with Microsoft (anyone). Identity scopes only.
   * Popup-first: Firebase redirect often returns no credential in Incognito
   * (pending redirect state is dropped). Runtime logs: beforeRedirect then
   * remount with getRedirectResult hasResult=false / hasUser=false.
   */
  const signInWithMicrosoft = async () => {
    if (!auth) {
      console.warn('Firebase auth is not available');
      return null;
    }

    const provider = createMicrosoftProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      trackSuccess('microsoft', 'popup');
      if (afterAuthRedirectHome()) return null;
      return result.user;
    } catch (error: any) {

      // Do NOT open a second Google popup here — browsers block it (no user gesture).
      // Runtime proof: popupCatch account-exists → header catch auth/popup-blocked.
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error(
          'This email is already signed up with Google. Use Sign in with Google with the same email.'
        );
      }

      if (
        error.code === 'auth/popup-blocked' ||
        error.message?.includes('popup-blocked')
      ) {
        throw new Error(
          'Popups are blocked. Allow popups for localhost:3001 (icon in the address bar), or use a normal browser window (not Incognito).'
        );
      }

      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        return null;
      }

      throw error;
    }
  };

  /** Link Microsoft to the currently signed-in Firebase user (same UID). */
  const linkMicrosoftAccount = async () => {
    if (!auth?.currentUser) {
      throw new Error('Sign in first to link a Microsoft account');
    }
    const provider = createMicrosoftProvider();
    const result = await linkWithPopup(auth.currentUser, provider);
    return result.user;
  };

  const logout = async () => {
    if (!auth) {
      console.warn('Firebase auth is not available');
      return;
    }

    try {
      await signOut(auth);

      if (db) {
        try {
          try {
            await clearIndexedDbPersistence(db);
            console.log('🧹 Local Firestore cache cleared');
          } catch (clearError: any) {
            if (clearError.code !== 'failed-precondition') {
              console.warn('⚠️ Could not clear IndexedDB persistence (will clear on reload):', clearError);
            }
          }
          await terminate(db);
          console.log('🧹 Firestore connections terminated');
        } catch (cacheError) {
          console.error('❌ Failed to clear local Firestore cache:', cacheError);
        }
      }

      try {
        sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
      } catch {
        /* ignore */
      }
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const authProviderIds =
    user?.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithMicrosoft,
    linkMicrosoftAccount,
    logout,
    isAuthenticated: !!user,
    authProviderIds,
  };
}
