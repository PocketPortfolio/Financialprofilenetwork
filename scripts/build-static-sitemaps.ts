/**
 * Build Static Sitemaps - Operation Fresh Start
 * Generates all sitemap XML files as static assets in public/ folder
 * Implements versioning (-v1) and gzip compression for large files
 * Runs during build process to ensure Googlebot gets reliable static files
 */

import { writeFileSync, mkdirSync } from 'fs';
import { gzipSync } from 'zlib';
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
const VERSION = 'v2'; // Cache-bust version suffix (bumped to force fresh fetch)
const COMPRESS_THRESHOLD_KB = 100; // Compress files larger than 100KB

interface BuildResult {
  name: string;
  url: string;
  urlCount: number;
  compressed: boolean;
}

async function buildSitemap(
  baseName: string, 
  generator: () => Promise<any>,
  compress: boolean = false
): Promise<BuildResult> {
  const versionedName = `${baseName}-${VERSION}`;
  console.log(`📝 Building ${versionedName}...`);
  
  try {
    const sitemap = await generator();
    
    if (!Array.isArray(sitemap)) {
      throw new Error(`${versionedName}: Generator did not return an array`);
    }
    
    if (sitemap.length === 0) {
      console.warn(`⚠️  ${versionedName}: Empty sitemap (0 URLs)`);
    }
    
    const xml = sitemapToXml(sitemap);
    const xmlBuffer = Buffer.from(xml, 'utf-8');
    const originalSizeKB = (xmlBuffer.length / 1024).toFixed(1);
    
    let filePath: string;
    let finalBuffer: Buffer;
    let shouldCompress = compress;
    
    // Auto-compress if file is large (even if compress flag not set)
    if (!shouldCompress && xmlBuffer.length > COMPRESS_THRESHOLD_KB * 1024) {
      shouldCompress = true;
      console.log(`   📦 Auto-compressing large file (${originalSizeKB}KB)`);
    }
    
    if (shouldCompress) {
      // Compress with gzip
      finalBuffer = gzipSync(xmlBuffer);
      filePath = join(SITEMAP_DIR, `${versionedName}.xml.gz`);
      const compressedSizeKB = (finalBuffer.length / 1024).toFixed(1);
      const compressionRatio = ((1 - finalBuffer.length / xmlBuffer.length) * 100).toFixed(1);
      console.log(`   🗜️  Compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction)`);
    } else {
      finalBuffer = xmlBuffer;
      filePath = join(SITEMAP_DIR, `${versionedName}.xml`);
    }
    
    writeFileSync(filePath, finalBuffer);
    
    const baseUrl = 'https://www.pocketportfolio.app';
    const url = shouldCompress 
      ? `${baseUrl}/${versionedName}.xml.gz`
      : `${baseUrl}/${versionedName}.xml`;
    
    console.log(`✅ ${versionedName}: ${sitemap.length} URLs → ${filePath}`);
    
    return {
      name: versionedName,
      url,
      urlCount: sitemap.length,
      compressed: shouldCompress
    };
  } catch (error) {
    console.error(`❌ ${versionedName}: Error building sitemap:`, error);
    throw error;
  }
}

async function buildSitemapIndex(results: BuildResult[], lastmod: string): Promise<void> {
  const baseUrl = 'https://www.pocketportfolio.app';
  
  const sitemapEntries = results.map(result => `  <sitemap>
    <loc>${result.url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  const filePath = join(SITEMAP_DIR, 'sitemap.xml');
  writeFileSync(filePath, sitemapIndex, 'utf-8');
  console.log(`✅ sitemap.xml (index) → ${filePath}`);
}

async function main() {
  console.log('🚀 Building static sitemaps (Operation Fresh Start)...\n');
  console.log(`📌 Version: ${VERSION} (cache-bust)\n`);
  
  const startTime = Date.now();
  const lastmod = new Date().toISOString().split('T')[0];
  
  try {
    // Ensure public directory exists
    mkdirSync(SITEMAP_DIR, { recursive: true });
    
    // Build all sub-sitemaps
    // Small files: no compression (blog, static, imports, tools)
    // Large files: compression (tickers)
    const results: BuildResult[] = [
      await buildSitemap('sitemap-static', sitemapStatic, false),
      await buildSitemap('sitemap-imports', sitemapImports, false),
      await buildSitemap('sitemap-tools', sitemapTools, false),
      await buildSitemap('sitemap-blog', sitemapBlog, false),
      await buildSitemap('sitemap-tickers-1', sitemapTickers1, true), // Compress large files
      await buildSitemap('sitemap-tickers-2', sitemapTickers2, true), // Compress large files
    ];
    
    // Build main sitemap index
    await buildSitemapIndex(results, lastmod);
    
    const duration = Date.now() - startTime;
    const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0);
    const compressedCount = results.filter(r => r.compressed).length;
    
    console.log(`\n📊 Build Summary:`);
    console.log(`   Total URLs: ${totalUrls.toLocaleString()}`);
    console.log(`   Compressed files: ${compressedCount}/${results.length}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Files: ${results.length + 1} files in ${SITEMAP_DIR}`);
    console.log(`\n✅ All static sitemaps built successfully!`);
    console.log(`\n🔄 Next Steps:`);
    console.log(`   1. Wait for Vercel deployment`);
    console.log(`   2. In Google Search Console:`);
    console.log(`      - Delete old sitemap.xml`);
    console.log(`      - Submit: https://www.pocketportfolio.app/sitemap.xml`);
    console.log(`   3. Googlebot will see new filenames (-v1) and fetch fresh`);
    
  } catch (error) {
    console.error('\n❌ Failed to build static sitemaps:', error);
    process.exit(1);
  }
}

main();
