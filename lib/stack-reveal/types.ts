/**
 * Stack Reveal: user and email types
 */

export type StackRevealWeek = 1 | 2 | 3 | 4;

export interface StackRevealRecipient {
  uid: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  authProvider: string;
  createdAt: string;
  /** 0 = not started, 1-4 = next week to send */
  stackRevealWeek: number;
  /** Has uploaded at least one CSV (for Week 1 dynamic CTA) */
  hasUploadedCsv?: boolean;
}

export interface WeekContent {
  subject: string;
  /** Builds HTML with greeting, body, CTA, unsubscribe */
  buildHtml: (opts: {
    greeting: string;
    ctaUrl: string;
    ctaText: string;
    hasUploadedCsv?: boolean;
    isGoogleUser?: boolean;
  }) => string;
}
