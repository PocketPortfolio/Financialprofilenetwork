/**
 * Viral Loop - Social Sharing Utilities
 * Generates share URLs and handles sharing actions
 */

import type { ShareOptions, ShareMetrics } from './types';
import { trackViralShare } from '../analytics/viral';

/**
 * Generate share URLs for different platforms
 */
export function getShareUrl(platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit', options: ShareOptions): string {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedTitle = encodeURIComponent(options.title);
  const encodedDescription = encodeURIComponent(options.description);
  const hashtags = options.hashtags?.join(',') || '';

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtags}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'reddit':
      return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    
    default:
      return options.url;
  }
}

/**
 * Share to platform (opens share dialog)
 */
export function shareToPlatform(platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit', options: ShareOptions, context?: string): void {
  const shareUrl = getShareUrl(platform, options);
  
  // Track share event
  trackViralShare({
    platform,
    timestamp: new Date(),
    url: options.url,
    context: context || 'unknown'
  });
  
  // Open share window
  window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string, context?: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    
    // Track copy event
    trackViralShare({
      platform: 'copy',
      timestamp: new Date(),
      url: text,
      context: context || 'unknown'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share via email
 */
export function shareViaEmail(options: ShareOptions, context?: string): void {
  const subject = encodeURIComponent(options.title);
  const body = encodeURIComponent(`${options.description}\n\n${options.url}`);
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  
  // Track share event
  trackViralShare({
    platform: 'email',
    timestamp: new Date(),
    url: options.url,
    context: context || 'unknown'
  });
  
  window.location.href = mailtoUrl;
}

/**
 * Generate shareable portfolio link
 */
export function generatePortfolioShareLink(portfolioId: string, options?: {
  includePerformance?: boolean;
  includeHoldings?: boolean;
}): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://www.pocketportfolio.app';
  
  const params = new URLSearchParams();
  params.set('ref', 'share');
  if (options?.includePerformance) params.set('performance', 'true');
  if (options?.includeHoldings) params.set('holdings', 'true');
  
  return `${baseUrl}/portfolio/${portfolioId}?${params.toString()}`;
}

/**
 * Generate shareable ticker page link
 */
export function generateTickerShareLink(symbol: string, performance?: {
  change?: number;
  changePercent?: number;
}): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://www.pocketportfolio.app';
  
  const params = new URLSearchParams();
  params.set('ref', 'share');
  if (performance?.change) params.set('change', performance.change.toString());
  if (performance?.changePercent) params.set('changePercent', performance.changePercent.toString());
  
  return `${baseUrl}/s/${symbol.toLowerCase()}?${params.toString()}`;
}

