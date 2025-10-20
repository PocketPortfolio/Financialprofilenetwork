import { Timestamp } from 'firebase/firestore';

export interface WaitlistInput {
  email: string;
  name?: string;
  region?: string;
  role?: 'investor' | 'engineer' | 'other' | string;
  source: 'web:join' | 'web:footer' | 'web:header';
  userAgent?: string;
}

export interface WaitlistDoc {
  id?: string;
  email_normalized: string;
  email_hash: string;
  display_email?: string;
  name?: string;
  region?: string;
  role?: string;
  status: 'pending' | 'subscribed' | 'unconfirmed' | 'blocked';
  source: string;
  user_agent?: string;
  ip_hash?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  duplicate?: boolean;
  rateLimited?: boolean;
}

export interface WaitlistAnalyticsEvent {
  eventType: 'waitlist_submit_attempt' | 'waitlist_submit_success' | 'waitlist_submit_duplicate' | 'waitlist_rate_limited';
  source: string;
  timestamp: number;
  duplicate?: boolean;
  rateLimited?: boolean;
}

export interface RateLimitDoc {
  id: string;
  identifier: string; // email_hash or ip_hash
  count: number;
  window_start: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AdminWaitlistEntry {
  id: string;
  email_normalized: string;
  name?: string;
  region?: string;
  role?: string;
  status: string;
  source: string;
  created_at: Timestamp;
}

export const WAITLIST_ROLES = ['investor', 'engineer', 'other'] as const;
export const WAITLIST_SOURCES = ['web:join', 'web:footer', 'web:header'] as const;
export const WAITLIST_STATUSES = ['pending', 'subscribed', 'unconfirmed', 'blocked'] as const;

export type WaitlistRole = typeof WAITLIST_ROLES[number];
export type WaitlistSource = typeof WAITLIST_SOURCES[number];
export type WaitlistStatus = typeof WAITLIST_STATUSES[number];
