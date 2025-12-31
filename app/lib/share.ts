/**
 * Zero-Knowledge Portfolio Sharing
 * Encodes portfolio data as URL-safe blob (no database needed)
 * 
 * Privacy-first: Strips all dollar amounts, converts to percentages only
 */

interface SanitizedPosition {
  ticker: string;
  percentage: number; // 0-100, no dollar amounts
}

export interface PortfolioShareData {
  positions: SanitizedPosition[];
  timestamp: number;
}

/**
 * Sanitize portfolio: Strip all dollar amounts, convert to percentages
 */
export function sanitizePortfolio(positions: Array<{
  ticker: string;
  currentValue: number;
  totalValue?: number;
}>): SanitizedPosition[] {
  // Calculate total
  const total = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
  
  if (total === 0) {
    return [];
  }
  
  // Convert to percentages only
  return positions
    .filter(pos => pos.currentValue > 0)
    .map(pos => ({
      ticker: pos.ticker,
      percentage: Math.round((pos.currentValue / total) * 100 * 100) / 100 // 2 decimal places
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Encode portfolio data to URL-safe Base64 blob
 */
export function encodePortfolio(positions: Array<{
  ticker: string;
  currentValue: number;
}>): string {
  const sanitized = sanitizePortfolio(positions);
  const data: PortfolioShareData = {
    positions: sanitized,
    timestamp: Date.now()
  };
  
  // Convert to Base64 URL-safe string
  const json = JSON.stringify(data);
  
  // Use browser's btoa or Node's Buffer
  let base64: string;
  if (typeof window !== 'undefined') {
    // Browser
    base64 = btoa(unescape(encodeURIComponent(json)));
  } else {
    // Node.js
    base64 = Buffer.from(json).toString('base64');
  }
  
  // Make URL-safe (replace + with -, / with _, remove padding)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode portfolio blob from URL
 */
export function decodePortfolio(blob: string): PortfolioShareData | null {
  try {
    // Restore Base64 padding and characters
    let base64 = blob
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode
    let json: string;
    if (typeof window !== 'undefined') {
      // Browser
      json = decodeURIComponent(escape(atob(base64)));
    } else {
      // Node.js
      json = Buffer.from(base64, 'base64').toString('utf-8');
    }
    
    return JSON.parse(json) as PortfolioShareData;
  } catch (error) {
    console.error('Failed to decode portfolio blob:', error);
    return null;
  }
}



