/**
 * Build Static Sitemaps - Plain XML (No Compression)
 * Generates all sitemap XML files as static assets in public/ folder
 * No compression - Googlebot has issues with pre-compressed .gz files
 * Plain XML files work reliably, even for large files (5.5MB is well under 50MB limit)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { sitemapToXml } from '../app/lib/sitemap-xml-helper';

// Import sitemap generators (these already handle ticker data correctly)
import sitemapStatic from '../app/sitemap-static';
import sitemapImports from '../app/sitemap-imports';
import sitemapTools from '../app/sitemap-tools';
import sitemapBlog from '../app/sitemap-blog';
import sitemapTickers1 from '../app/sitemap-tickers-1';
import sitemapTickers2 from '../app/sitemap-tickers-2';
import sitemapTickers3 from '../app/sitemap-tickers-3';
import sitemapTickers4 from '../app/sitemap-tickers-4';
import sitemapTickers5 from '../app/sitemap-tickers-5';
import sitemapTickers6 from '../app/sitemap-tickers-6';
import sitemapTickers7 from '../app/sitemap-tickers-7';
import sitemapTickers8 from '../app/sitemap-tickers-8';
import sitemapTickers9 from '../app/sitemap-tickers-9';
import sitemapTickers10 from '../app/sitemap-tickers-10';
import sitemapTickers11 from '../app/sitemap-tickers-11';
import sitemapTickers12 from '../app/sitemap-tickers-12';
import sitemapTickers13 from '../app/sitemap-tickers-13';
import sitemapTickers14 from '../app/sitemap-tickers-14';
import sitemapTickers15 from '../app/sitemap-tickers-15';
import sitemapTickers16 from '../app/sitemap-tickers-16';

const PUBLIC_DIR = join(process.cwd(), 'public');
const VERSION = 'v3'; // Current version - keep in sync with deployed version

interface BuildResult {
  name: string;
  url: string;
  urlCount: number;
  filePath: string;
  uniqueUrls: Set<string>;
}

/**
 * Check for duplicates across all sitemaps
 */
function checkForDuplicates(results: BuildResult[]): { hasDuplicates: boolean; duplicates: Map<string, string[]> } {
  const urlToSitemaps = new Map<string, string[]>();
  const duplicates = new Map<string, string[]>();
  
  // Collect all URLs and track which sitemaps they appear in
  results.forEach(result => {
    result.uniqueUrls.forEach(url => {
      if (!urlToSitemaps.has(url)) {
        urlToSitemaps.set(url, []);
      }
      urlToSitemaps.get(url)!.push(result.name);
    });
  });
  
  // Find duplicates (URLs appearing in multiple sitemaps)
  urlToSitemaps.forEach((sitemaps, url) => {
    if (sitemaps.length > 1) {
      duplicates.set(url, sitemaps);
    }
  });
  
  return {
    hasDuplicates: duplicates.size > 0,
    duplicates
  };
}

