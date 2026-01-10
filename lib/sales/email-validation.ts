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
 * Invalid domains that should never be accepted (RFC 2606 + common test domains)
 */
const INVALID_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.local',
  'invalid.com',
  'fake.com',
  'dummy.com',
  'sample.com',
];

/**
 * Disposable email providers (catch-all domains that accept any email)
 * These are often used for temporary emails and should be rejected
 */
const DISPOSABLE_EMAIL_PROVIDERS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'getnada.com',
  'mohmal.com',
  'yopmail.com',
  'maildrop.cc',
  'trashmail.com',
  'temp-mail.org',
  'mailnesia.com',
  'mintemail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
];

/**
 * Known catch-all patterns (domains that accept any email address)
 * These are often parking pages or abandoned domains
 */
const CATCH_ALL_PATTERNS = [
  /^mail\d+\./i, // mail1.example.com, mail2.example.com (generic mail servers)
  /^smtp\d+\./i, // smtp1.example.com
  /^mx\d+\./i,   // mx1.example.com
];

/**
 * Validate email with MX record check
 * Returns false if:
 * - Placeholder email detected
 * - Invalid email format
 * - No MX records found (no mail server)
 * - Disposable email provider detected
 * - Catch-all pattern detected
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
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, reason: 'Invalid domain' };
  }

  // 3.5. Block test/invalid domains (before MX check to save DNS queries)
  if (INVALID_DOMAINS.includes(domain)) {
    return { isValid: false, reason: 'Test/invalid domain not allowed' };
  }

  // 3.6. Block disposable email providers
  if (DISPOSABLE_EMAIL_PROVIDERS.includes(domain)) {
    return { isValid: false, reason: 'Disposable email provider not allowed' };
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

    // 4.5. Check for catch-all patterns in MX records
    const mxHosts = mxRecords.map(r => r.exchange.toLowerCase());
    const hasCatchAllPattern = mxHosts.some(host => 
      CATCH_ALL_PATTERNS.some(pattern => pattern.test(host))
    );

    if (hasCatchAllPattern) {
      return {
        isValid: false,
        reason: 'Catch-all mail server pattern detected (likely abandoned domain)',
        mxRecords: mxHosts
      };
    }
    
    return { 
      isValid: true, 
      mxRecords: mxHosts
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

