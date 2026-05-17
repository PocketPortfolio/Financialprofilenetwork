/**
 * Sitemap: Static Pages — Pocket Portfolio (B2C wealth-manager surface)
 *
 * The 12 developer/infrastructure routes (architecture, designchallenge,
 * tier1designpartner, board-of-investors, sovereign-ai-grant, learn/sovereign-*,
 * learn/local-first, learn/vendor-lock-in, playbooks/sovereign-strike,
 * openbrokercsv, stack-reveal) live on the Open Portfolio surface and are
 * indexed via app/open/sitemap-static.ts under www.openportfolio.co.uk.
 * Removing them from this Pocket sitemap is part of the CEO mandate 2026-05-15:
 * B2C sitemaps target wealth-manager intent; B2B sitemaps target developer intent.
 */

import { MetadataRoute } from 'next';

export default async function sitemapStatic(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pocketportfolio.app';
  const now = new Date();
  
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
    {
      url: `${baseUrl}/landing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Blog page removed - included in sitemap-blog.ts
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
    // CSV conversion guide removed - included in sitemap-imports.ts
    {
      url: `${baseUrl}/tools/google-sheets-formula`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ✅ Risk Calculator Lead Magnet
    {
      url: `${baseUrl}/tools/risk-calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority because it's a lead magnet
    },
    // ✅ Risk Pages Browser (15K+ Pages Hub)
    {
      url: `${baseUrl}/tools/risk-pages`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85, // High priority for SEO (15K+ pages hub)
    },
    // ✅ Tools Index Page (Lists all tools including tax converters)
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - lists all tools
    },
    {
      url: `${baseUrl}/for/advisors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sponsor`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ✅ Cheapest Portfolio Tracker Landing Page (AI Discovery)
    {
      url: `${baseUrl}/cheapest-portfolio-tracker-no-subscription`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95, // Very high priority - targets exact AI query
    },
    {
      url: `${baseUrl}/features/google-drive-sync`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
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
    {
      url: `${baseUrl}/compare/trade-republic`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ✅ Learn Section (Knowledge Graph - Step 2)
    {
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // High priority - glossary hub
    },
    {
      url: `${baseUrl}/learn/portfolio-beta`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/sector-drift`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/fee-drag`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/realised-vs-unrealised`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/dollar-cost-averaging`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/json-finance`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // /learn/sovereign-stack and /learn/sovereign-finance migrated to Open Portfolio
    // (B2B developer surface). See app/open/sitemap-static.ts.
    // /architecture migrated to Open Portfolio (B2B developer surface).
    // Press / AEO substrate (canonical machine-readable identity page)
    {
      url: `${baseUrl}/press`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ✅ Waitlist Page (Priority Queue)
    {
      url: `${baseUrl}/waitlist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // ✅ Technical Press: Books index + titles (SEO, AEO, GEO)
    {
      url: `${baseUrl}/book`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88,
    },
    // Public lead magnet: Zero-Trust Architecture Challenge (LinkedIn / CTO funnel)
    {
      url: `${baseUrl}/challenge`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    // /designchallenge, /tier1designpartner, /board-of-investors migrated to
    // Open Portfolio (B2B developer surface). See app/open/sitemap-static.ts.
    {
      url: `${baseUrl}/book/universal-llm-import`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/book/sovereign-intelligence`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];
}

