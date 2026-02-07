import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import Stripe from 'stripe';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Lazy initialization for Firebase Admin
function getDb() {
  // Initialize Firebase Admin if not already done
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  }
  return getFirestore();
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

// Price IDs from /sponsor page
const SPONSOR_PRICE_IDS = {
  codeSupporterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER || 'price_1SeZh7D4sftWa1WtWsDwvQu5',
  featureVoterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER || 'price_1SeZhnD4sftWa1WtP5GdZ5cT',
  corporateSponsorMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE || 'price_1SeZigD4sftWa1WtTODsYpwE',
  codeSupporterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL || 'price_1SgPGYD4sftWa1WtLgEjFV93',
  featureVoterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL || 'price_1SgPHJD4sftWa1WtW03Tzald',
  corporateSponsorAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj',
  foundersClub: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1Sg3ykD4sftWa1Wtheztc1hR',
};

const VALID_PRICE_IDS = new Set([
  SPONSOR_PRICE_IDS.codeSupporterMonthly,
  SPONSOR_PRICE_IDS.codeSupporterAnnual,
  SPONSOR_PRICE_IDS.featureVoterMonthly,
  SPONSOR_PRICE_IDS.featureVoterAnnual,
  SPONSOR_PRICE_IDS.corporateSponsorMonthly,
  SPONSOR_PRICE_IDS.corporateSponsorAnnual,
  SPONSOR_PRICE_IDS.foundersClub,
]);

const PRICE_ID_TO_TIER: Record<string, string> = {
  [SPONSOR_PRICE_IDS.codeSupporterMonthly]: 'Code Supporter (Monthly)',
  [SPONSOR_PRICE_IDS.codeSupporterAnnual]: 'Code Supporter (Annual)',
  [SPONSOR_PRICE_IDS.featureVoterMonthly]: 'Developer Utility (Monthly)',
  [SPONSOR_PRICE_IDS.featureVoterAnnual]: 'Developer Utility (Annual)',
  [SPONSOR_PRICE_IDS.corporateSponsorMonthly]: 'Corporate Ecosystem (Monthly)',
  [SPONSOR_PRICE_IDS.corporateSponsorAnnual]: 'Corporate Ecosystem (Annual)',
};

// NPM Packages list
const NPM_PACKAGES = [
  '@pocket-portfolio/importer',
  '@pocket-portfolio/fidelity-csv-export',
  '@pocket-portfolio/coinbase-transaction-parser',
  '@pocket-portfolio/etoro-history-importer',
  '@pocket-portfolio/robinhood-csv-parser',
  '@pocket-portfolio/trading212-to-json',
  '@pocket-portfolio/koinly-csv-parser',
  '@pocket-portfolio/turbotax-csv-parser',
  '@pocket-portfolio/ghostfolio-csv-parser',
  '@pocket-portfolio/sharesight-csv-parser',
  '@pocket-portfolio/universal-csv-importer',
];

/**
 * Core Metrics Export API for Google Partners
 * 
 * Returns comprehensive metrics including:
 * - SEO Performance (page views, top pages, conversion rates)
 * - NPM Package Performance (downloads, active packages)
 * - Monetization (MRR, patrons, subscriptions)
 * - Tool Usage (conversions, engagement)
 * - Growth Metrics (trends, comparisons)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    const format = searchParams.get('format') || 'json'; // json or csv
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Fetch all metrics in parallel
    const [seoMetrics, npmMetrics, monetizationMetrics, toolUsageMetrics] = await Promise.all([
      getSEOMetrics(startDate),
      getNPMMetrics(),
      getMonetizationMetrics(startDate),
      getToolUsageMetrics(startDate),
    ]);

    // Compile comprehensive metrics report
    const metricsReport = {
      metadata: {
        reportGenerated: new Date().toISOString(),
        timeRange: range,
        periodStart: startDate.toISOString(),
        periodEnd: now.toISOString(),
        source: 'Pocket Portfolio Analytics',
        version: '1.0'
      },
      seo: seoMetrics,
      npm: npmMetrics,
      monetization: monetizationMetrics,
      toolUsage: toolUsageMetrics,
      summary: {
        totalPageViews: seoMetrics.totalViews,
        totalNPMDownloads: npmMetrics.totalMonthlyDownloads,
        totalMRR: monetizationMetrics.totalMRR,
        totalPatrons: monetizationMetrics.patronCount,
        activePackages: npmMetrics.packageCount,
        topPerformingPage: seoMetrics.topPages[0]?.path || 'N/A',
        conversionRate: seoMetrics.conversionRate,
      }
    };

    // Return in requested format
    if (format === 'csv') {
      return NextResponse.json({
        error: 'CSV format not yet implemented. Please use format=json'
      }, { status: 400 });
    }

    return NextResponse.json(metricsReport, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error('Metrics export error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to export metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * SEO Performance Metrics
 */
