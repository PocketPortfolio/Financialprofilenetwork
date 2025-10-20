import { createHash } from 'crypto';

/**
 * Normalizes an email address for consistent storage and lookup
 * - Converts to lowercase
 * - Trims whitespace
 * - Validates basic format
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  
  const normalized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new Error('Invalid email format');
  }
  
  if (normalized.length < 3 || normalized.length > 254) {
    throw new Error('Email must be between 3 and 254 characters');
  }
  
  return normalized;
}

/**
 * Creates a SHA-256 hash of the normalized email for privacy-preserving lookups
 */
export function hashEmail(normalizedEmail: string): string {
  if (!normalizedEmail || typeof normalizedEmail !== 'string') {
    throw new Error('Normalized email is required for hashing');
  }
  
  return createHash('sha256').update(normalizedEmail).digest('hex');
}

/**
 * Creates a privacy-preserving hash of an IP address for rate limiting
 * Uses HMAC with a secret key to prevent rainbow table attacks
 */
export function hashIP(ip: string, secret: string): string {
  if (!ip || typeof ip !== 'string') {
    throw new Error('IP address is required for hashing');
  }
  
  if (!secret || typeof secret !== 'string') {
    throw new Error('Encryption secret is required for IP hashing');
  }
  
  return createHash('sha256')
    .update(secret)
    .update(ip)
    .digest('hex')
    .substring(0, 16); // Truncate to 16 chars for efficiency
}

/**
 * Validates and normalizes waitlist input data
 */
export function validateWaitlistInput(input: any): {
  email_normalized: string;
  email_hash: string;
  name?: string;
  region?: string;
  role?: string;
  source: string;
  user_agent?: string;
} {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }
  
  // Validate required fields
  if (!input.email || typeof input.email !== 'string') {
    throw new Error('Email is required');
  }
  
  if (!input.source || typeof input.source !== 'string') {
    throw new Error('Source is required');
  }
  
  // Normalize email
  const email_normalized = normalizeEmail(input.email);
  const email_hash = hashEmail(email_normalized);
  
  // Validate optional fields
  const result: any = {
    email_normalized,
    email_hash,
    source: input.source,
  };
  
  if (input.name && typeof input.name === 'string') {
    result.name = input.name.trim().substring(0, 100); // Limit length
  }
  
  if (input.region && typeof input.region === 'string') {
    result.region = input.region.trim().substring(0, 50);
  }
  
  if (input.role && typeof input.role === 'string') {
    result.role = input.role.trim().substring(0, 50);
  }
  
  if (input.userAgent && typeof input.userAgent === 'string') {
    result.user_agent = input.userAgent.substring(0, 500); // Limit length
  }
  
  return result;
}
