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
      // Explicitly allow /static/portfolio-tracker for all crawlers (SEO page in sitemap)
      // This must come before the general /static/ disallow rule
      {
        userAgent: '*',
        allow: ['/static/portfolio-tracker'],
        disallow: [],
      },
      // Explicitly allow /static/csv-etoro-to-openbrokercsv for all crawlers (conversion guide in sitemap)
      // This must come before the general /static/ disallow rule
      {
        userAgent: '*',
        allow: ['/static/csv-etoro-to-openbrokercsv'],
        disallow: [],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/demo/',
          '/_next/',
          '/static/',
          '*.json',
        ],
      },
      // AI crawlers: invite docs & pillars; block raw API firehose (Wave 2)
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/learn/', '/blog/', '/book/', '/import/', '/s/', '/llms.txt', '/llms-full.txt', '/press/'],
        disallow: ['/admin/', '/demo/', '/_next/', '/api/'],
      },
    ],
    sitemap: 'https://www.pocketportfolio.app/sitemap.xml',
    host: 'https://www.pocketportfolio.app',
  };
}