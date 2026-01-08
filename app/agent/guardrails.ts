import { checkCompliance, checkPII } from '@/lib/sales/compliance';
import { SYSTEM_IDENTITY } from './config';

/**
 * Guardrails: Safety checks before sending any email
 */

export interface GuardrailCheck {
  passed: boolean;
  violations: string[];
  reasoning: string;
}

/**
 * Run all guardrails before sending an email
 */
export async function runGuardrails(
  emailContent: string,
  leadId: string,
  db: any
): Promise<GuardrailCheck> {
  const violations: string[] = [];

  // 1. Compliance check
  const compliance = checkCompliance(emailContent);
  if (!compliance.passed) {
    violations.push(...compliance.violations);
  }

  // 2. PII check
  const piiCheck = checkPII(emailContent);
  if (piiCheck.hasPII) {
    violations.push(`PII detected: ${piiCheck.matches.join(', ')}`);
  }

  // 3. Check for stop words
  const stopWords = ['guarantee', 'guaranteed', 'risk-free', 'no risk'];
  const lowerContent = emailContent.toLowerCase();
  for (const word of stopWords) {
    if (lowerContent.includes(word)) {
      violations.push(`Stop word detected: "${word}"`);
    }
  }

  // 4. Check for financial advice
  const financialAdvicePatterns = [
    /you should invest/i,
    /buy now/i,
    /guaranteed return/i,
    /risk-free investment/i,
  ];
  
  for (const pattern of financialAdvicePatterns) {
    if (pattern.test(emailContent)) {
      violations.push('Potential financial advice detected');
      break;
    }
  }

  // 5. Verify AI disclosure is present
  const hasDisclosure = 
    lowerContent.includes('ai') && 
    (lowerContent.includes('pilot') || lowerContent.includes('automated'));
  
  if (!hasDisclosure) {
    violations.push('Missing AI disclosure');
  }

  return {
    passed: violations.length === 0,
    violations,
    reasoning: violations.length === 0
      ? 'All guardrails passed'
      : `Found ${violations.length} violation(s): ${violations.join('; ')}`,
  };
}

/**
 * Check tone appropriateness
 */
export function checkTone(content: string): { appropriate: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for aggressive language
  const aggressivePhrases = ['act now', 'limited time', 'don\'t miss out', 'urgent'];
  for (const phrase of aggressivePhrases) {
    if (lowerContent.includes(phrase)) {
      issues.push(`Aggressive language: "${phrase}"`);
    }
  }

  // Check for generic templates
  const genericPhrases = ['dear sir/madam', 'to whom it may concern'];
  for (const phrase of genericPhrases) {
    if (lowerContent.includes(phrase)) {
      issues.push(`Generic template language: "${phrase}"`);
    }
  }

  return {
    appropriate: issues.length === 0,
    issues,
  };
}