async function buildSitemap(
  baseName: string, 
  generator: () => Promise<any>
): Promise<BuildResult> {
  const versionedName = `${baseName}-${VERSION}`;
  console.log(`📝 Building ${versionedName}...`);
  
  try {
    // Use existing generator (handles ticker data, URL structure, etc.)
    const sitemap = await generator();
    
    if (!Array.isArray(sitemap)) {
      throw new Error(`${versionedName}: Generator did not return an array`);
    }
    
    if (sitemap.length === 0) {
      console.warn(`⚠️  ${versionedName}: Empty sitemap (0 URLs)`);
    }
    
    // Check for duplicates within this sitemap
    const urlSet = new Set<string>();
    const duplicatesInSitemap: string[] = [];
    
    sitemap.forEach((entry: any) => {
      if (entry.url) {
        if (urlSet.has(entry.url)) {
          duplicatesInSitemap.push(entry.url);
        } else {
          urlSet.add(entry.url);
        }
      }
    });
    
    if (duplicatesInSitemap.length > 0) {
      console.warn(`⚠️  ${versionedName}: Found ${duplicatesInSitemap.length} duplicate URLs within sitemap:`);
      duplicatesInSitemap.slice(0, 10).forEach(url => {
        console.warn(`     - ${url}`);
      });
      if (duplicatesInSitemap.length > 10) {
        console.warn(`     ... and ${duplicatesInSitemap.length - 10} more`);
      }
    }
    
    // Convert to XML using existing helper
    const xml = sitemapToXml(sitemap);
    const filePath = join(PUBLIC_DIR, `${versionedName}.xml`);
    
    // Write plain XML file (no compression)
    writeFileSync(filePath, xml, 'utf-8');
    
    const sizeKB = (Buffer.byteLength(xml, 'utf-8') / 1024).toFixed(1);
    const baseUrl = 'https://www.pocketportfolio.app';
    const url = `${baseUrl}/${versionedName}.xml`;
    
    console.log(`✅ ${versionedName}: ${urlSet.size} unique URLs (${sitemap.length} total), ${sizeKB}KB → ${filePath}`);
    
    return {
      name: versionedName,
      url,
      urlCount: urlSet.size, // Use unique count
      filePath,
      uniqueUrls: urlSet
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

  const filePath = join(PUBLIC_DIR, 'sitemap.xml');
  writeFileSync(filePath, sitemapIndex, 'utf-8');
  console.log(`✅ sitemap.xml (index) → ${filePath}`);
}

async function main() {
  console.log('🚀 Building static sitemaps (Plain XML - No Compression)...\n');
  console.log(`📌 Version: ${VERSION} (cache-bust)\n`);
  
  const startTime = Date.now();
  const lastmod = new Date().toISOString().split('T')[0];
  
  try {
    // Ensure public directory exists
    mkdirSync(PUBLIC_DIR, { recursive: true });
    
    // Build all sub-sitemaps (plain XML, no compression)
    // Split tickers into 16 sitemaps to reduce file size (~1MB each, under Google's recommended 1MB limit)
    const results: BuildResult[] = [
      await buildSitemap('sitemap-static', sitemapStatic),
      await buildSitemap('sitemap-imports', sitemapImports),
      await buildSitemap('sitemap-tools', sitemapTools),
      await buildSitemap('sitemap-blog', sitemapBlog),
      await buildSitemap('sitemap-tickers-1', sitemapTickers1),
      await buildSitemap('sitemap-tickers-2', sitemapTickers2),
      await buildSitemap('sitemap-tickers-3', sitemapTickers3),
      await buildSitemap('sitemap-tickers-4', sitemapTickers4),
      await buildSitemap('sitemap-tickers-5', sitemapTickers5),
      await buildSitemap('sitemap-tickers-6', sitemapTickers6),
      await buildSitemap('sitemap-tickers-7', sitemapTickers7),
      await buildSitemap('sitemap-tickers-8', sitemapTickers8),
      await buildSitemap('sitemap-tickers-9', sitemapTickers9),
      await buildSitemap('sitemap-tickers-10', sitemapTickers10),
      await buildSitemap('sitemap-tickers-11', sitemapTickers11),
      await buildSitemap('sitemap-tickers-12', sitemapTickers12),
      await buildSitemap('sitemap-tickers-13', sitemapTickers13),
      await buildSitemap('sitemap-tickers-14', sitemapTickers14),
      await buildSitemap('sitemap-tickers-15', sitemapTickers15),
      await buildSitemap('sitemap-tickers-16', sitemapTickers16),
    ];
    
    // Check for duplicates across sitemaps
    console.log(`\n🔍 Checking for duplicates across all sitemaps...`);
    const duplicateCheck = checkForDuplicates(results);
    
    if (duplicateCheck.hasDuplicates) {
      console.warn(`\n⚠️  WARNING: Found ${duplicateCheck.duplicates.size} URLs appearing in multiple sitemaps:`);
      let count = 0;
      duplicateCheck.duplicates.forEach((sitemaps, url) => {
        if (count < 20) { // Show first 20
          console.warn(`   - ${url}`);
          console.warn(`     Appears in: ${sitemaps.join(', ')}`);
          count++;
        }
      });
      if (duplicateCheck.duplicates.size > 20) {
        console.warn(`   ... and ${duplicateCheck.duplicates.size - 20} more duplicates`);
      }
      console.warn(`\n⚠️  This may cause issues with Google Search Console indexing.`);
    } else {
      console.log(`✅ No duplicates found across sitemaps - all URLs are unique!`);
    }
    
    // Build main sitemap index
    await buildSitemapIndex(results, lastmod);
    
    const duration = Date.now() - startTime;
    const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0);
    
    console.log(`\n📊 Build Summary:`);
    console.log(`   Total unique URLs: ${totalUrls.toLocaleString()}`);
    console.log(`   Duplicates across sitemaps: ${duplicateCheck.duplicates.size}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Files: ${results.length + 1} files in ${PUBLIC_DIR}`);
    console.log(`   Format: Plain XML (no compression)`);
    console.log(`\n✅ All static sitemaps built successfully!`);
    console.log(`\n🔄 Next Steps:`);
    console.log(`   1. Verify files in ${PUBLIC_DIR}/`);
    console.log(`   2. Deploy to Vercel`);
    console.log(`   3. In Google Search Console:`);
    console.log(`      - Delete old sitemap.xml`);
    console.log(`      - Submit: https://www.pocketportfolio.app/sitemap.xml`);
    console.log(`   4. Googlebot will see new filenames (-v2) and fetch fresh`);
    
  } catch (error) {
    console.error('\n❌ Failed to build static sitemaps:', error);
    process.exit(1);
  }
}

main();
