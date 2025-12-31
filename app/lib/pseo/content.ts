/**
 * pSEO Content Generation
 * Generates SEO-optimized content for programmatic pages
 */

import type { TickerMetadata, PageContent, ExchangeMetadata } from './types';
import { generateTickerLinkGraph } from './linking';

/**
 * Generate full page content for a ticker page
 */
export async function generateTickerContent(
  symbol: string,
  metadata: TickerMetadata
): Promise<PageContent> {
  const template = metadata.contentTemplate || 'default';
  const name = metadata.name || `${symbol} Inc.`;
  const exchange = metadata.exchange || 'NYSE';
  const sector = metadata.sector || 'General';

  // Generate title and description
  const title = `${symbol} Stock Analysis & Portfolio Tracking | Pocket Portfolio`;
  const description = metadata.description || 
    `Track ${symbol} (${name}) stock price, performance, and portfolio analysis. Import ${symbol} positions from broker CSVs or export ${symbol} historical data to JSON. Free, open-source portfolio tracking.`;

  // Generate H1
  const h1 = `${symbol} Stock Analysis & Portfolio Tracker`;

  // Generate H2 sections based on template
  const h2Sections: string[] = [];
  
  if (template === 'tech') {
    h2Sections.push(
      `${symbol} Technology Stock Analysis`,
      `Track ${symbol} in Your Portfolio`,
      `${symbol} CSV Import & JSON Export`,
      `Related Technology Stocks`
    );
  } else if (template === 'finance') {
    h2Sections.push(
      `${symbol} Financial Services Analysis`,
      `Track ${symbol} in Your Portfolio`,
      `${symbol} CSV Import & JSON Export`,
      `Related Financial Stocks`
    );
  } else {
    h2Sections.push(
      `Track ${symbol} in Your Portfolio`,
      `${symbol} CSV Import & JSON Export`,
      `${symbol} Stock Information`,
      `Related Stocks`
    );
  }

  // Generate body content
  let body = `<p>${description}</p>`;
  
  body += `<h2>${h2Sections[0]}</h2>`;
  body += `<p>${symbol} (${name}) is listed on ${exchange}${sector !== 'General' ? ` in the ${sector} sector` : ''}. Track your ${symbol} positions, import trades from broker CSVs, and export ${symbol} historical data to JSON format using Pocket Portfolio's free portfolio integration platform.</p>`;
  
  body += `<h2>${h2Sections[1]}</h2>`;
  body += `<p>Import your ${symbol} trades from any supported broker including Robinhood, Fidelity, eToro, Trading212, Coinbase, and more. Simply upload your CSV file and Pocket Portfolio will automatically parse and track your ${symbol} positions.</p>`;
  
  body += `<h2>${h2Sections[2]}</h2>`;
  body += `<p>Export ${symbol} historical data to JSON format for programmatic access. Use our free API to integrate ${symbol} tracking into your own applications or analysis tools.</p>`;

  if (metadata.relatedTickers && metadata.relatedTickers.length > 0) {
    body += `<h2>${h2Sections[h2Sections.length - 1]}</h2>`;
    body += `<p>Explore related stocks: ${metadata.relatedTickers.slice(0, 5).join(', ')}</p>`;
  }

  // Generate internal links
  const internalLinks = await generateTickerLinkGraph(symbol);

  // Generate CTA
  const cta = {
    text: 'Start Tracking Your Portfolio',
    url: '/import?utm_source=seo&utm_medium=ticker_page&utm_campaign=cta'
  };

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: symbol,
    description: description,
    tickerSymbol: symbol,
    exchange: exchange,
    sector: sector
  };

  return {
    title,
    description,
    h1,
    h2: h2Sections,
    body,
    cta,
    internalLinks,
    structuredData
  };
}

/**
 * Generate content for exchange pages
 */
export async function generateExchangeContent(
  code: string,
  metadata: ExchangeMetadata
): Promise<PageContent> {
  const title = `${metadata.name} (${code}) Stock Exchange | Pocket Portfolio`;
  const description = metadata.description || 
    `Track stocks listed on ${metadata.name} (${code}). Import positions from broker CSVs or export historical data to JSON. Free portfolio tracking.`;

  const h1 = `${metadata.name} Stock Exchange`;

  const h2Sections = [
    `About ${metadata.name}`,
    `Track ${code} Stocks in Your Portfolio`,
    `Popular Stocks on ${metadata.name}`
  ];

  let body = `<p>${description}</p>`;
  body += `<h2>${h2Sections[0]}</h2>`;
  body += `<p>${metadata.name} (${code}) is a stock exchange located in ${metadata.country}, ${metadata.region}.</p>`;
  body += `<h2>${h2Sections[1]}</h2>`;
  body += `<p>Import your trades from any supported broker and track all your ${code} listed stocks in one portfolio.</p>`;
  
  if (metadata.popularTickers && metadata.popularTickers.length > 0) {
    body += `<h2>${h2Sections[2]}</h2>`;
    body += `<p>Popular stocks on ${metadata.name}: ${metadata.popularTickers.slice(0, 10).join(', ')}</p>`;
  }

  const cta = {
    text: 'Start Tracking Your Portfolio',
    url: '/import?utm_source=seo&utm_medium=exchange_page&utm_campaign=cta'
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: metadata.name,
    description: description
  };

  return {
    title,
    description,
    h1,
    h2: h2Sections,
    body,
    cta,
    internalLinks: [],
    structuredData
  };
}

/**
 * Generate FAQ structured data (JSON-LD)
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): Record<string, any> {
  if (!faqs || faqs.length === 0) {
    return {};
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}
