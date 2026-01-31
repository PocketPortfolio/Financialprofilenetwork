/**
 * Week 1 Deployment Test Suite
 * Tests all critical changes before production deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Test 1: Pricing Schema Fix - Ticker Pages
function testPricingSchemaFix() {
  try {
    const filePath = join(process.cwd(), 'app/components/TickerPageContent.tsx');
    if (!existsSync(filePath)) {
      results.push({
        name: 'Pricing Schema - File Exists',
        status: 'FAIL',
        message: 'TickerPageContent.tsx not found'
      });
      return;
    }
    
    const content = readFileSync(filePath, 'utf-8');
    
    // Critical checks
    const hasMultiOffer = content.includes('offers: [') && content.includes('Founders Club Lifetime License');
    const hasCorrectPrice = content.includes("price: '100.00'");
    const hasCorrectCurrency = content.includes("priceCurrency: 'GBP'");
    const hasFreeTier = content.includes("name: 'Free Tier'");
    const hasLimitedAvailability = content.includes('LimitedAvailability');
    const hasSponsorUrl = content.includes('https://www.pocketportfolio.app/sponsor');
    const noZeroPrice = !content.includes("price: '0'") || content.includes("name: 'Free Tier'"); // Allow zero for free tier
    
    const allChecks = hasMultiOffer && hasCorrectPrice && hasCorrectCurrency && hasFreeTier && hasLimitedAvailability && hasSponsorUrl;
    
    results.push({
      name: 'Pricing Schema - Ticker Pages',
      status: allChecks ? 'PASS' : 'FAIL',
      message: allChecks 
        ? 'Multi-offer schema with £100 Founder\'s Club correctly implemented'
        : 'Missing required pricing schema elements',
      details: allChecks ? undefined : {
        hasMultiOffer,
        hasCorrectPrice,
        hasCorrectCurrency,
        hasFreeTier,
        hasLimitedAvailability,
        hasSponsorUrl,
        noZeroPrice
      }
    });
  } catch (error: any) {
    results.push({
      name: 'Pricing Schema - Ticker Pages',
      status: 'FAIL',
      message: `Error: ${error.message}`
    });
  }
}

// Test 2: Programmatic Risk Pages
function testRiskPages() {
  try {
    const pagePath = join(process.cwd(), 'app/tools/track-[ticker]/page.tsx');
    const componentPath = join(process.cwd(), 'app/tools/track-[ticker]/RiskCalculatorPrefilled.tsx');
    
    const pageExists = existsSync(pagePath);
    const componentExists = existsSync(componentPath);
    
    if (!pageExists || !componentExists) {
      results.push({
        name: 'Risk Pages - Files Exist',
        status: 'FAIL',
        message: `Missing files: page=${pageExists}, component=${componentExists}`
      });
      return;
    }
    
    const pageContent = readFileSync(pagePath, 'utf-8');
    const componentContent = readFileSync(componentPath, 'utf-8');
    
    // Check for required features
    const hasGenerateStaticParams = pageContent.includes('generateStaticParams');
    const hasGenerateMetadata = pageContent.includes('generateMetadata');
    const hasISR = pageContent.includes('revalidate');
    const hasPricingSchema = pageContent.includes('Founders Club Lifetime License');
    const hasFAQSchema = pageContent.includes('FAQPage');
    const hasAutoAnalyze = componentContent.includes('autoAnalyzed');
    const hasPrefill = componentContent.includes('useState(ticker)');
    
    const allChecks = hasGenerateStaticParams && hasGenerateMetadata && hasISR && 
                     hasPricingSchema && hasFAQSchema && hasAutoAnalyze && hasPrefill;
    
    results.push({
      name: 'Risk Pages - Implementation',
      status: allChecks ? 'PASS' : 'FAIL',
      message: allChecks 
        ? 'Programmatic risk pages fully implemented with SEO and functionality'
        : 'Missing required risk page features',
      details: allChecks ? undefined : {
        hasGenerateStaticParams,
        hasGenerateMetadata,
        hasISR,
        hasPricingSchema,
        hasFAQSchema,
        hasAutoAnalyze,
        hasPrefill
      }
    });
  } catch (error: any) {
    results.push({
      name: 'Risk Pages - Implementation',
      status: 'FAIL',
      message: `Error: ${error.message}`
    });
  }
}

// Test 3: TechArticle Schema
function testTechArticleSchema() {
  try {
    const filePath = join(process.cwd(), 'app/blog/[slug]/page.tsx');
    if (!existsSync(filePath)) {
      results.push({
        name: 'TechArticle Schema - File Exists',
        status: 'FAIL',
        message: 'Blog page.tsx not found'
      });
      return;
    }
    
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for TechArticle implementation
    const hasTechArticle = content.includes("'TechArticle'");
    const hasTechnicalCheck = content.includes('isTechnical') || content.includes('pillar');
    const hasAboutField = content.includes('about:') || content.includes('Local-First Architecture');
    
    const allChecks = hasTechArticle && hasTechnicalCheck;
    
    results.push({
      name: 'TechArticle Schema - Blog Posts',
      status: allChecks ? 'PASS' : 'FAIL',
      message: allChecks 
        ? 'TechArticle schema correctly implemented for technical posts'
        : 'Missing TechArticle schema implementation',
      details: allChecks ? undefined : {
        hasTechArticle,
        hasTechnicalCheck,
        hasAboutField
      }
    });
  } catch (error: any) {
    results.push({
      name: 'TechArticle Schema - Blog Posts',
      status: 'FAIL',
      message: `Error: ${error.message}`
    });
  }
}

// Test 4: Sitemap Inclusion
function testSitemapInclusion() {
  try {
    const filePath = join(process.cwd(), 'app/sitemap-tools.ts');
    if (!existsSync(filePath)) {
      results.push({
        name: 'Sitemap - Tools File Exists',
        status: 'FAIL',
        message: 'sitemap-tools.ts not found'
      });
      return;
    }
    
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for risk pages in sitemap
    const hasRiskPages = content.includes('track-') && content.includes('-risk');
    const hasGetAllTickers = content.includes('getAllTickers');
    const hasTopTickers = content.includes('slice(0, 500)') || content.includes('slice(0,');
    
    const allChecks = hasRiskPages && hasGetAllTickers;
    
    results.push({
      name: 'Sitemap - Risk Pages Included',
      status: allChecks ? 'PASS' : 'WARN',
      message: allChecks 
        ? 'Risk pages included in sitemap generation'
        : 'Risk pages may not be included in sitemap (ISR will handle)',
      details: allChecks ? undefined : {
        hasRiskPages,
        hasGetAllTickers,
        hasTopTickers
      }
    });
  } catch (error: any) {
    results.push({
      name: 'Sitemap - Risk Pages Included',
      status: 'WARN',
      message: `Error: ${error.message}`
    });
  }
}

// Test 5: Risk Pages Pricing Schema
function testRiskPagesPricingSchema() {
  try {
    const filePath = join(process.cwd(), 'app/tools/track-[ticker]/page.tsx');
    if (!existsSync(filePath)) {
      results.push({
        name: 'Risk Pages - Pricing Schema',
        status: 'FAIL',
        message: 'Risk page file not found'
      });
      return;
    }
    
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for correct pricing schema
    const hasMultiOffer = content.includes('offers: [') && content.includes('Founders Club Lifetime License');
    const hasCorrectPrice = content.includes("price: '100.00'");
    const hasCorrectCurrency = content.includes("priceCurrency: 'GBP'");
    
    const allChecks = hasMultiOffer && hasCorrectPrice && hasCorrectCurrency;
    
    results.push({
      name: 'Risk Pages - Pricing Schema',
      status: allChecks ? 'PASS' : 'FAIL',
      message: allChecks 
        ? 'Risk pages have correct pricing schema'
        : 'Risk pages missing correct pricing schema',
      details: allChecks ? undefined : {
        hasMultiOffer,
        hasCorrectPrice,
        hasCorrectCurrency
      }
    });
  } catch (error: any) {
    results.push({
      name: 'Risk Pages - Pricing Schema',
      status: 'FAIL',
      message: `Error: ${error.message}`
    });
  }
}

// Test 6: Build Verification
function testBuildOutput() {
  try {
    // Check if build output exists
    const nextDir = join(process.cwd(), '.next');
    const publicDir = join(process.cwd(), 'public');
    
    const nextExists = existsSync(nextDir);
    const publicExists = existsSync(publicDir);
    
    // Check for sitemap files
    const sitemapExists = existsSync(join(publicDir, 'sitemap.xml'));
    const sitemapToolsExists = existsSync(join(publicDir, 'sitemap-tools-v3.xml'));
    
    results.push({
      name: 'Build Output - Verification',
      status: (nextExists && publicExists) ? 'PASS' : 'WARN',
      message: (nextExists && publicExists) 
        ? 'Build output directories exist'
        : 'Build output may not be complete',
      details: {
        nextExists,
        publicExists,
        sitemapExists,
        sitemapToolsExists
      }
    });
  } catch (error: any) {
    results.push({
      name: 'Build Output - Verification',
      status: 'WARN',
      message: `Error: ${error.message}`
    });
  }
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running Week 1 Deployment Tests...\n');
  
  testPricingSchemaFix();
  testRiskPages();
  testTechArticleSchema();
  testRiskPagesPricingSchema();
  testSitemapInclusion();
  testBuildOutput();
  
  // Print results
  console.log('📊 Test Results:\n');
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${index + 1}] ${result.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ${result.message}`);
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
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   ⚠️  Warnings: ${warnCount}`);
  console.log(`   Total: ${results.length}\n`);
  
  if (failCount > 0) {
    console.log('❌ DEPLOYMENT BLOCKED: Critical tests failed');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  DEPLOYMENT WARNING: Some tests have warnings');
    process.exit(0);
  } else {
    console.log('✅ ALL TESTS PASSED: Ready for deployment');
    process.exit(0);
  }
}

// Execute
runAllTests();






