/**
 * Viral Loop Types
 * Type definitions for viral loop mechanics
 */

export interface ShareOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface ReferralData {
  referralCode: string;
  userId?: string;
  createdAt: Date;
  clickCount: number;
  signupCount: number;
  conversionRate: number;
}

export interface ShareMetrics {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'copy' | 'email';
  timestamp: Date;
  url: string;
  context?: string; // e.g., 'portfolio', 'ticker_page', 'landing'
}

export interface SocialProofData {
  totalUsers: number;
  totalPortfolios: number;
  recentActivity: Array<{
    action: string;
    timestamp: Date;
    user?: string;
  }>;
}


















