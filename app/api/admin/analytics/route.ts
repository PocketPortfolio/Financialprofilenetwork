import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// Initialize Firebase Admin
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

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

const MONTHLY_GOAL = 200;

// Price IDs from /sponsor page - track all monetization tiers
const SPONSOR_PRICE_IDS = {
  // Monthly subscriptions
  codeSupporterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER || 'price_1SeZh7D4sftWa1WtWsDwvQu5',
  featureVoterMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER || 'price_1SeZhnD4sftWa1WtP5GdZ5cT',
  corporateSponsorMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE || 'price_1SeZigD4sftWa1WtTODsYpwE',
  // Annual subscriptions
  codeSupporterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL || 'price_1SgPGYD4sftWa1WtLgEjFV93',
  featureVoterAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL || 'price_1SgPHJD4sftWa1WtW03Tzald',
  corporateSponsorAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj',
  // One-time payments
  foundersClub: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB || 'price_1Sg3ykD4sftWa1Wtheztc1hR',
  oneTimeDonation: process.env.NEXT_PUBLIC_STRIPE_PRICE_DONATION || 'price_1SeZj0D4sftWa1WtXkkVps9a',
};

// Map Price IDs to tier names (for display)
const PRICE_ID_TO_TIER: Record<string, string> = {
  [SPONSOR_PRICE_IDS.codeSupporterMonthly]: 'Code Supporter (Monthly)',
  [SPONSOR_PRICE_IDS.codeSupporterAnnual]: 'Code Supporter (Annual)',
  [SPONSOR_PRICE_IDS.featureVoterMonthly]: 'Feature Voter (Monthly)',
  [SPONSOR_PRICE_IDS.featureVoterAnnual]: 'Feature Voter (Annual)',
  [SPONSOR_PRICE_IDS.corporateSponsorMonthly]: 'Corporate Sponsor (Monthly)',
  [SPONSOR_PRICE_IDS.corporateSponsorAnnual]: 'Corporate Sponsor (Annual)',
  [SPONSOR_PRICE_IDS.foundersClub]: "UK Founder's Club",
  [SPONSOR_PRICE_IDS.oneTimeDonation]: 'One-Time Donation',
};

// All valid Price IDs for filtering (includes all monetization options)
const VALID_PRICE_IDS = new Set([
  SPONSOR_PRICE_IDS.codeSupporterMonthly,
  SPONSOR_PRICE_IDS.codeSupporterAnnual,
  SPONSOR_PRICE_IDS.featureVoterMonthly,
  SPONSOR_PRICE_IDS.featureVoterAnnual,
  SPONSOR_PRICE_IDS.corporateSponsorMonthly,
  SPONSOR_PRICE_IDS.corporateSponsorAnnual,
  SPONSOR_PRICE_IDS.foundersClub,
  SPONSOR_PRICE_IDS.oneTimeDonation,
]);

// NPM packages to track
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
];

