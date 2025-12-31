/**
 * Viral Loop - Referral System
 * Generates referral codes and tracks referrals
 */

import { ReferralData } from './types';
import { trackViralReferral } from '../analytics/viral';

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId?: string): string {
  // If user ID provided, use it as base
  if (userId) {
    const hash = userId.slice(0, 8).toUpperCase();
    return `REF-${hash}`;
  }
  
  // Generate random code
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `REF-${random}`;
}

/**
 * Get referral link for a user
 */
export function getReferralLink(referralCode: string, source?: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://www.pocketportfolio.app';
  
  const params = new URLSearchParams();
  params.set('ref', referralCode);
  if (source) params.set('source', source);
  
  return `${baseUrl}/?${params.toString()}`;
}

/**
 * Track referral click
 */
export function trackReferralClick(referralCode: string, source?: string): void {
  // Store referral code in session storage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('referral_code', referralCode);
    if (source) {
      sessionStorage.setItem('referral_source', source);
    }
  }
  
  // Track in analytics
  trackViralReferral({
    action: 'click',
    referralCode,
    source: source || 'unknown'
  });
}

/**
 * Get stored referral code
 */
export function getStoredReferralCode(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('referral_code');
  }
  return null;
}

/**
 * Track referral conversion (signup)
 */
export function trackReferralConversion(referralCode: string | null): void {
  if (!referralCode) {
    referralCode = getStoredReferralCode();
  }
  
  if (referralCode) {
    trackViralReferral({
      action: 'conversion',
      referralCode,
      source: 'signup'
    });
  }
}

/**
 * Parse referral code from URL
 */
export function parseReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  
  if (ref && ref.startsWith('REF-')) {
    trackReferralClick(ref, params.get('source') || undefined);
    return ref;
  }
  
  return null;
}


















