/**
 * Build Static Sitemaps
 * Generates all sitemap XML files as static assets in public/ folder
 * Runs during build process to ensure Googlebot gets reliable static files
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { sitemapToXml } from '../app/lib/sitemap-xml-helper';

// Import sitemap generators
import sitemapStatic from '../app/sitemap-static';
import sitemapImports from '../app/sitemap-imports';
import sitemapTools from '../app/sitemap-tools';
import sitemapBlog from '../app/sitemap-blog';
import sitemapTickers1 from '../app/sitemap-tickers-1';
import sitemapTickers2 from '../app/sitemap-tickers-2';

const PUBLIC_DIR = join(process.cwd(), 'public');
const SITEMAP_DIR = PUBLIC_DIR; // Files go directly in public/

async function buildSitemap(name: string, generator: () => Promise<any>): Promise<number> {
  console.log(`📝 Building ${name}...`);
  
  try {
    const sitemap = await generator();
    
    if (!Array.isArray(sitemap)) {
      throw new Error(`${name}: Generator did not return an array`);
    }
    
    if (sitemap.length === 0) {
      console.warn(`⚠️  ${name}: Empty sitemap (0 URLs)`);
    }
    
    const xml = sitemapToXml(sitemap);
    const filePath = join(SITEMAP_DIR, `${name}.xml`);
    
    writeFileSync(filePath, xml, 'utf-8');
    
    const fileSizeKB = (Buffer.byteLength(xml, 'utf-8') / 1024).toFixed(1);
    console.log(`✅ ${name}: ${sitemap.length} URLs, ${fileSizeKB}KB → ${filePath}`);
    
    return sitemap.length;
  } catch (error) {
    console.error(`❌ ${name}: Error building sitemap:`, error);
    throw error;
  }
}

async function buildSitemapIndex(lastmod: string): Promise<void> {
  const baseUrl = 'https://www.pocketportfolio.app';
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-imports.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-tools.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-tickers-1.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-tickers-2.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;

  const filePath = join(SITEMAP_DIR, 'sitemap.xml');
  writeFileSync(filePath, sitemapIndex, 'utf-8');
  console.log(`✅ sitemap.xml (index) → ${filePath}`);
}

async function main() {
  console.log('🚀 Building static sitemaps...\n');
  
  const startTime = Date.now();
  const lastmod = new Date().toISOString().split('T')[0];
  
  try {
    // Ensure public directory exists
    mkdirSync(SITEMAP_DIR, { recursive: true });
    
    // Build all sub-sitemaps
    const results = {
      static: await buildSitemap('sitemap-static', sitemapStatic),
      imports: await buildSitemap('sitemap-imports', sitemapImports),
      tools: await buildSitemap('sitemap-tools', sitemapTools),
      blog: await buildSitemap('sitemap-blog', sitemapBlog),
      tickers1: await buildSitemap('sitemap-tickers-1', sitemapTickers1),
      tickers2: await buildSitemap('sitemap-tickers-2', sitemapTickers2),
    };
    
    // Build main sitemap index
    await buildSitemapIndex(lastmod);
    
    const duration = Date.now() - startTime;
    const totalUrls = Object.values(results).reduce((sum, count) => sum + count, 0);
    
    console.log(`\n📊 Build Summary:`);
    console.log(`   Total URLs: ${totalUrls.toLocaleString()}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Files: 7 XML files in ${SITEMAP_DIR}`);
    console.log(`\n✅ All static sitemaps built successfully!`);
    
  } catch (error) {
    console.error('\n❌ Failed to build static sitemaps:', error);
    process.exit(1);
  }
}

main();
