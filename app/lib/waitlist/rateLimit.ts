import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { RateLimitDoc } from './types';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_ATTEMPTS = 5; // 5 attempts per hour

/**
 * Checks if a user has exceeded the rate limit for waitlist submissions
 */
export async function checkRateLimit(
  emailHash: string, 
  ipHash?: string
): Promise<{ allowed: boolean; remainingAttempts: number; resetTime: Date }> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
    
    // Check rate limits for both email and IP
    const [emailLimit, ipLimit] = await Promise.all([
      checkIdentifierRateLimit(emailHash, windowStart),
      ipHash ? checkIdentifierRateLimit(ipHash, windowStart) : { count: 0, resetTime: now }
    ]);
    
    const totalCount = emailLimit.count + ipLimit.count;
    const allowed = totalCount < RATE_LIMIT_MAX_ATTEMPTS;
    const remainingAttempts = Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - totalCount);
    const resetTime = emailLimit.resetTime > ipLimit.resetTime ? emailLimit.resetTime : ipLimit.resetTime;
    
    return { allowed, remainingAttempts, resetTime };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the request if rate limiting fails
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS, resetTime: new Date() };
  }
}

/**
 * Records a rate limit attempt for tracking
 */
export async function recordRateLimitAttempt(
  emailHash: string, 
  ipHash?: string
): Promise<void> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
    
    // Record attempts for both identifiers
    await Promise.all([
      recordIdentifierAttempt(emailHash, windowStart),
      ipHash ? recordIdentifierAttempt(ipHash, windowStart) : Promise.resolve()
    ]);
  } catch (error) {
    console.error('Failed to record rate limit attempt:', error);
    // Don't throw - this is not critical for the main flow
  }
}

/**
 * Checks rate limit for a specific identifier (email or IP hash)
 */
async function checkIdentifierRateLimit(
  identifier: string, 
  windowStart: Date
): Promise<{ count: number; resetTime: Date }> {
  const rateLimitRef = collection(db, 'waitlist_rate_limit');
  const q = query(
    rateLimitRef,
    where('identifier', '==', identifier),
    where('window_start', '>=', Timestamp.fromDate(windowStart)),
    orderBy('window_start', 'desc')
  );
  
  const snapshot = await getDocs(q);
  let totalCount = 0;
  let earliestReset = new Date(Date.now() + RATE_LIMIT_WINDOW_MS);
  
  snapshot.forEach(doc => {
    const data = doc.data() as RateLimitDoc;
    totalCount += data.count;
    
    // Find the earliest window that will reset
    const windowEnd = new Date(data.window_start.toDate().getTime() + RATE_LIMIT_WINDOW_MS);
    if (windowEnd < earliestReset) {
      earliestReset = windowEnd;
    }
  });
  
  return { count: totalCount, resetTime: earliestReset };
}

/**
 * Records a rate limit attempt for a specific identifier
 */
async function recordIdentifierAttempt(
  identifier: string, 
  windowStart: Date
): Promise<void> {
  const rateLimitRef = collection(db, 'waitlist_rate_limit');
  const windowStartTimestamp = Timestamp.fromDate(windowStart);
  
  // Try to find existing rate limit doc for this window
  const q = query(
    rateLimitRef,
    where('identifier', '==', identifier),
    where('window_start', '==', windowStartTimestamp),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Create new rate limit doc
    await addDoc(rateLimitRef, {
      identifier,
      count: 1,
      window_start: windowStartTimestamp,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
  } else {
    // Update existing doc
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
      count: (snapshot.docs[0].data().count || 0) + 1,
      updated_at: serverTimestamp()
    });
  }
}

/**
 * Cleans up old rate limit records (should be called periodically)
 */
export async function cleanupOldRateLimits(): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - (RATE_LIMIT_WINDOW_MS * 2)); // Keep 2 windows
    const rateLimitRef = collection(db, 'waitlist_rate_limit');
    
    // Note: Firestore doesn't support delete queries directly
    // This would need to be implemented as a Cloud Function or scheduled job
    console.log('Rate limit cleanup would remove records older than:', cutoffTime);
  } catch (error) {
    console.error('Failed to cleanup old rate limits:', error);
  }
}
