/**
 * Auth Guards for client-side route protection
 */
import { User } from 'firebase/auth';

export interface AuthContext {
  user: User | null;
  loading: boolean;
}

/**
 * Check if user is authenticated
 */
export function requireAuth(authContext: AuthContext): boolean {
  if (authContext.loading) return false;
  return authContext.user !== null;
}

/**
 * Check if user has admin role (via custom claims)
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult();
    return token.claims['admin'] === true;
  } catch {
    return false;
  }
}

/**
 * Ensure user token is fresh (refresh if > 55 mins old)
 */
export async function ensureFreshToken(user: User | null): Promise<string | null> {
  if (!user) return null;
  try {
    const token = await user.getIdTokenResult();
    const issuedAt = new Date(token.issuedAtTime).getTime();
    const now = Date.now();
    const ageMs = now - issuedAt;
    
    // Refresh if token is older than 55 minutes (Firebase tokens expire at 60 mins)
    if (ageMs > 55 * 60 * 1000) {
      return await user.getIdToken(true); // Force refresh
    }
    
    return token.token;
  } catch (err) {
    console.error('Failed to get fresh token', err);
    return null;
  }
}

/**
 * Rate limiter for client-side actions (simple in-memory, per session)
 */
class ClientRateLimiter {
  private counts = new Map<string, { count: number; resetAt: number }>();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = this.counts.get(key);

    if (!bucket || now > bucket.resetAt) {
      this.counts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= maxRequests) {
      return false;
    }

    bucket.count++;
    return true;
  }

  reset(key: string): void {
    this.counts.delete(key);
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate symbol input (ticker symbols)
 */
export function validateSymbol(symbol: string): boolean {
  // Allow alphanumeric, dots, hyphens, max 10 chars
  return /^[A-Z0-9.\-]{1,10}$/i.test(symbol);
}

/**
 * Validate and parse numeric input
 */
export function parseNumericInput(input: string, options?: {
  min?: number;
  max?: number;
  decimals?: number;
}): number | null {
  const num = parseFloat(input);
  if (!Number.isFinite(num)) return null;
  
  if (options?.min !== undefined && num < options.min) return null;
  if (options?.max !== undefined && num > options.max) return null;
  
  if (options?.decimals !== undefined) {
    return parseFloat(num.toFixed(options.decimals));
  }
  
  return num;
}

