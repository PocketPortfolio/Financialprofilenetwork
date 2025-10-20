// import { analytics } from '../firebase';
import type { WaitlistAnalyticsEvent } from './types';

/**
 * Emits waitlist analytics events to Firebase Analytics
 * Privacy-preserving: no PII in event payloads
 */
export function emitWaitlistEvent(event: WaitlistAnalyticsEvent): void {
  try {
    if (typeof window === 'undefined') {
      // Server-side - analytics not available
      return;
    }
    
    // Import Firebase Analytics dynamically to avoid SSR issues
    import('firebase/analytics').then(({ logEvent }) => {
      const { eventType, ...eventData } = event;
      
      // Map our event types to Firebase Analytics event names
      const analyticsEventName = eventType.replace('waitlist_', 'waitlist_');
      
      // Skip analytics for now to prevent 500 errors
      console.log('Analytics event (disabled):', analyticsEventName, eventData);
    }).catch((error) => {
      console.warn('Failed to emit analytics event:', error);
    });
  } catch (error) {
    console.warn('Analytics event emission failed:', error);
  }
}

/**
 * Emits a waitlist submission attempt event
 */
export function emitWaitlistSubmitAttempt(source: string): void {
  emitWaitlistEvent({
    eventType: 'waitlist_submit_attempt',
    source,
    timestamp: Date.now()
  });
}

/**
 * Emits a successful waitlist submission event
 */
export function emitWaitlistSubmitSuccess(source: string, duplicate: boolean = false): void {
  emitWaitlistEvent({
    eventType: 'waitlist_submit_success',
    source,
    timestamp: Date.now(),
    duplicate
  });
}

/**
 * Emits a duplicate submission event
 */
export function emitWaitlistSubmitDuplicate(source: string): void {
  emitWaitlistEvent({
    eventType: 'waitlist_submit_duplicate',
    source,
    timestamp: Date.now(),
    duplicate: true
  });
}

/**
 * Emits a rate limited submission event
 */
export function emitWaitlistRateLimited(source: string): void {
  emitWaitlistEvent({
    eventType: 'waitlist_rate_limited',
    source,
    timestamp: Date.now(),
    rateLimited: true
  });
}

/**
 * Client-side event emitter for waitlist interactions
 * Can be used in React components for user interaction tracking
 */
export class WaitlistAnalytics {
  private static instance: WaitlistAnalytics;
  
  static getInstance(): WaitlistAnalytics {
    if (!WaitlistAnalytics.instance) {
      WaitlistAnalytics.instance = new WaitlistAnalytics();
    }
    return WaitlistAnalytics.instance;
  }
  
  trackFormView(source: string): void {
    if (typeof window === 'undefined') return;
    
    // Track form view (could be expanded to include more detailed analytics)
    console.log('Waitlist form viewed from:', source);
  }
  
  trackFormSubmit(source: string): void {
    emitWaitlistSubmitAttempt(source);
  }
  
  trackFormSuccess(source: string, duplicate: boolean = false): void {
    emitWaitlistSubmitSuccess(source, duplicate);
  }
  
  trackFormError(source: string, errorType: 'duplicate' | 'rate_limited' | 'validation'): void {
    if (errorType === 'duplicate') {
      emitWaitlistSubmitDuplicate(source);
    } else if (errorType === 'rate_limited') {
      emitWaitlistRateLimited(source);
    }
    
    // Log other error types for debugging
    console.warn('Waitlist form error:', errorType, 'from:', source);
  }
}
