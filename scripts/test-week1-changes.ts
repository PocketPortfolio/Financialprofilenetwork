/**
 * Week 1 Changes Test Script
 * Validates pricing schema, risk pages, and TechArticle schema
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Test 1: Verify pricing schema in TickerPageContent
function testPricingSchema() {
  try {
    const filePath = join(process.cwd(), 'app/components/TickerPageContent.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for multi-offer structure
    const hasMultiOffer = content.includes('offers: [') && content.includes('Founders Club Lifetime License');
    const hasCorrectPrice = content.includes("price: '100.00'");
    const hasCorrectCurrency = content.includes("priceCurrency: 'GBP'");
    const hasFreeTier = content.includes("name: 'Free Tier'");
    
    if (hasMultiOffer && hasCorrectPrice && hasCorrectCurrency && hasFreeTier) {
      results.push({
        name: 'Pricing Schema - Ticker Pages',
        status: 'PASS',
        message: 'Multi-offer schema with £100 Founder\'s Club correctly implemented'
      });
    } else {
      results.push({
        name: 'Pricing Schema - Ticker Pages',
        status: 'FAIL',
        message: 'Missing required pricing schema elements',
        details: {
          hasMultiOffer,
          hasCorrectPrice,
          hasCorrectCurrency,
          hasFreeTier
        }
      });
    }
  } catch (error) {
    results.push({
      name: 'Pricing Schema - Ticker Pages',
      status: 'FAIL',
      message: `Error reading file: ${error}`
    });
  }
}

// Test 2: Verify risk pages exist
function testRiskPages() {
  try {
    const pagePath = join(process.cwd(), 'app/tools/track-[ticker]/page.tsx');
    const componentPath = join(process.cwd(), 'app/tools/track-[ticker]/RiskCalculatorPrefilled.tsx');
    
    const pageExists = require('fs').existsSync(pagePath);
    const componentExists = require('fs').existsSync(componentPath);
    
    if (pageExists && componentExists) {
      const pageContent = readFileSync(pagePath, 'utf-8');
      const hasGenerateStaticParams = pageContent.includes('generateStaticParams');
      const hasISR = pageContent.includes('revalidate');
      const hasSchema = pageContent.includes('SoftwareApplication');
      const hasFAQ = pageContent.includes('FAQPage');
      
      if (hasGenerateStaticParams && hasISR && hasSchema && hasFAQ) {
        results.push({
          name: 'Programmatic Risk Pages',
          status: 'PASS',
          message: 'Risk pages correctly implemented with ISR and SEO schemas'
        });
      } else {
        results.push({
          name: 'Programmatic Risk Pages',
          status: 'WARN',
          message: 'Risk pages exist but missing some features',
          details: {
            hasGenerateStaticParams,
            hasISR,
            hasSchema,
            hasFAQ
          }
        });
      }
    } else {
      results.push({
        name: 'Programmatic Risk Pages',
        status: 'FAIL',
        message: 'Risk page files not found',
        details: {
          pageExists,
          componentExists
        }
      });
    }
  } catch (error) {
    results.push({
      name: 'Programmatic Risk Pages',
      status: 'FAIL',
      message: `Error checking risk pages: ${error}`
    });
  }
}

// Test 3: Verify TechArticle schema
function testTechArticleSchema() {
  try {
    const filePath = join(process.cwd(), 'app/blog/[slug]/page.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    const hasTechArticle = content.includes("'TechArticle'");
    const hasConditional = content.includes('isTechnical');
    const hasAbout = content.includes('about:');
    const hasProficiencyLevel = content.includes('proficiencyLevel');
    
    if (hasTechArticle && hasConditional) {
      results.push({
        name: 'TechArticle Schema',
        status: 'PASS',
        message: 'TechArticle schema correctly implemented for technical posts'
      });
    } else {
      results.push({
        name: 'TechArticle Schema',
        status: 'WARN',
        message: 'TechArticle schema partially implemented',
        details: {
          hasTechArticle,
          hasConditional,
          hasAbout,
          hasProficiencyLevel
        }
      });
    }
  } catch (error) {
    results.push({
      name: 'TechArticle Schema',
      status: 'FAIL',
      message: `Error checking TechArticle schema: ${error}`
    });
  }
}

// Test 4: Verify sitemap includes risk pages
function testSitemapUpdates() {
  try {
    const filePath = join(process.cwd(), 'app/sitemap-tools.ts');
    const content = readFileSync(filePath, 'utf-8');
    
    const hasRiskPages = content.includes('track-') && content.includes('risk');
    const hasGetAllTickers = content.includes('getAllTickers');
    const hasTop500 = content.includes('slice(0, 500)');
    
    if (hasRiskPages && hasGetAllTickers) {
      results.push({
        name: 'Sitemap - Risk Pages',
        status: 'PASS',
        message: 'Sitemap correctly includes programmatic risk pages'
      });
    } else {
      results.push({
        name: 'Sitemap - Risk Pages',
        status: 'WARN',
        message: 'Sitemap may not include all risk pages',
        details: {
          hasRiskPages,
          hasGetAllTickers,
          hasTop500
        }
      });
    }
  } catch (error) {
    results.push({
      name: 'Sitemap - Risk Pages',
      status: 'FAIL',
      message: `Error checking sitemap: ${error}`
    });
  }
}

// Test 5: Verify risk page pricing schema
function testRiskPagePricing() {
  try {
    const filePath = join(process.cwd(), 'app/tools/track-[ticker]/page.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    const hasMultiOffer = content.includes('offers: [');
    const hasFoundersClub = content.includes("Founders Club Lifetime License");
    const hasCorrectPrice = content.includes("price: '100.00'");
    const hasCorrectCurrency = content.includes("priceCurrency: 'GBP'");
    
    if (hasMultiOffer && hasFoundersClub && hasCorrectPrice && hasCorrectCurrency) {
      results.push({
        name: 'Risk Pages - Pricing Schema',
        status: 'PASS',
        message: 'Risk pages have correct pricing schema'
      });
    } else {
      results.push({
        name: 'Risk Pages - Pricing Schema',
        status: 'FAIL',
        message: 'Risk pages missing correct pricing schema',
        details: {
          hasMultiOffer,
          hasFoundersClub,
          hasCorrectPrice,
          hasCorrectCurrency
        }
      });
    }
  } catch (error) {
    results.push({
      name: 'Risk Pages - Pricing Schema',
      status: 'FAIL',
      message: `Error checking risk page pricing: ${error}`
    });
  }
}

// Run all tests
console.log('🧪 Running Week 1 Changes Tests...\n');

testPricingSchema();
testRiskPages();
testTechArticleSchema();
testSitemapUpdates();
testRiskPagePricing();

// Print results
console.log('📊 Test Results:\n');
let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach((result, index) => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${index + 1}. ${result.name}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Message: ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, JSON.stringify(result.details, null, 2));
  }
  console.log('');
  
  if (result.status === 'PASS') passCount++;
  else if (result.status === 'FAIL') failCount++;
  else warnCount++;
});

console.log('📈 Summary:');
console.log(`   ✅ Passed: ${passCount}`);
console.log(`   ⚠️  Warnings: ${warnCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   Total: ${results.length}\n`);

if (failCount === 0) {
  console.log('🎉 All critical tests passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review before deploying.');
  process.exit(1);
}

