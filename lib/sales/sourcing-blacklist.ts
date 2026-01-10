/**
 * Domain Blacklist System
 * 
 * Tracks domains that have returned >3 delivery_delayed events
 * These domains are blacklisted from future sourcing
 */

import { db } from '@/db/sales/client';
import { auditLogs } from '@/db/sales/schema';
import { sql } from 'drizzle-orm';

const BLACKLIST_THRESHOLD = 3; // Blacklist after 3 delivery_delayed events

/**
 * Check if a domain is blacklisted
 */
export async function isDomainBlacklisted(domain: string): Promise<boolean> {
  // Query audit logs for delivery_delayed events for this domain
  const delayedCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(auditLogs)
    .where(
      sql`${auditLogs.metadata}->>'deliveryStatus' = 'delivery_delayed' AND ${auditLogs.metadata}->>'to' LIKE ${`%@${domain}`}`
    );

  return (delayedCount[0]?.count || 0) >= BLACKLIST_THRESHOLD;
}

/**
 * Get all blacklisted domains
 */
export async function getBlacklistedDomains(): Promise<string[]> {
  // This would require a more complex query or a separate blacklist table
  // For now, return empty array - can be enhanced later
  return [];
}

