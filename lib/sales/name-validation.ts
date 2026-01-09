/**
 * Name Validation Utilities
 * Detects if a "firstName" is actually a real name or just an email prefix
 */

// Common email prefixes that are NOT real first names
const EMAIL_PREFIXES = new Set([
  'info', 'contact', 'hello', 'hi', 'support', 'help', 'sales', 'marketing',
  'admin', 'administrator', 'noreply', 'no-reply', 'donotreply', 'mail',
  'email', 'webmaster', 'postmaster', 'abuse', 'security', 'privacy',
  'legal', 'hr', 'recruiting', 'careers', 'jobs', 'press', 'media',
  'partnerships', 'business', 'team', 'office', 'service', 'services',
  'customerservice', 'customer', 'client', 'user', 'account', 'accounts',
  'billing', 'payments', 'finance', 'accounting', 'tech', 'technical',
  'it', 'dev', 'developer', 'engineering', 'product', 'products',
  'founder', 'founders', 'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cpo',
  'director', 'manager', 'lead', 'head', 'vp', 'vice', 'president',
  'owner', 'co-founder', 'cofounder', 'founder', 'founders'
]);

/**
 * Check if a string is likely a real first name or just an email prefix
 */
export function isRealFirstName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const normalized = name.toLowerCase().trim();
  
  // Empty or too short
  if (normalized.length < 2) {
    return false;
  }
  
  // Check against known email prefixes
  if (EMAIL_PREFIXES.has(normalized)) {
    return false;
  }
  
  // Check if it's all numbers or special characters
  if (/^[0-9\W]+$/.test(normalized)) {
    return false;
  }
  
  // Check if it contains common email patterns
  if (normalized.includes('@') || normalized.includes('.') && normalized.split('.').length > 2) {
    return false;
  }
  
  // Likely a real name if it passes all checks
  return true;
}

/**
 * Extract firstName from email, but only if it looks like a real name
 * Returns null if extraction fails or result doesn't look like a real name
 */
export function extractFirstNameFromEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  try {
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split(/[._-]/);
    
    if (nameParts.length > 0 && nameParts[0].length > 0) {
      const extracted = nameParts[0];
      const capitalized = extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
      
      // Only return if it looks like a real name
      if (isRealFirstName(capitalized)) {
        return capitalized;
      }
    }
  } catch (error) {
    // Silently fail
  }
  
  return null;
}

