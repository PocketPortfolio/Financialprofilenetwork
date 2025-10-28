import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '*.json',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://www.pocketportfolio.app/sitemap.xml',
    host: 'https://www.pocketportfolio.app',
  };
}