async function getSEOMetrics(startDate: Date) {
  try {
    const db = getDb();
    const startTimestamp = Timestamp.fromDate(startDate);
    const pageViewsRef = db.collection('pageViews');
    
    const snapshot = await pageViewsRef
      .where('timestamp', '>=', startTimestamp)
      .get();

    const pageViews: Record<string, number> = {};
    let totalViews = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const path = data.path || 'unknown';
      pageViews[path] = (pageViews[path] || 0) + 1;
      totalViews++;
    });

    // Get top pages
    const topPages = Object.entries(pageViews)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    // Calculate conversion rate (sponsor page views / total views)
    const sponsorViews = pageViews['/sponsor'] || 0;
    const conversionRate = totalViews > 0 ? (sponsorViews / totalViews) * 100 : 0;

    return {
      totalViews,
      uniquePages: Object.keys(pageViews).length,
      topPages,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      sponsorPageViews: sponsorViews,
      averageViewsPerPage: topPages.length > 0 
        ? parseFloat((totalViews / topPages.length).toFixed(2))
        : 0,
    };
  } catch (error) {
    console.error('SEO metrics error:', error);
    return {
      totalViews: 0,
      uniquePages: 0,
      topPages: [],
      conversionRate: 0,
      sponsorPageViews: 0,
      averageViewsPerPage: 0,
    };
  }
}

/**
 * NPM Package Performance Metrics
 */
async function getNPMMetrics() {
  try {
    const packageStats = await Promise.all(
      NPM_PACKAGES.map(async (packageName) => {
        try {
          // Fetch last 7 days
          const weeklyController = new AbortController();
          const weeklyTimeout = setTimeout(() => weeklyController.abort(), 10000);
          
          const weeklyResponse = await fetch(
            `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: weeklyController.signal,
            }
          );
          clearTimeout(weeklyTimeout);

          let last7Days = 0;
          if (weeklyResponse.ok) {
            const weeklyData = await weeklyResponse.json();
            last7Days = weeklyData.downloads || 0;
          }

          // Fetch last 30 days
          const monthlyController = new AbortController();
          const monthlyTimeout = setTimeout(() => monthlyController.abort(), 10000);
          
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          
          const monthlyResponse = await fetch(
            `https://api.npmjs.org/downloads/range/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: monthlyController.signal,
            }
          );
          clearTimeout(monthlyTimeout);

          let monthlyDownloads = 0;
          if (monthlyResponse.ok) {
            const monthlyData = await monthlyResponse.json();
            if (monthlyData.downloads && Array.isArray(monthlyData.downloads)) {
              monthlyDownloads = monthlyData.downloads.reduce(
                (sum: number, day: any) => sum + (day.downloads || 0),
                0
              );
            }
          }

          // Get package metadata
          const metaController = new AbortController();
          const metaTimeout = setTimeout(() => metaController.abort(), 10000);
          const metaResponse = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
            {
              headers: { 'Accept': 'application/json' },
              signal: metaController.signal,
            }
          );
          clearTimeout(metaTimeout);

          let version = 'unknown';
          if (metaResponse.ok) {
            const metaData = await metaResponse.json();
            version = metaData['dist-tags']?.latest || 'unknown';
          }

          return {
            name: packageName,
            version,
            monthlyDownloads,
            last7Days,
            error: false,
          };
        } catch (error) {
          return {
            name: packageName,
            version: 'unknown',
            monthlyDownloads: 0,
            last7Days: 0,
            error: true,
          };
        }
      })
    );

    const totalMonthlyDownloads = packageStats.reduce(
      (sum, pkg) => sum + pkg.monthlyDownloads,
      0
    );
    const totalLast7Days = packageStats.reduce(
      (sum, pkg) => sum + pkg.last7Days,
      0
    );

    return {
      packageCount: packageStats.length,
      totalMonthlyDownloads,
      totalLast7Days,
      averageDownloadsPerPackage: packageStats.length > 0
        ? parseFloat((totalMonthlyDownloads / packageStats.length).toFixed(2))
        : 0,
      packages: packageStats.map(pkg => ({
        name: pkg.name,
        version: pkg.version,
        monthlyDownloads: pkg.monthlyDownloads,
        weeklyDownloads: pkg.last7Days,
      })),
    };
  } catch (error) {
    console.error('NPM metrics error:', error);
    return {
      packageCount: 0,
      totalMonthlyDownloads: 0,
      totalLast7Days: 0,
      averageDownloadsPerPackage: 0,
      packages: [],
    };
  }
}

/**
 * Monetization Metrics
 */
