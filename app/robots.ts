import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicitly allow /api/og for all crawlers (social media platforms need this)
      // This must come before the general /api/ disallow rule
      {
        userAgent: '*',
        allow: ['/api/og'],
        disallow: [],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '*.json',
        ],
      },
      // AI Crawlers - Explicitly Invited to Blog & API
      {
        userAgent: 'GPTBot',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/blog/', '/api/tickers/'],
        disallow: ['/admin/', '/_next/', '/api/'],
      },
    ],
    sitemap: 'https://www.pocketportfolio.app/sitemap.xml',
    host: 'https://www.pocketportfolio.app',
  };
}