/**
 * SEO Page View Tracking
 * Tracks page views for SEO pages (tools, for, s routes)
 * Uses session-based attribution to track actual signups
 */

/**
 * Get or create a session ID for tracking
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('pp_session_id');
  if (!sessionId) {
    sessionId = `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pp_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Store the SEO page path in session for attribution
 */
function storeSEOPageAttribution(path: string): void {
  if (typeof window === 'undefined') return;
  
  // Store the SEO page path that led to potential signup
  sessionStorage.setItem('pp_seo_referrer', path);
  sessionStorage.setItem('pp_seo_referrer_timestamp', Date.now().toString());
}

/**
 * Get the stored SEO page attribution
 */
export function getSEOPageAttribution(): { path: string; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  
  const path = sessionStorage.getItem('pp_seo_referrer');
  const timestamp = sessionStorage.getItem('pp_seo_referrer_timestamp');
  
  if (!path || !timestamp) return null;
  
  // Only use attribution if it's within the last 30 minutes (session window)
  const age = Date.now() - parseInt(timestamp, 10);
  if (age > 30 * 60 * 1000) {
    // Attribution expired, clear it
    sessionStorage.removeItem('pp_seo_referrer');
    sessionStorage.removeItem('pp_seo_referrer_timestamp');
    return null;
  }
  
  return { path, timestamp: parseInt(timestamp, 10) };
}

/**
 * Clear SEO page attribution (after signup is tracked)
 */
export function clearSEOPageAttribution(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('pp_seo_referrer');
  sessionStorage.removeItem('pp_seo_referrer_timestamp');
}

/**
 * Track SEO page view
 * Stores attribution for potential signup tracking
 */
export async function trackSEOPageView(path: string, converted: boolean = false): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    
    // Store attribution for potential signup
    if (!converted) {
      storeSEOPageAttribution(path);
    }
    
    await fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        converted: false, // Never mark as converted on page view - only on actual signup
        sessionId
      })
    });
  } catch (error) {
    console.error('Failed to track SEO page view:', error);
    // Fail silently - don't block user experience
  }
}

/**
 * Track signup conversion from SEO page
 * Should be called when user signs up and has SEO page attribution
 */
export async function trackSEOSignupConversion(seoPagePath: string): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    
    // Mark the original page view as converted
    await fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: seoPagePath,
        converted: true,
        sessionId,
        conversionType: 'signup'
      })
    });
    
    // Clear attribution after tracking
    clearSEOPageAttribution();
  } catch (error) {
    console.error('Failed to track SEO signup conversion:', error);
    // Fail silently - don't block user experience
  }
}