async function getMonetizationMetrics(startDate: Date) {
  if (!stripe) {
    return {
      totalMRR: 0,
      patronCount: 0,
      subscriptions: [],
      foundersClub: {
        revenue: 0,
        count: 0,
      },
      note: 'Stripe not configured',
    };
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer', 'data.items.data.price']
    });

    let totalMRR = 0;
    const uniquePatrons = new Set<string>();
    const subscriptionBreakdown: Record<string, { count: number; revenue: number }> = {};

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const priceId = price.id;
        
        if (!VALID_PRICE_IDS.has(priceId)) {
          continue;
        }
        
        if (price.recurring && price.unit_amount) {
          const interval = price.recurring.interval as 'day' | 'week' | 'month' | 'year';
          const annualAmount = price.unit_amount / 100;
          
          let monthlyAmount = annualAmount;
          if (interval === 'year') {
            monthlyAmount = annualAmount / 12;
          } else if (interval === 'month') {
            monthlyAmount = annualAmount;
          } else {
            continue;
          }
          
          totalMRR += monthlyAmount;
          
          const tierName = PRICE_ID_TO_TIER[priceId] || 
                          price.metadata?.tierName || 
                          price.nickname || 
                          `$${annualAmount}/${interval}`;
          
          if (!subscriptionBreakdown[tierName]) {
            subscriptionBreakdown[tierName] = { count: 0, revenue: 0 };
          }
          subscriptionBreakdown[tierName].count += 1;
          subscriptionBreakdown[tierName].revenue += monthlyAmount;
        }
      }
      
      const hasValidItem = sub.items.data.some(item => {
        if (!VALID_PRICE_IDS.has(item.price.id) || !item.price.recurring) {
          return false;
        }
        const interval = item.price.recurring.interval as 'day' | 'week' | 'month' | 'year';
        return interval === 'month' || interval === 'year';
      });
      
      if (hasValidItem && sub.customer) {
        const customerId = typeof sub.customer === 'string' 
          ? sub.customer 
          : sub.customer.id;
        uniquePatrons.add(customerId);
      }
    }

    // Get Founder's Club purchases
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    let foundersClubTotal = 0;
    let foundersClubCount = 0;
    
    try {
      const checkoutSessions = await stripe.checkout.sessions.list({
        created: { gte: startTimestamp },
        limit: 100,
        expand: ['data.line_items']
      });
      
      for (const session of checkoutSessions.data) {
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          const lineItems = session.line_items?.data || [];
          
          for (const item of lineItems) {
            const priceId = item.price?.id;
            
            if (priceId === SPONSOR_PRICE_IDS.foundersClub && item.amount_total) {
              foundersClubTotal += item.amount_total / 100;
              foundersClubCount += 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Founder\'s Club data:', error);
    }

    return {
      totalMRR: parseFloat(totalMRR.toFixed(2)),
      patronCount: uniquePatrons.size,
      subscriptions: Object.entries(subscriptionBreakdown).map(([tier, data]) => ({
        tier,
        count: data.count,
        revenue: parseFloat(data.revenue.toFixed(2)),
      })),
      foundersClub: {
        revenue: parseFloat(foundersClubTotal.toFixed(2)),
        count: foundersClubCount,
      },
    };
  } catch (error) {
    console.error('Monetization metrics error:', error);
    return {
      totalMRR: 0,
      patronCount: 0,
      subscriptions: [],
      foundersClub: {
        revenue: 0,
        count: 0,
      },
      error: 'Failed to fetch monetization data',
    };
  }
}

/**
 * Tool Usage Metrics
 */
async function getToolUsageMetrics(startDate: Date) {
  try {
    const db = getDb();
    const startTimestamp = Timestamp.fromDate(startDate);
    
    // Tax Converter usage
    const taxConverterRef = db.collection('toolUsage');
    const taxSnapshot = await taxConverterRef
      .where('tool', '==', 'tax-converter')
      .where('timestamp', '>=', startTimestamp)
      .get();

    // Google Sheets usage
    const sheetsSnapshot = await taxConverterRef
      .where('tool', '==', 'google-sheets')
      .where('timestamp', '>=', startTimestamp)
      .get();

    // Advisor Tool usage
    const advisorSnapshot = await taxConverterRef
      .where('tool', '==', 'advisor')
      .where('timestamp', '>=', startTimestamp)
      .get();

    return {
      taxConverter: {
        total: taxSnapshot.size,
        successful: taxSnapshot.docs.filter(d => d.data().success).length,
      },
      googleSheets: {
        total: sheetsSnapshot.size,
        formulasGenerated: sheetsSnapshot.docs.filter(d => d.data().success).length,
      },
      advisorTool: {
        total: advisorSnapshot.size,
        pdfsGenerated: advisorSnapshot.docs.filter(d => d.data().success).length,
      },
      totalToolUsage: taxSnapshot.size + sheetsSnapshot.size + advisorSnapshot.size,
    };
  } catch (error) {
    console.error('Tool usage metrics error:', error);
    return {
      taxConverter: { total: 0, successful: 0 },
      googleSheets: { total: 0, formulasGenerated: 0 },
      advisorTool: { total: 0, pdfsGenerated: 0 },
      totalToolUsage: 0,
    };
  }
}

