/**
 * Email Validation with MX Record Checking
 * 
 * Validates emails before enrichment to prevent "Delivery Delayed" events.
 * Uses DNS MX record lookup to ensure domain has a mail server.
 */

import { promises as dns } from 'dns';
import { isPlaceholderEmail } from './email-resolution';

export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  mxRecords?: string[];
}

/**
 * Validate email with MX record check
 * Returns false if:
 * - Placeholder email detected
 * - Invalid email format
 * - No MX records found (no mail server)
 * 
 * Safety First: If DNS validation fails, err on the side of caution (do not send)
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // 1. Check placeholder
  if (isPlaceholderEmail(email)) {
    return { isValid: false, reason: 'Placeholder email detected' };
  }

  // 2. Basic regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Invalid email format' };
  }

  // 3. Extract domain
  const domain = email.split('@')[1];
  if (!domain) {
    return { isValid: false, reason: 'Invalid domain' };
  }

  // 4. Check MX records (with timeout)
  try {
    // Set timeout for DNS lookup (5 seconds)
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('DNS lookup timeout')), 5000)
      )
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return { 
        isValid: false, 
        reason: 'No MX records found (domain has no mail server)',
        mxRecords: []
      };
    }
    
    return { 
      isValid: true, 
      mxRecords: mxRecords.map(r => r.exchange)
    };
  } catch (error: any) {
    // DNS lookup failed - err on side of caution
    return { 
      isValid: false, 
      reason: `DNS lookup failed: ${error.message}`,
      mxRecords: []
    };
  }
}

/**
 * Batch validate emails (with rate limiting to avoid DNS overload)
 */
export async function validateEmailsBatch(
  emails: string[],
  delayMs: number = 100
): Promise<Map<string, EmailValidationResult>> {
  const results = new Map<string, EmailValidationResult>();
  
  for (const email of emails) {
    const result = await validateEmail(email);
    results.set(email, result);
    
    // Rate limit DNS lookups
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

