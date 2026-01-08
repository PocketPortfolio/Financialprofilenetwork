/**
 * Timezone-aware email scheduling
 * Sprint 4: Humanity & Precision Upgrade
 * Golden Window: 09:30 - 11:30 local time for optimal open rates
 */

export interface TimezoneInfo {
  timezone: string; // e.g., "America/Los_Angeles"
  localTime: Date;
  utcTime: Date;
  isOptimalWindow: boolean; // 09:30 - 11:30 local time
}

/**
 * Get optimal send time for a lead's timezone
 * Golden Window: 09:30 - 11:30 local time
 */
export function calculateOptimalSendTime(
  timezone: string,
  baseDate: Date = new Date()
): Date {
  // Get current time in the target timezone
  const zonedTime = getZonedTime(baseDate, timezone);
  
  // Set to 10:00 AM local time (middle of golden window)
  const optimalLocal = new Date(zonedTime);
  optimalLocal.setHours(10, 0, 0, 0);
  
  // If it's already past 11:30, schedule for next day
  const currentHour = zonedTime.getHours();
  const currentMinute = zonedTime.getMinutes();
  
  if (currentHour > 11 || (currentHour === 11 && currentMinute > 30)) {
    optimalLocal.setDate(optimalLocal.getDate() + 1);
  }
  
  // Convert local time to UTC
  return convertLocalToUTC(optimalLocal, timezone);
}

/**
 * Check if current time is in optimal window for a timezone
 */
export function isOptimalSendWindow(timezone: string): boolean {
  const zonedTime = getZonedTime(new Date(), timezone);
  const hour = zonedTime.getHours();
  const minute = zonedTime.getMinutes();
  
  // Check if between 09:30 and 11:30
  if (hour === 9 && minute >= 30) return true;
  if (hour === 10) return true;
  if (hour === 11 && minute <= 30) return true;
  
  return false;
}

/**
 * Resolve location to timezone (simplified - would use geocoding API in production)
 */
export async function resolveLocationToTimezone(
  location?: string
): Promise<string | null> {
  if (!location) return null;
  
  // Simple mapping (in production, use Google Timezone API or similar)
  const locationMap: Record<string, string> = {
    'london': 'Europe/London',
    'san francisco': 'America/Los_Angeles',
    'sf': 'America/Los_Angeles',
    'new york': 'America/New_York',
    'nyc': 'America/New_York',
    'beijing': 'Asia/Shanghai',
    'tokyo': 'Asia/Tokyo',
    'berlin': 'Europe/Berlin',
    'paris': 'Europe/Paris',
    'são paulo': 'America/Sao_Paulo',
    'sao paulo': 'America/Sao_Paulo',
    'sydney': 'Australia/Sydney',
    'toronto': 'America/Toronto',
    'amsterdam': 'Europe/Amsterdam',
    'dublin': 'Europe/Dublin',
    'singapore': 'Asia/Singapore',
    'hong kong': 'Asia/Hong_Kong',
    'mumbai': 'Asia/Kolkata',
    'bangalore': 'Asia/Kolkata',
    'remote': 'UTC', // Default for remote workers
  };
  
  const normalized = location.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [key, tz] of Object.entries(locationMap)) {
    if (normalized === key || normalized.includes(key)) {
      return tz;
    }
  }
  
  // Check for country codes or common patterns
  if (normalized.includes('uk') || normalized.includes('united kingdom')) {
    return 'Europe/London';
  }
  if (normalized.includes('usa') || normalized.includes('united states')) {
    return 'America/New_York'; // Default to EST
  }
  if (normalized.includes('china') || normalized.includes('cn')) {
    return 'Asia/Shanghai';
  }
  if (normalized.includes('germany') || normalized.includes('de')) {
    return 'Europe/Berlin';
  }
  if (normalized.includes('brazil') || normalized.includes('br')) {
    return 'America/Sao_Paulo';
  }
  
  return null; // Would fallback to geocoding API in production
}

/**
 * Get zoned time (simplified - uses Intl.DateTimeFormat)
 * In production, use date-fns-tz or similar library
 */
function getZonedTime(date: Date, timezone: string): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    return date;
  }
}

/**
 * Convert local time to UTC (simplified)
 * In production, use proper timezone conversion library
 */
function convertLocalToUTC(localDate: Date, timezone: string): Date {
  try {
    // Get the offset between UTC and the target timezone
    const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcDate.getTime() - tzDate.getTime();
    
    // Apply offset to get UTC time
    return new Date(localDate.getTime() - offset);
  } catch (error) {
    // Fallback to local date
    return localDate;
  }
}

/**
 * Get timezone info for a location
 */
export async function getTimezoneInfo(location?: string): Promise<TimezoneInfo | null> {
  if (!location) return null;

  const timezone = await resolveLocationToTimezone(location);
  if (!timezone) return null;

  const now = new Date();
  const localTime = getZonedTime(now, timezone);
  const isOptimal = isOptimalSendWindow(timezone);

  return {
    timezone,
    localTime,
    utcTime: now,
    isOptimalWindow: isOptimal,
  };
}

