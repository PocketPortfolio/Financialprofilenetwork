/**
 * Helper function to convert MetadataRoute.Sitemap to XML format
 */

import { MetadataRoute } from 'next';

export function sitemapToXml(sitemap: MetadataRoute.Sitemap): string {
  const urls = sitemap.map((entry) => {
    const url = entry.url;
    const lastmod = entry.lastModified 
      ? new Date(entry.lastModified).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const changefreq = entry.changeFrequency || 'weekly';
    const priority = entry.priority?.toFixed(1) || '0.5';

    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

