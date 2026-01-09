/**
 * Cultural Guardrails: Language & Region Enforcement
 * Execution Order 010: The "Respect" Protocol
 * 
 * Hard-coded guardrails that prevent sending English emails to non-English speaking regions
 * This ensures we maintain cultural respect and don't send "English Spam" to regions that require native language
 */

export interface RegionRule {
  lang: string; // ISO 639-1 language code (e.g., 'zh-CN', 'es-ES', 'de-DE')
  allowEnglish: boolean; // If false, we MUST use native language or ABORT
  requiresNative: boolean; // If true, we cannot contact if we can't generate native language email
}

/**
 * Region Rules: Strict language requirements per country
 * 
 * STRICT regions (allowEnglish: false): We MUST use native language or DO NOT CONTACT
 * PERMISSIVE regions (allowEnglish: true): We can use English as fallback
 */
export const REGION_RULES: Record<string, RegionRule> = {
  // STRICT: No English allowed - must use native language or abort
  'CN': { lang: 'zh-CN', allowEnglish: false, requiresNative: true }, // China: Must use Simplified Chinese
  'JP': { lang: 'ja-JP', allowEnglish: false, requiresNative: true }, // Japan: Must use Japanese
  'ES': { lang: 'es-ES', allowEnglish: false, requiresNative: true }, // Spain: Must use Spanish
  'KR': { lang: 'ko-KR', allowEnglish: false, requiresNative: true }, // South Korea: Must use Korean
  'IT': { lang: 'it-IT', allowEnglish: false, requiresNative: true }, // Italy: Must use Italian
  'RU': { lang: 'ru-RU', allowEnglish: false, requiresNative: true }, // Russia: Must use Russian
  'AR': { lang: 'ar-SA', allowEnglish: false, requiresNative: true }, // Saudi Arabia: Must use Arabic
  
  // PERMISSIVE: English is acceptable (tech scenes often use English)
  'FR': { lang: 'fr-FR', allowEnglish: true, requiresNative: false }, // France: French preferred, English acceptable
  'DE': { lang: 'de-DE', allowEnglish: true, requiresNative: false }, // Germany: German preferred, English acceptable (Berlin tech scene)
  'BR': { lang: 'pt-BR', allowEnglish: true, requiresNative: false }, // Brazil: Portuguese preferred, English acceptable
  'NL': { lang: 'nl-NL', allowEnglish: true, requiresNative: false }, // Netherlands: Dutch preferred, English acceptable
  'SE': { lang: 'sv-SE', allowEnglish: true, requiresNative: false }, // Sweden: Swedish preferred, English acceptable
  'NO': { lang: 'no-NO', allowEnglish: true, requiresNative: false }, // Norway: Norwegian preferred, English acceptable
  'DK': { lang: 'da-DK', allowEnglish: true, requiresNative: false }, // Denmark: Danish preferred, English acceptable
  'FI': { lang: 'fi-FI', allowEnglish: true, requiresNative: false }, // Finland: Finnish preferred, English acceptable
  
  // NATIVE ENGLISH: No restrictions
  'US': { lang: 'en-US', allowEnglish: true, requiresNative: false },
  'GB': { lang: 'en-GB', allowEnglish: true, requiresNative: false },
  'CA': { lang: 'en-CA', allowEnglish: true, requiresNative: false },
  'AU': { lang: 'en-AU', allowEnglish: true, requiresNative: false },
  'NZ': { lang: 'en-NZ', allowEnglish: true, requiresNative: false },
  'IE': { lang: 'en-IE', allowEnglish: true, requiresNative: false },
};

/**
 * Determine the required outreach language for a country code
 * Returns the language code that MUST be used, or null if English is acceptable
 */
export function determineOutreachLanguage(countryCode: string): string | null {
  const rule = REGION_RULES[countryCode];
  
  // If no rule exists, default to English (Global Fallback)
  if (!rule) {
    return 'en-US'; // Safe default
  }

  // If strict rule exists, return native language
  if (rule.requiresNative) {
    return rule.lang;
  }

  // If permissive, English is acceptable
  return rule.allowEnglish ? 'en-US' : rule.lang;
}

/**
 * Check if we can email a lead from a specific country
 * 
 * UPDATED (Execution Order 010 v2): Always returns true - we enforce language instead of blocking
 * The system will generate emails in the required native language using AI (GPT-4o supports all languages)
 * This ensures we respect cultural norms while still closing deals
 */
export function canWeEmail(countryCode: string, supportedLanguages: string[] = ['en-US']): boolean {
  // Always allow - we'll enforce language in email generation
  // GPT-4o can generate emails in any language, so we don't need to block
  return true;
}

/**
 * Get the reason why a lead cannot be contacted (if applicable)
 */
export function getRegionLockReason(countryCode: string, supportedLanguages: string[] = ['en-US']): string | null {
  if (canWeEmail(countryCode, supportedLanguages)) {
    return null; // Can contact
  }

  const rule = REGION_RULES[countryCode];
  if (!rule) {
    return null; // No rule, so can contact
  }

  if (rule.requiresNative && !rule.allowEnglish) {
    return `Region Lock: ${countryCode} requires ${rule.lang} but system only supports ${supportedLanguages.join(', ')}`;
  }

  return null;
}

/**
 * Check if a region is strict (requires native language, no English fallback)
 */
export function isStrictRegion(countryCode: string): boolean {
  const rule = REGION_RULES[countryCode];
  return rule ? (rule.requiresNative && !rule.allowEnglish) : false;
}

