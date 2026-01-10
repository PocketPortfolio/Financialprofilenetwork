/**
 * Dynamic Throttling Governor
 * 
 * Monitors email delivery status and automatically pauses outreach
 * when throttling is detected (delivery_delayed > 5% in last hour)
 */

import { db } from '@/db/sales/client';
import { auditLogs } from '@/db/sales/schema';
import { sql } from 'drizzle-orm';

interface ThrottleStatus {
  isThrottled: boolean;
  delayMinutes: number;
  reason: string;
  recentStats: {
    total: number;
    delayed: number;
    bounced: number;
    delivered: number;
    delayedRate: number;
  };
}

/**
 * Check if system is being throttled based on recent delivery statuses
 * 
 * Logic:
 * - If delivery_delayed > 5% in last hour -> PAUSE for 60 mins
 * - If delivery_delayed > 10% in last hour -> PAUSE for 120 mins
 * - If delivery_delayed > 20% in last hour -> PAUSE for 240 mins (4 hours)
 */
export async function checkThrottleStatus(): Promise<ThrottleStatus> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Query recent email statuses from audit logs
  // Note: This assumes we're tracking delivery status in audit logs metadata
  const recentLogs = await db
    .select({
      action: auditLogs.action,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(
      sql`${auditLogs.createdAt} >= ${oneHourAgo.toISOString()} AND ${auditLogs.action} IN ('EMAIL_SENT', 'EMAIL_SCHEDULED')`
    );

  // Parse delivery statuses from metadata
  // Assuming metadata contains: { emailId, deliveryStatus: 'delivered' | 'bounced' | 'delivery_delayed' }
  const stats = {
    total: recentLogs.length,
    delayed: 0,
    bounced: 0,
    delivered: 0,
  };

  for (const log of recentLogs) {
    const metadata = log.metadata as any;
    const status = metadata?.deliveryStatus || 'unknown';
    
    if (status === 'delivery_delayed') stats.delayed++;
    else if (status === 'bounced') stats.bounced++;
    else if (status === 'delivered') stats.delivered++;
  }

  const delayedRate = stats.total > 0 ? (stats.delayed / stats.total) * 100 : 0;

  // Determine throttle status
  let isThrottled = false;
  let delayMinutes = 0;
  let reason = '';

  if (delayedRate > 20) {
    isThrottled = true;
    delayMinutes = 240; // 4 hours
    reason = `Critical throttling detected: ${delayedRate.toFixed(1)}% delivery_delayed rate (threshold: 20%)`;
  } else if (delayedRate > 10) {
    isThrottled = true;
    delayMinutes = 120; // 2 hours
    reason = `High throttling detected: ${delayedRate.toFixed(1)}% delivery_delayed rate (threshold: 10%)`;
  } else if (delayedRate > 5) {
    isThrottled = true;
    delayMinutes = 60; // 1 hour
    reason = `Throttling detected: ${delayedRate.toFixed(1)}% delivery_delayed rate (threshold: 5%)`;
  }

  return {
    isThrottled,
    delayMinutes,
    reason,
    recentStats: {
      ...stats,
      delayedRate,
    },
  };
}

/**
 * Pause outreach for specified minutes
 * Logs the pause action and returns the resume time
 */
export async function pauseOutreach(minutes: number, reason: string): Promise<Date> {
  const resumeAt = new Date(Date.now() + minutes * 60 * 1000);
  
  console.log(`⚠️  Throttling detected. Cooling down engine for ${minutes} minutes.`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Resume at: ${resumeAt.toISOString()}`);

  // Log the pause action
  await db.insert(auditLogs).values({
    action: 'STATUS_CHANGED',
    aiReasoning: `Throttle Governor: Pausing outreach for ${minutes} minutes`,
    metadata: {
      pauseReason: reason,
      pauseDurationMinutes: minutes,
      pausedAt: new Date().toISOString(),
      resumeAt: resumeAt.toISOString(),
    },
  });

  return resumeAt;
}

