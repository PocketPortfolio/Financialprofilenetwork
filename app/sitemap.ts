import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { getAllTickers, getAllExchanges } from '@/app/lib/pseo/data';
import { SUPPORTED_BROKERS } from '@/app/lib/brokers/config';

/**
 * OPERATION VELOCITY: Consolidated Sitemap
 * All pages in one sitemap for immediate Google discovery
 * Includes: static pages, ticker pages, data intent routes, broker imports
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
  try {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/positions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/watchlist`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/import`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/openbrokercsv`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/static/portfolio-tracker`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/static/csv-etoro-to-openbrokercsv`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tools/google-sheets-formula`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - monetization tool
    },
    {
      url: `${baseUrl}/for/advisors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - monetization tool
    },
    {
      url: `${baseUrl}/sponsor`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - monetization page
    },
    {
      url: `${baseUrl}/features/google-drive-sync`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - feature page for SEO
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9, // High priority - blog index
    },
    // Competitor comparison pages (high priority for SEO hijacking)
    {
      url: `${baseUrl}/compare/koinly`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/turbotax`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/ghostfolio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare/sharesight`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
  
    // OPERATION VELOCITY: Ticker pages + data intent routes
    let tickerPages: MetadataRoute.Sitemap = [];
    try {
      const tickers = getAllTickers();
      if (!Array.isArray(tickers)) {
        console.error('[Sitemap] getAllTickers() did not return an array:', typeof tickers);
      } else if (tickers.length === 0) {
        console.warn('[Sitemap] No tickers returned from getAllTickers()');
      } else {
        tickers.forEach((ticker) => {
          if (ticker && typeof ticker === 'string') {
            const tickerLower = ticker.toLowerCase().replace(/-/g, '');
            
            // Main ticker page
            tickerPages.push({
              url: `${baseUrl}/s/${tickerLower}`,
              lastModified: now,
              changeFrequency: 'daily' as const,
              priority: 0.6,
            });
            
            // Data intent routes (Operation Velocity)
            tickerPages.push({
              url: `${baseUrl}/s/${tickerLower}/json-api`,
              lastModified: now,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
            
            tickerPages.push({
              url: `${baseUrl}/s/${tickerLower}/dividend-history`,
              lastModified: now,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
            
            tickerPages.push({
              url: `${baseUrl}/s/${tickerLower}/insider-trading`,
              lastModified: now,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
          }
        });
        
        console.log(`[Sitemap] Generated ${tickerPages.length} ticker-related pages from ${tickers.length} tickers`);
      }
    } catch (error) {
      console.error('[Sitemap] Error generating ticker pages:', error);
      if (error instanceof Error) {
        console.error('[Sitemap] Error stack:', error.stack);
      }
    }
    
    // OPERATION VELOCITY: Broker import pages (50 brokers, Priority 1.0)
    let brokerImportPages: MetadataRoute.Sitemap = [];
    try {
      SUPPORTED_BROKERS.forEach((broker) => {
        brokerImportPages.push({
          url: `${baseUrl}/import/${broker.toLowerCase()}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 1.0, // Money pages - highest priority
        });
      });
      console.log(`[Sitemap] Generated ${brokerImportPages.length} broker import pages`);
    } catch (error) {
      console.error('[Sitemap] Error generating broker import pages:', error);
    }
    
    // OPERATION ORGANIC MAGNET: Tax conversion tool pages (Q1 tax season traffic)
    let toolPages: MetadataRoute.Sitemap = [];
    try {
      const { CONVERSION_PAIRS } = await import('@/app/lib/tax-formats/conversion-pairs');
      toolPages = CONVERSION_PAIRS.map((pair) => ({
        url: `${baseUrl}/tools/${pair.id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.9, // High priority - Q1 tax season traffic
      }));
      console.log(`[Sitemap] Generated ${toolPages.length} tax conversion tool pages`);
    } catch (error) {
      console.error('[Sitemap] Error generating tool pages:', error);
      // Continue without tool pages - don't fail deployment
    }
    
    // Dynamic exchange/broker pages
    let exchangePages: MetadataRoute.Sitemap = [];
    try {
      const exchanges = getAllExchanges();
      if (!Array.isArray(exchanges)) {
        console.error('[Sitemap] getAllExchanges() did not return an array:', typeof exchanges);
      } else if (exchanges.length === 0) {
        console.warn('[Sitemap] No exchanges returned from getAllExchanges()');
      } else {
        exchangePages = exchanges
          .filter((exchange): exchange is string => Boolean(exchange && typeof exchange === 'string'))
          .map((exchange) => ({
            url: `${baseUrl}/import/${exchange.toLowerCase()}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }));
        
        console.log(`[Sitemap] Generated ${exchangePages.length} exchange pages from ${exchanges.length} exchanges`);
      }
    } catch (error) {
      console.error('[Sitemap] Error generating exchange pages:', error);
      // Log full error details for debugging
      if (error instanceof Error) {
        console.error('[Sitemap] Error stack:', error.stack);
      }
      // Continue without exchange pages - don't fail deployment
    }
    
    // Combine all pages for Operation Velocity
    // Generate blog post pages
    const blogPages: MetadataRoute.Sitemap = [];
    try {
      const postsDir = path.join(process.cwd(), 'content', 'posts');
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir);
        const postFiles = files.filter(file => file.endsWith('.mdx'));
        
        for (const file of postFiles) {
          try {
            const filePath = path.join(postsDir, file);
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            const matter = require('gray-matter');
            const { data } = matter(fileContents);
            const slug = file.replace('.mdx', '');
            
            blogPages.push({
              url: `${baseUrl}/blog/${slug}`,
              lastModified: data.date ? new Date(data.date) : now,
              changeFrequency: 'weekly',
              priority: 0.8, // High priority for SEO
            });
          } catch (error) {
            console.error(`[Sitemap] Error processing blog post ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('[Sitemap] Error generating blog sitemap:', error);
    }

    const allPages = [...staticPages, ...tickerPages, ...brokerImportPages, ...toolPages, ...exchangePages, ...blogPages];
    console.log(`[Sitemap] Total pages: ${allPages.length} (${staticPages.length} static + ${tickerPages.length} tickers + ${brokerImportPages.length} broker imports + ${toolPages.length} tools + ${exchangePages.length} exchanges + ${blogPages.length} blog posts)`);
    
    // Validate sitemap structure before returning
    if (allPages.length === 0) {
      console.error('[Sitemap] WARNING: Sitemap is empty! Returning minimal fallback.');
      return [
        {
          url: baseUrl,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 1.0,
        },
      ];
    }
    
    // Validate all URLs are valid
    const invalidPages = allPages.filter(page => !page.url || !page.url.startsWith('http'));
    if (invalidPages.length > 0) {
      console.error(`[Sitemap] WARNING: Found ${invalidPages.length} pages with invalid URLs`);
    }
    
    return allPages;
  } catch (error) {
    // Ultimate fallback: return at least static pages
    console.error('[Sitemap] Critical error in sitemap generation:', error);
    return [
      {
        url: baseUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/dashboard`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}