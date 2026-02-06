import crypto from 'crypto';

/**
 * Generate a secure API key (pp_ prefix, URL-safe base64).
 * Used by Stripe webhook and Sovereign Seats grant logic.
 */
export function generateApiKey(): string {
  const prefix = 'pp_';
  const randomBytes = crypto.randomBytes(32);
  const base64 = randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${prefix}${base64}`;
}
