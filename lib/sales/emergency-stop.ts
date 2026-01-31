/**
 * Emergency Stop Utility
 * 
 * Database-backed emergency stop mechanism that can be toggled via UI button
 * Falls back to environment variable if database check fails
 */

import { db } from '@/db/sales/client';
import { systemSettings } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

const EMERGENCY_STOP_KEY = 'emergency_stop';
const CACHE_TTL = 5000; // 5 seconds cache to reduce database queries

let cachedValue: boolean | null = null;
let cacheTimestamp: number = 0;

/**
 * Check if emergency stop is active
 * Uses database value, falls back to environment variable
 */
export async function isEmergencyStopActive(): Promise<boolean> {
  // Check cache first (5 second TTL)
  const now = Date.now();
  if (cachedValue !== null && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedValue;
  }

  try {
    // Try database first
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, EMERGENCY_STOP_KEY))
      .limit(1);

    if (setting) {
      const value = setting.value as boolean;
      cachedValue = value === true;
      cacheTimestamp = now;
      return cachedValue;
    }

    // If no database setting exists, check environment variable (backward compatibility)
    const envValue = process.env.EMERGENCY_STOP === 'true';
    cachedValue = envValue;
    cacheTimestamp = now;
    return envValue;
  } catch (error) {
    // If database query fails, fall back to environment variable
    console.warn('Failed to check emergency stop from database, using environment variable:', error);
    const envValue = process.env.EMERGENCY_STOP === 'true';
    cachedValue = envValue;
    cacheTimestamp = now;
    return envValue;
  }
}

/**
 * Set emergency stop status
 */
export async function setEmergencyStop(active: boolean, updatedBy?: string): Promise<void> {
  try {
    // Check if setting exists
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, EMERGENCY_STOP_KEY))
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(systemSettings)
        .set({
          value: active,
          updatedAt: new Date(),
          updatedBy: updatedBy || 'system',
        })
        .where(eq(systemSettings.key, EMERGENCY_STOP_KEY));
    } else {
      // Insert new
      await db.insert(systemSettings).values({
        key: EMERGENCY_STOP_KEY,
        value: active,
        description: 'Emergency stop flag - when true, all email sending is paused',
        updatedBy: updatedBy || 'system',
      });
    }

    // Clear cache
    cachedValue = active;
    cacheTimestamp = Date.now();
  } catch (error: any) {
    // Check if error is due to missing table
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    
    if (
      errorMessage.includes('does not exist') || 
      errorMessage.includes('relation') || 
      errorMessage.includes('system_settings') ||
      errorCode === '42P01' ||
      errorCode === '3F000'
    ) {
      console.error('❌ system_settings table does not exist. Please run: npm run db:create-system-settings');
      throw new Error('Database table not found. Please run migration: npm run db:create-system-settings');
    }
    console.error('Failed to set emergency stop in database:', error);
    throw error;
  }
}

/**
 * Clear cache (useful for testing or immediate updates)
 */
export function clearEmergencyStopCache(): void {
  cachedValue = null;
  cacheTimestamp = 0;
}

