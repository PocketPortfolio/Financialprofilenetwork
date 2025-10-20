'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { trackGoogleSignIn, getLandingPage, getStoredUTMParameters } from '../lib/analytics/events';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use stable callback to prevent infinite loops
  const handleAuthStateChange = useCallback((user: User | null) => {
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
      await signOut(auth);
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