export async function GET(request: NextRequest) {
  try {
    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    
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

    // Fetch monetization data from Stripe
    const monetization = await getMonetizationData(startDate);
    
    // Fetch tool usage from Firestore
    const toolUsage = await getToolUsageData(startDate);
    
    // Fetch SEO page data from Firestore
    const seoPages = await getSEOPageData(startDate);

    // Fetch NPM package data
    const npmData = await getNPMData();

    // Fetch blog posts data
    const blogPosts = await getBlogPostsData();

    return NextResponse.json({
      monetization,
      toolUsage,
      seoPages,
      npm: npmData,
      blogPosts,
      timeRange: range,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getMonetizationData(startDate: Date) {
  if (!stripe) {
    return {
      totalMRR: 0,
      patronCount: 0,
      goal: MONTHLY_GOAL,
      subscriptions: [],
      foundersClub: {
        revenue: 0,
        count: 0
      },
      oneTimeDonations: 0 // Deprecated
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
        
        // Only track subscriptions from /sponsor page (filter by Price ID)
        if (!VALID_PRICE_IDS.has(priceId)) {
          continue; // Skip subscriptions not from /sponsor page
        }
        
        // Handle both monthly and annual subscriptions
        if (price.recurring && price.unit_amount) {
          const interval = price.recurring.interval as 'day' | 'week' | 'month' | 'year';
          const intervalCount = price.recurring.interval_count || 1;
          const annualAmount = price.unit_amount / 100;
          
          // Convert to monthly equivalent for MRR calculation
          let monthlyAmount = annualAmount;
          if (interval === 'year') {
            monthlyAmount = annualAmount / 12; // Annual subscription = MRR is 1/12th
          } else if (interval === 'month') {
            monthlyAmount = annualAmount; // Already monthly
          } else {
            // For other intervals, skip or handle as needed
            continue;
          }
          
          totalMRR += monthlyAmount;
          
          // Get tier name from Price ID mapping (most reliable)
          const tierName = PRICE_ID_TO_TIER[priceId] || 
                          price.metadata?.tierName || 
                          price.nickname || 
                          `$${annualAmount}/${interval}`;
          
          if (!subscriptionBreakdown[tierName]) {
            subscriptionBreakdown[tierName] = { count: 0, revenue: 0 };
          }
          subscriptionBreakdown[tierName].count += 1;
          subscriptionBreakdown[tierName].revenue += monthlyAmount; // Store MRR equivalent
        }
      }
      
      // Only count patrons if they have at least one valid subscription item (monthly or annual)
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

    // Get Founder's Club purchases - only from /sponsor page
    // Use Checkout Sessions as primary source (has price_id directly)
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
        // Only process completed one-time payments
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          // Get line items to check price ID
          const lineItems = session.line_items?.data || [];
          
          for (const item of lineItems) {
            const priceId = item.price?.id;
            
            // Only track Founder's Club (donations removed from sponsor page)
            if (priceId === SPONSOR_PRICE_IDS.foundersClub && item.amount_total) {
              foundersClubTotal += item.amount_total / 100;
              foundersClubCount += 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching checkout sessions for Founder\'s Club:', error);
      // Fallback: Check PaymentIntents by metadata
      try {
        const paymentIntents = await stripe.paymentIntents.list({
          created: { gte: startTimestamp },
          limit: 100
        });

        for (const pi of paymentIntents.data) {
          const tierName = pi.metadata?.tierName?.toLowerCase() || '';
          const isFoundersClub = tierName.includes('founder') || tierName.includes('founder\'s club');
          
          if (pi.status === 'succeeded' && pi.amount && isFoundersClub) {
            foundersClubTotal += pi.amount / 100;
            foundersClubCount += 1;
          }
        }
      } catch (fallbackError) {
        console.error('Error fetching payment intents for Founder\'s Club:', fallbackError);
      }
    }

    return {
      totalMRR: Math.round(totalMRR * 100) / 100,
      patronCount: uniquePatrons.size,
      goal: MONTHLY_GOAL,
      subscriptions: Object.entries(subscriptionBreakdown).map(([tier, data]) => ({
        tier,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100
      })),
      foundersClub: {
        revenue: Math.round(foundersClubTotal * 100) / 100,
        count: foundersClubCount
      },
      oneTimeDonations: 0 // Deprecated - kept for backwards compatibility
    };
  } catch (error) {
    console.error('Stripe fetch error:', error);
    return {
      totalMRR: 0,
      patronCount: 0,
      goal: MONTHLY_GOAL,
      subscriptions: [],
      foundersClub: {
        revenue: 0,
        count: 0
      },
      oneTimeDonations: 0 // Deprecated
    };
  }
}

async function getToolUsageData(startDate: Date) {
  try {
    const db = getFirestore();
    
    // Fetch tool usage events from Firestore
    const toolEventsRef = db.collection('toolUsage');
    const startTimestamp = Timestamp.fromDate(startDate);
    
    const snapshot = await toolEventsRef
      .where('timestamp', '>=', startTimestamp)
      .get();

    const taxConverter = {
      total: 0,
      successful: 0,
      byPair: {} as Record<string, number>,
      last7Days: 0
    };
    
    const googleSheets = {
      total: 0,
      formulasGenerated: 0,
      copies: 0,
      last7Days: 0
    };
    
    const advisorTool = {
      total: 0,
      pdfsGenerated: 0,
      last7Days: 0
    };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const eventTimestamp = data.timestamp as Timestamp;
      const isLast7Days = eventTimestamp && eventTimestamp >= sevenDaysAgoTimestamp;

      switch (data.toolType) {
        case 'tax_converter':
          taxConverter.total++;
          // Check for success: action is 'success' OR metadata has success flag
          if (data.action === 'success' || data.metadata?.success === true) {
            taxConverter.successful++;
          }
          if (data.metadata?.conversionPair) {
            const pair = data.metadata.conversionPair;
            taxConverter.byPair[pair] = (taxConverter.byPair[pair] || 0) + 1;
          }
          if (isLast7Days) taxConverter.last7Days++;
          break;
        
        case 'google_sheets':
          googleSheets.total++;
          if (data.action === 'formula_generate') googleSheets.formulasGenerated++;
          if (data.action === 'copy') googleSheets.copies++;
          if (isLast7Days) googleSheets.last7Days++;
          break;
        
        case 'advisor_tool':
          advisorTool.total++;
          // Check for success: action is 'success' OR 'download_pdf' (both indicate successful PDF generation)
          if (data.action === 'success' || data.action === 'download_pdf' || data.metadata?.success === true) {
            advisorTool.pdfsGenerated++;
          }
          if (isLast7Days) advisorTool.last7Days++;
          break;
      }
    });

    return {
      taxConverter,
      googleSheets,
      advisorTool
    };
  } catch (error) {
    console.error('Tool usage fetch error:', error);
    return {
      taxConverter: { total: 0, successful: 0, byPair: {}, last7Days: 0 },
      googleSheets: { total: 0, formulasGenerated: 0, copies: 0, last7Days: 0 },
      advisorTool: { total: 0, pdfsGenerated: 0, last7Days: 0 }
    };
  }
}

async function getSEOPageData(startDate: Date) {
  try {
    const db = getFirestore();
    
    // Fetch page view events
    const pageViewsRef = db.collection('pageViews');
    const startTimestamp = Timestamp.fromDate(startDate);
    
    const snapshot = await pageViewsRef
      .where('timestamp', '>=', startTimestamp)
      .get();

    // Separate old records (without sessionId) from new records (with sessionId)
    // Old records need different deduplication logic since we can't use sessionId
    const oldRecords: Array<{ path: string; converted: boolean; timestamp: Timestamp }> = [];
    const newRecords = new Map<string, {
      path: string;
      sessionId: string;
      converted: boolean;
      timestamp: Timestamp;
    }>();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const path = data.path || 'unknown';
      const sessionId = data.sessionId;
      const timestamp = data.timestamp as Timestamp;
      const converted = data.converted === true;

      // Handle old records (no sessionId) - will deduplicate by path only
      if (!sessionId || sessionId === null) {
        oldRecords.push({ 
          path, 
          converted, 
          timestamp: timestamp || Timestamp.now() 
        });
        return;
      }

      // Handle new records (with sessionId) - deduplicate by sessionId + path
      const uniqueKey = `${sessionId}_${path}`;
      const existing = newRecords.get(uniqueKey);
      
      if (!existing) {
        newRecords.set(uniqueKey, { 
          path, 
          sessionId, 
          converted, 
          timestamp: timestamp || Timestamp.now() 
        });
      } else {
        // Update if this record is newer OR if it's converted and existing isn't
        const existingTime = existing.timestamp?.toMillis() || 0;
        const newTime = timestamp?.toMillis() || 0;
        
        if (newTime > existingTime || (converted && !existing.converted)) {
          newRecords.set(uniqueKey, { 
            path, 
            sessionId, 
            converted, 
            timestamp: timestamp || existing.timestamp 
          });
        }
      }
    });

    // Deduplicate old records by path (keep most recent, prefer converted)
    // Since we can't use sessionId, we group by path and take the most recent/accurate record
    const oldRecordsByPath = new Map<string, { converted: boolean; timestamp: Timestamp }>();
    oldRecords.forEach(record => {
      const existing = oldRecordsByPath.get(record.path);
      if (!existing) {
        oldRecordsByPath.set(record.path, { 
          converted: record.converted, 
          timestamp: record.timestamp 
        });
      } else {
        const existingTime = existing.timestamp?.toMillis() || 0;
        const newTime = record.timestamp?.toMillis() || 0;
        // Prefer newer records, or converted records if timestamps are equal
        if (newTime > existingTime || (record.converted && !existing.converted && newTime >= existingTime)) {
          oldRecordsByPath.set(record.path, { 
            converted: record.converted, 
            timestamp: record.timestamp 
          });
        }
      }
    });

    // Count views and conversions
    const pageViews: Record<string, number> = {};
    let totalViews = 0;
    let signups = 0;

    // Count new records (accurate - deduplicated by sessionId + path)
    newRecords.forEach(record => {
      pageViews[record.path] = (pageViews[record.path] || 0) + 1;
      totalViews++;
      if (record.converted) {
        signups++;
      }
    });

    // Count old records (less accurate, but deduplicated by path to avoid massive inflation)
    oldRecordsByPath.forEach((record, path) => {
      pageViews[path] = (pageViews[path] || 0) + 1;
      totalViews++;
      if (record.converted) {
        signups++;
      }
    });

    const topPages = Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // Calculate true conversion rate: (Signups from SEO pages) / (Total unique SEO page views)
    const conversionRate = totalViews > 0 
      ? (signups / totalViews) * 100 
      : 0;

    // Debug logging to help verify the calculation
    console.log(`[SEO Analytics] Range: ${startDate.toISOString()} to now`);
    console.log(`[SEO Analytics] New records (with sessionId): ${newRecords.size}`);
    console.log(`[SEO Analytics] Old records (no sessionId, deduplicated by path): ${oldRecordsByPath.size}`);
    console.log(`[SEO Analytics] Total unique views: ${totalViews}, Signups: ${signups}, Rate: ${conversionRate.toFixed(2)}%`);

    return {
      totalViews,
      topPages,
      conversionRate
    };
  } catch (error) {
    console.error('SEO page data fetch error:', error);
    return {
      totalViews: 0,
      topPages: [],
      conversionRate: 0
    };
  }
}

