/**
 * pSEO Infrastructure - Internal Linking Graph
 * Automatically generates internal links between related pages
 * 
 * Strategy: Maximize crawl budget by creating semantic link clusters
 */

import { InternalLink } from './types';
import { getTickerMetadata, getExchangeMetadata, getSectorMetadata } from './data';
import { EXCHANGES, SECTORS } from './data';

export interface LinkGraph {
  ticker: string;
  links: InternalLink[];
}

/**
 * Generate internal links for a ticker page
 * Links to: related tickers, exchange page, sector page, broker import pages
 */
export async function generateTickerLinkGraph(symbol: string): Promise<InternalLink[]> {
  const metadata = await getTickerMetadata(symbol);
  if (!metadata) return [];
  
  const links: InternalLink[] = [];
  
  // 1. Link to exchange page (high priority)
  if (metadata.exchange) {
    links.push({
      url: `/import/${metadata.exchange.toLowerCase()}`,
      anchor: `Track ${metadata.exchange} stocks`,
      type: 'exchange',
      priority: 10
    });
  }
  
  // 2. Link to related tickers (medium priority)
  metadata.relatedTickers.slice(0, 5).forEach(relatedTicker => {
    links.push({
      url: `/s/${relatedTicker.toLowerCase()}`,
      anchor: `${relatedTicker} stock analysis`,
      type: 'ticker',
      priority: 7
    });
  });
  
  // 3. Link to sector page if available (medium priority)
  // TODO: Sector pages not yet implemented - commenting out to prevent 404s
  // if (metadata.sector && SECTORS[metadata.sector]) {
  //   links.push({
  //     url: `/sector/${metadata.sector.toLowerCase().replace(/\s+/g, '-')}`,
  //     anchor: `${metadata.sector} stocks`,
  //     type: 'sector',
  //     priority: 8
  //   });
  // }
  
  // 4. Link to popular broker import pages (lower priority)
  const popularBrokers = ['etoro', 'trading212', 'coinbase', 'robinhood'];
  popularBrokers.forEach(broker => {
    links.push({
      url: `/import/${broker}`,
      anchor: `Import ${broker} trades`,
      type: 'broker',
      priority: 5
    });
  });
  
  // 5. Link to main import page
  links.push({
    url: '/import',
    anchor: 'Import your trades',
    type: 'broker',
    priority: 6
  });
  
  // Sort by priority (highest first)
  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate internal links for an exchange page
 */
export function generateExchangeLinkGraph(exchangeCode: string): InternalLink[] {
  const metadata = getExchangeMetadata(exchangeCode);
  if (!metadata) return [];
  
  const links: InternalLink[] = [];
  
  // Link to popular tickers on this exchange
  metadata.popularTickers.slice(0, 8).forEach(ticker => {
    links.push({
      url: `/s/${ticker.toLowerCase()}`,
      anchor: `${ticker} stock`,
      type: 'ticker',
      priority: 9
    });
  });
  
  // Link to other exchanges
  Object.keys(EXCHANGES).filter(e => e !== exchangeCode).forEach(exchange => {
    links.push({
      url: `/import/${exchange.toLowerCase()}`,
      anchor: `${EXCHANGES[exchange].name} stocks`,
      type: 'exchange',
      priority: 6
    });
  });
  
  // Link to main import page
  links.push({
    url: '/import',
    anchor: 'Import trades from any broker',
    type: 'broker',
    priority: 7
  });
  
  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate internal links for a sector page
 */
export function generateSectorLinkGraph(sectorName: string): InternalLink[] {
  const metadata = getSectorMetadata(sectorName);
  if (!metadata) return [];
  
  const links: InternalLink[] = [];
  
  // Link to all tickers in this sector
  metadata.tickers.forEach(ticker => {
    links.push({
      url: `/s/${ticker.toLowerCase()}`,
      anchor: `${ticker} stock`,
      type: 'ticker',
      priority: 9
    });
  });
  
  // Link to other sectors
  // TODO: Sector pages not yet implemented - commenting out to prevent 404s
  // Object.keys(SECTORS).filter(s => s !== sectorName).forEach(sector => {
  //   links.push({
  //     url: `/sector/${sector.toLowerCase().replace(/\s+/g, '-')}`,
  //     anchor: `${sector} stocks`,
  //     type: 'sector',
  //     priority: 7
  //   });
  // });
  
  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate breadcrumb links for navigation
 */
export function generateBreadcrumbs(type: 'ticker' | 'exchange' | 'sector', identifier: string): InternalLink[] {
  const links: InternalLink[] = [
    {
      url: '/',
      anchor: 'Home',
      type: 'ticker',
      priority: 1
    }
  ];
  
  if (type === 'ticker') {
    links.push({
      url: '/s/aapl', // Popular entry point - /s route doesn't exist
      anchor: 'Stock Analysis',
      type: 'ticker',
      priority: 2
    });
  } else if (type === 'exchange') {
    links.push({
      url: '/import',
      anchor: 'Import Trades',
      type: 'broker',
      priority: 2
    });
  }
  
  return links;
}

















