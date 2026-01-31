import type { ComplianceCheck } from '@/app/agent/config';

/**
 * Compliance Guardrails: Ensures AI-generated content meets legal and ethical standards.
 */

const FORBIDDEN_PHRASES = [
  'guaranteed return',
  'guaranteed profit',
  'risk-free',
  'no risk',
  'discount code',
  'limited time offer',
  'act now',
  'financial advice',
  'investment recommendation',
];

const PII_PATTERNS = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email (if not intended)
];

/**
 * Check if content contains PII that shouldn't be in emails
 */
export function checkPII(content: string): { hasPII: boolean; matches: string[] } {
  const matches: string[] = [];
  
  for (const pattern of PII_PATTERNS) {
    const found = content.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }
  
  return {
    hasPII: matches.length > 0,
    matches,
  };
}

/**
 * Check if content violates compliance rules
 */
export function checkCompliance(content: string): ComplianceCheck {
  const violations: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for forbidden phrases
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      violations.push(`Forbidden phrase detected: "${phrase}"`);
    }
  }

  // Check for PII
  const piiCheck = checkPII(content);
  if (piiCheck.hasPII) {
    violations.push(`PII detected: ${piiCheck.matches.join(', ')}`);
  }

  // Check for AI disclosure
  const hasDisclosure = 
    lowerContent.includes('ai') && 
    (lowerContent.includes('pilot') || lowerContent.includes('automated'));
  
  if (!hasDisclosure) {
    violations.push('Missing AI disclosure: Email must state sender is an AI');
  }

  return {
    passed: violations.length === 0,
    violations,
    reasoning: violations.length === 0 
      ? 'Content passed all compliance checks'
      : `Found ${violations.length} compliance violation(s)`,
  };
}

/**
 * Check if lead can be contacted (GDPR/opt-out)
 */
export async function canContactLead(
  leadId: string,
  db: any // Your Drizzle DB type
): Promise<{ canContact: boolean; reason?: string }> {
  const { leads } = await import('@/db/sales/schema');
  const { eq } = await import('drizzle-orm');
  
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    return { canContact: false, reason: 'Lead not found' };
  }

  if (lead.optOut) {
    return { canContact: false, reason: 'Lead has opted out' };
  }

  if (lead.status === 'DO_NOT_CONTACT') {
    return { canContact: false, reason: 'Lead status is DO_NOT_CONTACT' };
  }

  // Check emergency stop
  const { isEmergencyStopActive } = await import('@/lib/sales/emergency-stop');
  if (await isEmergencyStopActive()) {
    return { canContact: false, reason: 'Emergency stop activated' };
  }

  return { canContact: true };
}


