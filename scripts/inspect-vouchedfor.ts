/**
 * Diagnostic script to inspect VouchedFor page structure
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import puppeteer from 'puppeteer';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function inspectVouchedFor() {
  console.log('🔍 Inspecting VouchedFor page structure...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  try {
    const url = 'https://www.vouchedfor.co.uk/financial-advisor-ifa/london';
    console.log(`📍 Visiting: ${url}\n`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const pageInfo = await page.evaluate(() => {
      const allAnchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      
      // Find all links that might be advisor profiles
      const potentialProfiles = allAnchors
        .filter(a => {
          const href = a.href;
          return href && 
                 href.includes('vouchedfor.co.uk') &&
                 (href.includes('/profiles/') || href.includes('/financial-advisor-ifa/'));
        })
        .slice(0, 10)
        .map(a => ({
          href: a.href,
          text: a.innerText?.trim() || '',
          className: a.className,
        }));

      // Find external links
      const externalLinks = allAnchors
        .filter(a => {
          const href = a.href;
          return href && 
                 !href.includes('vouchedfor.co.uk') &&
                 href.startsWith('http') &&
                 !href.includes('facebook.com') &&
                 !href.includes('linkedin.com');
        })
        .slice(0, 5)
        .map(a => ({
          href: a.href,
          text: a.innerText?.trim() || '',
        }));

      // Get page structure hints
      const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="profile"], [class*="advisor"], article'));
      
      return {
        totalAnchors: allAnchors.length,
        potentialProfiles,
        externalLinks,
        cardCount: cards.length,
        pageTitle: document.title,
        url: window.location.href,
      };
    });

    console.log('📊 Page Analysis:');
    console.log(`   URL: ${pageInfo.url}`);
    console.log(`   Title: ${pageInfo.pageTitle}`);
    console.log(`   Total Anchors: ${pageInfo.totalAnchors}`);
    console.log(`   Card Elements: ${pageInfo.cardCount}`);
    console.log(`\n🔗 Potential Profile Links (first 10):`);
    pageInfo.potentialProfiles.forEach((link, i) => {
      console.log(`   ${i + 1}. ${link.text || '(no text)'}`);
      console.log(`      URL: ${link.href}`);
      console.log(`      Class: ${link.className || '(none)'}`);
    });
    console.log(`\n🌐 External Links (first 5):`);
    pageInfo.externalLinks.forEach((link, i) => {
      console.log(`   ${i + 1}. ${link.text || '(no text)'}`);
      console.log(`      URL: ${link.href}`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  inspectVouchedFor();
}








