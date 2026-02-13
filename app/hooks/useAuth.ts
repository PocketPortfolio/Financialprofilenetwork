'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { trackGoogleSignIn, getLandingPage, getStoredUTMParameters } from '../lib/analytics/events';
import { trackFunnelStage, trackConversion } from '../lib/analytics/conversion';
import { getSEOPageAttribution, trackSEOSignupConversion } from '../lib/analytics/seo';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Track previous auth state to detect signups
  const previousUserRef = useRef<User | null>(null);
  
  // Use stable callback to prevent infinite loops
  const handleAuthStateChange = useCallback((user: User | null) => {
    // Detect new signup: user was null, now has a user
    if (!previousUserRef.current && user) {
      // User just signed up - check for SEO page attribution
      const attribution = getSEOPageAttribution();
      if (attribution) {
        // Track conversion from SEO page
        trackSEOSignupConversion(attribution.path).catch(err => {
          console.error('Failed to track SEO signup conversion:', err);
        });
      }
      // Trigger Welcome Email (Week 0) — idempotent; API sends at most once per UID
      user.getIdToken().then((token) => {
        fetch('/api/welcome-email', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => console.error('Welcome email trigger failed:', err));
      }).catch((err) => console.error('Welcome email: getIdToken failed:', err));
    }
    
    previousUserRef.current = user;
    setUser(user);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check if auth is available before using it
    if (!auth) {
      console.warn('Firebase auth is not available, running in offline mode');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    
    // Check for redirect result on mount
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Redirect authentication successful');
        
        // Track successful Google Sign-In after redirect
        const landingPage = getLandingPage();
        const utmParams = getStoredUTMParameters();
        
        trackGoogleSignIn({
          landingPage: landingPage || undefined,
          utmSource: utmParams?.utmSource,
          utmMedium: utmParams?.utmMedium,
          utmCampaign: utmParams?.utmCampaign,
          utmContent: utmParams?.utmContent,
        });
        
        // Track funnel progression
        trackFunnelStage('signup_complete', 'user_onboarding', {
          method: 'redirect',
          landingPage: landingPage || undefined
        });
        
        // Track conversion
        trackConversion('signup_complete', 1, 'USD', {
          method: 'google_redirect',
          landingPage: landingPage || undefined
        });
        
        // Track SEO page conversion if applicable
        const attribution = getSEOPageAttribution();
        if (attribution) {
          trackSEOSignupConversion(attribution.path).catch(err => {
            console.error('Failed to track SEO signup conversion:', err);
          });
        }
      }
    }).catch((error) => {
      console.log('No redirect result or error:', error);
    });

    return () => unsubscribe();
  }, [handleAuthStateChange]);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.warn('Firebase auth is not available');
      return null;
    }

    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      // Try popup first
      const result = await signInWithPopup(auth, provider);
      
      // Track funnel stage: signup start
      trackFunnelStage('signup_start', 'user_onboarding', {
        method: 'popup',
        landingPage: getLandingPage() || undefined
      });
      
      // Track successful Google Sign-In with attribution
      const landingPage = getLandingPage();
      const utmParams = getStoredUTMParameters();
      
      trackGoogleSignIn({
        landingPage: landingPage || undefined,
        utmSource: utmParams?.utmSource,
        utmMedium: utmParams?.utmMedium,
        utmCampaign: utmParams?.utmCampaign,
        utmContent: utmParams?.utmContent,
      });
      
      return result.user;
    } catch (error: any) {
      console.log('Popup failed, trying redirect:', error);
      
      // Check if it's a popup-related error
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        try {
          // Fallback to redirect if popup fails
          await signInWithRedirect(auth, provider);
          // Note: User will be redirected, so we don't return here
          return null;
        } catch (redirectError) {
          console.error('Error with redirect authentication:', redirectError);
          throw redirectError;
        }
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  };

  const logout = async () => {
    if (!auth) {
      console.warn('Firebase auth is not available');
      return;
    }
    
    try {
      // 1. Sign out from Auth
      await signOut(auth);
      
      // 2. CRITICAL: Nuke the Local Cache to prevent "Ghost Trades"
      if (db) {
        try {
          // Try to clear IndexedDB persistence first (requires no active connections)
          // If this fails, terminate() and reload will still clear everything
          try {
            await clearIndexedDbPersistence(db);
            console.log('🧹 Local Firestore cache cleared');
            
          } catch (clearError: any) {
            // clearIndexedDbPersistence may fail if there are active connections
            // This is expected, we'll terminate and reload which will clear everything
            if (clearError.code !== 'failed-precondition') {
              console.warn('⚠️ Could not clear IndexedDB persistence (will clear on reload):', clearError);
            }
            
          }
          
          // Terminate all Firestore connections (closes all active connections)
          await terminate(db);
          console.log('🧹 Firestore connections terminated');
          
          
        } catch (cacheError) {
          console.error('❌ Failed to clear local Firestore cache:', cacheError);
          
          // Don't throw - cache clearing is best effort, auth signout succeeded
          // Reload will clear everything anyway
        }
      }
      
      // 3. Force Reload to reset SDK state and clear any remaining cache
      // This ensures a clean state for the next user session
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };
}