async function getNPMData() {
  try {
    const packageStats = await Promise.all(
      NPM_PACKAGES.map(async (packageName) => {
        try {
          // Use official NPM registry API for download stats
          // Fetch last week downloads
          // Create timeout controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // Fetch last 7 days downloads
          const weeklyResponse = await fetch(
            `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`,
            {
              headers: {
                'Accept': 'application/json',
              },
              signal: controller.signal,
            }
          );
          
          clearTimeout(timeoutId);

          let last7Days = 0;
          let monthlyDownloads = 0;

          if (weeklyResponse.ok) {
            const weeklyData = await weeklyResponse.json();
            last7Days = weeklyData.downloads || 0;
          } else {
            console.warn(`Failed to fetch weekly stats for ${packageName}: ${weeklyResponse.status}`);
          }

          // Fetch last 30 days (monthly) downloads using date range
          const monthlyController = new AbortController();
          const monthlyTimeoutId = setTimeout(() => monthlyController.abort(), 10000);
          
          // Calculate date range for last 30 days
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
          
          const monthlyResponse = await fetch(
            `https://api.npmjs.org/downloads/range/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
            {
              headers: {
                'Accept': 'application/json',
              },
              signal: monthlyController.signal,
            }
          );
          
          clearTimeout(monthlyTimeoutId);

          if (monthlyResponse.ok) {
            const monthlyData = await monthlyResponse.json();
            // The range endpoint returns an array of daily downloads
            // Sum them up to get total monthly downloads
            if (monthlyData.downloads && Array.isArray(monthlyData.downloads)) {
              monthlyDownloads = monthlyData.downloads.reduce((sum: number, day: any) => sum + (day.downloads || 0), 0);
            } else {
              monthlyDownloads = 0;
            }
            console.log(`✅ Monthly stats for ${packageName}: ${monthlyDownloads} downloads (from ${startDateStr} to ${endDateStr})`);
          } else {
            const errorText = await monthlyResponse.text().catch(() => 'Unable to read error');
            console.warn(`❌ Failed to fetch monthly stats for ${packageName}: ${monthlyResponse.status} - ${errorText}`);
            // Fallback: try the point endpoint (though it may not exist)
            try {
              const altController = new AbortController();
              const altTimeoutId = setTimeout(() => altController.abort(), 5000);
              const altResponse = await fetch(
                `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(packageName)}`,
                {
                  headers: { 'Accept': 'application/json' },
                  signal: altController.signal,
                }
              );
              clearTimeout(altTimeoutId);
              if (altResponse.ok) {
                const altData = await altResponse.json();
                monthlyDownloads = altData.downloads || 0;
                console.log(`✅ Monthly stats (fallback endpoint) for ${packageName}: ${monthlyDownloads} downloads`);
              }
            } catch (altError) {
              console.warn(`❌ Fallback monthly endpoint also failed for ${packageName}`);
            }
          }

          // Fetch package metadata for version info
          const metaController = new AbortController();
          const metaTimeoutId = setTimeout(() => metaController.abort(), 10000);
          
          const metaResponse = await fetch(
            `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
            {
              headers: {
                'Accept': 'application/json',
              },
              signal: metaController.signal,
            }
          );
          
          clearTimeout(metaTimeoutId);

          let version = 'unknown';
          if (metaResponse.ok) {
            const metaData = await metaResponse.json();
            version = metaData['dist-tags']?.latest || 'unknown';
          } else {
            console.warn(`Failed to fetch metadata for ${packageName}: ${metaResponse.status}`);
          }

          return {
            name: packageName,
            version,
            monthlyDownloads,
            last7Days,
            error: false,
          };
        } catch (error: any) {
          // Handle timeout and other errors
          if (error.name === 'AbortError') {
            console.error(`Timeout fetching ${packageName}`);
          } else {
            console.error(`Error fetching ${packageName}:`, error.message || error);
          }
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

    // Calculate totals
    const totalMonthlyDownloads = packageStats.reduce(
      (sum, pkg) => sum + pkg.monthlyDownloads,
      0
    );
    const totalLast7Days = packageStats.reduce(
      (sum, pkg) => sum + pkg.last7Days,
      0
    );

    // Log totals for debugging
    console.log('📊 NPM Stats Summary:', {
      totalMonthlyDownloads,
      totalLast7Days,
      packageCount: packageStats.length,
      packagesWithMonthlyData: packageStats.filter(p => p.monthlyDownloads > 0).length,
      packagesWithWeeklyData: packageStats.filter(p => p.last7Days > 0).length,
      packageBreakdown: packageStats.map(p => ({
        name: p.name,
        monthly: p.monthlyDownloads,
        weekly: p.last7Days
      }))
    });

    return {
      packages: packageStats,
      totalMonthlyDownloads,
      totalLast7Days,
      packageCount: packageStats.length,
    };
  } catch (error) {
    console.error('NPM data fetch error:', error);
    return {
      packages: [],
      totalMonthlyDownloads: 0,
      totalLast7Days: 0,
      packageCount: 0,
    };
  }
}

async function getBlogPostsData() {
  try {
    const calendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
    
    if (!fs.existsSync(calendarPath)) {
      return {
        total: 0,
        published: 0,
        pending: 0,
        overdue: 0,
        failed: 0,
        posts: []
      };
    }

    const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    
    // Check which posts have actual files
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');
    const existingPosts = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).map(f => f.replace('.mdx', '')) : [];
    const existingImages = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).map(f => f.replace('.png', '')) : [];
    
    const posts = calendar.map((post: any) => {
      const hasFiles = existingPosts.includes(post.slug) && existingImages.includes(post.slug);
      const postDate = new Date(post.date);
      const todayDate = new Date(today);
      const isOverdue = postDate < todayDate && post.status === 'pending';
      
      // Get published time from file if it exists
      let publishedTime: string | null = null;
      if (hasFiles && post.status === 'published') {
        const mdxPath = path.join(postsDir, `${post.slug}.mdx`);
        if (fs.existsSync(mdxPath)) {
          const stats = fs.statSync(mdxPath);
          publishedTime = stats.mtime.toISOString();
        }
      }
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        date: post.date,
        scheduledDate: post.date,
        status: post.status,
        pillar: post.pillar,
        isOverdue,
        hasFiles,
        publishedTime,
        daysOverdue: isOverdue ? Math.floor((todayDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      };
    });

    const published = posts.filter((p: any) => p.status === 'published').length;
    const pending = posts.filter((p: any) => p.status === 'pending').length;
    const overdue = posts.filter((p: any) => p.isOverdue).length;
    const failed = posts.filter((p: any) => p.status === 'failed').length;

    return {
      total: posts.length,
      published,
      pending,
      overdue,
      failed,
      posts: posts.sort((a: any, b: any) => {
        // Sort by date, then by status (overdue first)
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return 0;
      })
    };
  } catch (error: any) {
    console.error('Error reading blog calendar:', error);
    return {
      total: 0,
      published: 0,
      pending: 0,
      overdue: 0,
      failed: 0,
      posts: [],
      error: error.message
    };
  }
}

