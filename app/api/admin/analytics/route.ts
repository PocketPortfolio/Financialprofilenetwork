import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
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
  [SPONSOR_PRICE_IDS.featureVoterMonthly]: 'Developer Utility (Monthly)',
  [SPONSOR_PRICE_IDS.featureVoterAnnual]: 'Developer Utility (Annual)',
  [SPONSOR_PRICE_IDS.corporateSponsorMonthly]: 'Corporate Ecosystem (Monthly)',
  [SPONSOR_PRICE_IDS.corporateSponsorAnnual]: 'Corporate Ecosystem (Annual)',
  [SPONSOR_PRICE_IDS.foundersClub]: "Founder's Club",
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
  console.log('[Analytics API] 🚀 GET request received');
  try {
    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    
    console.log('[Analytics API] 📊 Fetching data with range:', range);
    
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
    console.log('[Analytics API] 💰 Fetching monetization data...');
    const monetization = await getMonetizationData(startDate);
    
    // Fetch tool usage from Firestore
    console.log('[Analytics API] 🛠️ Fetching tool usage data...');
    const toolUsage = await getToolUsageData(startDate);
    
    // Fetch SEO page data from Firestore
    console.log('[Analytics API] 📈 Fetching SEO page data...');
    const seoPages = await getSEOPageData(startDate);

    // Fetch NPM package data
    console.log('[Analytics API] 📦 Fetching NPM data...');
    const npmData = await getNPMData();

    // Fetch blog posts data
    console.log('[Analytics API] 📝 Fetching blog posts data...');
    const blogPosts = await getBlogPostsData();
    console.log('[Analytics API] ✅ Blog posts fetched:', blogPosts.total, 'total posts,', blogPosts.posts.filter((p: any) => p.category === 'research').length, 'research posts');

    // Fetch leads data
    console.log('[Analytics API] 👥 Fetching leads data...');
    const leadsData = await getLeadsData(startDate);

    return NextResponse.json({
      monetization,
      toolUsage,
      seoPages,
      npm: npmData,
      blogPosts,
      leads: leadsData,
      timeRange: range,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Analytics API] ❌ ERROR:', error);
    console.error('[Analytics API] ❌ Stack:', error.stack);
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
    const db = getDb();
    
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

    const csvDownloads = {
      total: 0,
      last7Days: 0,
      last24Hours: 0,
      byTicker: {} as Record<string, number>
    };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneDayAgoTimestamp = Timestamp.fromDate(oneDayAgo);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid tool usage record:', doc.id);
        return;
      }
      
      // Validate timestamp
      const eventTimestamp = data.timestamp as Timestamp;
      if (!eventTimestamp || !(eventTimestamp instanceof Timestamp)) {
        console.warn('Invalid timestamp in tool usage record:', doc.id);
        return;
      }
      
      // Validate toolType
      if (!data.toolType || typeof data.toolType !== 'string') {
        console.warn('Invalid toolType in tool usage record:', doc.id);
        return;
      }
      
      const isLast7Days = eventTimestamp >= sevenDaysAgoTimestamp;

      switch (data.toolType) {
        case 'tax_converter':
          taxConverter.total++;
          // Check for success: action is 'success' OR metadata has success flag
          if (data.action === 'success' || data.metadata?.success === true) {
            taxConverter.successful++;
          }
          if (data.metadata?.conversionPair && typeof data.metadata.conversionPair === 'string') {
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
        
        case 'ticker_csv':
          // Track CSV downloads - action should be 'download_csv'
          if (data.action === 'download_csv' || data.action?.includes('download')) {
            csvDownloads.total++;
            if (isLast7Days) csvDownloads.last7Days++;
            // Check if last 24 hours
            if (eventTimestamp >= oneDayAgoTimestamp) {
              csvDownloads.last24Hours++;
            }
            // Track by ticker
            if (data.metadata?.ticker && typeof data.metadata.ticker === 'string') {
              const ticker = data.metadata.ticker.toUpperCase();
              csvDownloads.byTicker[ticker] = (csvDownloads.byTicker[ticker] || 0) + 1;
            }
          }
          break;
        
        default:
          // Unknown tool type - log but don't break
          console.warn('Unknown tool type:', data.toolType, 'in record:', doc.id);
          break;
      }
    });

    return {
      taxConverter,
      googleSheets,
      advisorTool,
      csvDownloads
    };
  } catch (error) {
    console.error('Tool usage fetch error:', error);
    return {
      taxConverter: { total: 0, successful: 0, byPair: {}, last7Days: 0 },
      googleSheets: { total: 0, formulasGenerated: 0, copies: 0, last7Days: 0 },
      advisorTool: { total: 0, pdfsGenerated: 0, last7Days: 0 },
      csvDownloads: { total: 0, last7Days: 0, last24Hours: 0, byTicker: {} }
    };
  }
}

async function getSEOPageData(startDate: Date) {
  try {
    const db = getDb();
    
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
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid page view record:', doc.id);
        return;
      }
      
      // Validate path
      const path = data.path;
      if (!path || typeof path !== 'string' || path.trim() === '') {
        console.warn('Invalid path in page view record:', doc.id);
        return;
      }
      
      // Validate timestamp
      const timestamp = data.timestamp as Timestamp;
      if (!timestamp || !(timestamp instanceof Timestamp)) {
        console.warn('Invalid timestamp in page view record:', doc.id);
        return;
      }
      
      const sessionId = data.sessionId;
      const converted = data.converted === true;

      // Handle old records (no sessionId) - will deduplicate by path only
      if (!sessionId || sessionId === null || typeof sessionId !== 'string') {
        oldRecords.push({ 
          path, 
          converted, 
          timestamp
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
          timestamp
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

/**
 * Retry helper with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort errors (timeouts)
      if (error.name === 'AbortError' && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Retry on network errors
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Process packages in batches with concurrency limit
 */
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

async function getNPMData() {
  try {
    const packageStats = await processBatch(
      NPM_PACKAGES,
      async (packageName) => {
        try {
          let last7Days = 0;
          let monthlyDownloads = 0;
          let version = 'unknown';

          // Fetch last 7 days downloads with retry
          try {
            const weeklyResponse = await fetchWithRetry(
              `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`,
              {
                headers: { 'Accept': 'application/json' },
              },
              3,
              1000
            );

            if (weeklyResponse.ok) {
              const weeklyData = await weeklyResponse.json();
              last7Days = weeklyData.downloads || 0;
            } else {
              console.warn(`Failed to fetch weekly stats for ${packageName}: ${weeklyResponse.status}`);
            }
          } catch (error: any) {
            console.warn(`Error fetching weekly stats for ${packageName}:`, error.message);
          }

          // Fetch last 30 days (monthly) downloads with retry
          try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const monthlyResponse = await fetchWithRetry(
              `https://api.npmjs.org/downloads/range/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
              {
                headers: { 'Accept': 'application/json' },
              },
              3,
              1000
            );

            if (monthlyResponse.ok) {
              const monthlyData = await monthlyResponse.json();
              if (monthlyData.downloads && Array.isArray(monthlyData.downloads)) {
                monthlyDownloads = monthlyData.downloads.reduce((sum: number, day: any) => sum + (day.downloads || 0), 0);
              }
            } else {
              // Fallback: try the point endpoint
              try {
                const altResponse = await fetchWithRetry(
                  `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(packageName)}`,
                  {
                    headers: { 'Accept': 'application/json' },
                  },
                  2,
                  500
                );
                if (altResponse.ok) {
                  const altData = await altResponse.json();
                  monthlyDownloads = altData.downloads || 0;
                }
              } catch (altError) {
                console.warn(`Fallback monthly endpoint failed for ${packageName}`);
              }
            }
          } catch (error: any) {
            console.warn(`Error fetching monthly stats for ${packageName}:`, error.message);
          }

          // Fetch package metadata for version info with retry
          try {
            const metaResponse = await fetchWithRetry(
              `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
              {
                headers: { 'Accept': 'application/json' },
              },
              3,
              1000
            );

            if (metaResponse.ok) {
              const metaData = await metaResponse.json();
              version = metaData['dist-tags']?.latest || 'unknown';
            }
          } catch (error: any) {
            console.warn(`Error fetching metadata for ${packageName}:`, error.message);
          }

          return {
            name: packageName,
            version,
            monthlyDownloads,
            last7Days,
            error: false,
          };
        } catch (error: any) {
          console.error(`Error fetching ${packageName}:`, error.message || error);
          return {
            name: packageName,
            version: 'unknown',
            monthlyDownloads: 0,
            last7Days: 0,
            error: true,
          };
        }
      },
      5 // Process 5 packages concurrently
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
  console.log('[getBlogPostsData] 🚀 Starting blog posts data fetch');
  console.log('[getBlogPostsData] 📂 Current working directory:', process.cwd());
  try {
    // ✅ Load main calendar (deep dives)
    const mainCalendarPath = path.join(process.cwd(), 'content', 'blog-calendar.json');
    console.log('[getBlogPostsData] 📂 Loading main calendar from:', mainCalendarPath);
    console.log('[getBlogPostsData] 📂 Main calendar file exists?', fs.existsSync(mainCalendarPath));
    const mainCalendar = fs.existsSync(mainCalendarPath)
      ? JSON.parse(fs.readFileSync(mainCalendarPath, 'utf-8'))
      : [];
    console.log('[getBlogPostsData] ✅ Loaded', mainCalendar.length, 'main calendar posts');

    // ✅ Load "How to in Tech" calendar (daily posts)
    const howToCalendarPath = path.join(process.cwd(), 'content', 'how-to-tech-calendar.json');
    console.log('[getBlogPostsData] 📂 Loading how-to calendar from:', howToCalendarPath);
    console.log('[getBlogPostsData] 📂 How-to calendar file exists?', fs.existsSync(howToCalendarPath));
    const howToCalendar = fs.existsSync(howToCalendarPath)
      ? JSON.parse(fs.readFileSync(howToCalendarPath, 'utf-8'))
      : [];
    console.log('[getBlogPostsData] ✅ Loaded', howToCalendar.length, 'how-to calendar posts');

    // ✅ Load "Research" calendar (research posts)
    const researchCalendarPath = path.join(process.cwd(), 'content', 'research-calendar.json');
    console.log('[getBlogPostsData] 📂 Loading research calendar from:', researchCalendarPath);
    console.log('[getBlogPostsData] 📂 Research calendar file exists?', fs.existsSync(researchCalendarPath));
    let researchCalendar: any[] = [];
    if (fs.existsSync(researchCalendarPath)) {
      try {
        const researchCalendarContent = fs.readFileSync(researchCalendarPath, 'utf-8');
        researchCalendar = JSON.parse(researchCalendarContent);
        console.log(`[Analytics] ✅ Loaded ${researchCalendar.length} research posts from calendar`);
      } catch (error: any) {
        console.error('[Analytics] ❌ Error loading research calendar:', error.message);
        console.error('[Analytics] ❌ Error stack:', error.stack);
        researchCalendar = [];
      }
    } else {
      console.warn('[Analytics] ⚠️ Research calendar file not found:', researchCalendarPath);
      console.warn('[Analytics] ⚠️ Current working directory:', process.cwd());
    }

    // ✅ CRITICAL FIX: Filter out research posts from mainCalendar to prevent overwrites
    // Research posts should ONLY come from research-calendar.json
    const mainCalendarFiltered = mainCalendar.filter((p: any) => {
      // Exclude posts that are explicitly marked as research OR have research slugs
      const isResearch = p.category === 'research' || 
                        (p.slug && p.slug.startsWith('research-')) ||
                        (p.id && p.id.startsWith('research-'));
      return !isResearch;
    });
    // ✅ Merge calendars (mark posts with category and source)
    const calendar = [
      ...mainCalendarFiltered.map((p: any) => ({ ...p, category: p.category || 'deep-dive', _source: 'main' })),
      ...howToCalendar.map((p: any) => ({ ...p, category: 'how-to-in-tech', _source: 'how-to' })),
      ...researchCalendar.map((p: any) => ({ ...p, category: 'research', _source: 'research-calendar' }))
    ];
    console.log(`[Analytics] 📊 Total posts after merge: ${calendar.length} (main: ${mainCalendarFiltered.length}, how-to: ${howToCalendar.length}, research: ${researchCalendar.length})`);
    console.log(`[Analytics] 🔍 Filtered ${mainCalendar.length - mainCalendarFiltered.length} research posts from main calendar`);

    // ✅ Deduplicate posts by ID (for research) or slug (for others)
    // Research posts can have duplicate slugs (same topic, different dates), so use ID as key
    // Other posts use slug as key (unique per post)
    const postMap = new Map<string, any>();
    let duplicateCount = 0;
    let researchDuplicates = 0;
    let researchReplaced = 0;
    let researchSkipped = 0;
    
    // Helper function to get the deduplication key for a post
    const getPostKey = (post: any): string => {
      // Research posts use ID (unique, includes date) to handle duplicate slugs
      if (post.category === 'research' && post.id) {
        return post.id;
      }
      // Other posts use slug
      return post.slug || post.id || `unknown-${Math.random()}`;
    };
    
    // CRITICAL: Process research-calendar.json posts FIRST to ensure they always win
    // Separate research posts from research-calendar.json and process them first
    const researchCalendarPosts = calendar.filter((p: any) => p._source === 'research-calendar');
    const otherPosts = calendar.filter((p: any) => p._source !== 'research-calendar');
    
    // First pass: Add all research-calendar.json posts to map (they win by default)
    for (const post of researchCalendarPosts) {
      const key = getPostKey(post);
      const existing = postMap.get(key);
      if (!existing) {
        postMap.set(key, post);
      } else {
        // Shouldn't happen in first pass for research posts (IDs are unique), but handle it
        duplicateCount++;
        researchDuplicates++;
        postMap.set(key, post);
        researchReplaced++;
      }
    }
    
    // Second pass: Process other posts, but never replace research-calendar posts
    for (const post of otherPosts) {
      const key = getPostKey(post);
      const existing = postMap.get(key);
      if (!existing) {
        postMap.set(key, post);
      } else {
        duplicateCount++;
        // CRITICAL: Never replace research posts from research-calendar.json
        if (existing._source === 'research-calendar' && existing.category === 'research') {
          // Existing is from research-calendar.json - keep it, skip this one
          researchSkipped++;
          continue;
        } else if (post.category === 'research' && existing.category !== 'research') {
          // New post is research (but not from research-calendar), existing is not - prefer research
          postMap.set(key, post);
          researchReplaced++;
        } else if (post.category === 'research' && existing.category === 'research') {
          // Both are research, but existing is from research-calendar.json (already processed) - keep existing
          researchSkipped++;
          continue;
        } else {
          // Prefer published over pending
          if (post.status === 'published' && existing.status !== 'published') {
            postMap.set(key, post);
          } else if (post.status === existing.status) {
            // If same status, prefer the one with files or newer date
            const postSlug = post.slug || post.id;
            const existingSlug = existing.slug || existing.id;
            const postHasFiles = fs.existsSync(path.join(process.cwd(), 'content', 'posts', `${postSlug}.mdx`));
            const existingHasFiles = fs.existsSync(path.join(process.cwd(), 'content', 'posts', `${existingSlug}.mdx`));
            if (postHasFiles && !existingHasFiles) {
              postMap.set(key, post);
            } else if (post.date > existing.date) {
              postMap.set(key, post);
            }
          }
        }
      }
    }
    const deduplicatedCalendar = Array.from(postMap.values());
    
    // ✅ Comprehensive category and pillar tracking verification
    const categoryBreakdown = {
      'deep-dive': deduplicatedCalendar.filter((p: any) => p.category === 'deep-dive' || (!p.category && p._source === 'main')).length,
      'how-to-in-tech': deduplicatedCalendar.filter((p: any) => p.category === 'how-to-in-tech').length,
      'research': deduplicatedCalendar.filter((p: any) => p.category === 'research').length,
    };
    const pillarBreakdown = {
      'philosophy': deduplicatedCalendar.filter((p: any) => p.pillar === 'philosophy').length,
      'technical': deduplicatedCalendar.filter((p: any) => p.pillar === 'technical').length,
      'market': deduplicatedCalendar.filter((p: any) => p.pillar === 'market').length,
      'product': deduplicatedCalendar.filter((p: any) => p.pillar === 'product').length,
      'unknown': deduplicatedCalendar.filter((p: any) => !p.pillar).length,
    };
    const sourceBreakdown = {
      'main': deduplicatedCalendar.filter((p: any) => p._source === 'main').length,
      'how-to': deduplicatedCalendar.filter((p: any) => p._source === 'how-to').length,
      'research-calendar': deduplicatedCalendar.filter((p: any) => p._source === 'research-calendar').length,
    };
    
    console.log(`[Analytics] 🔄 After deduplication: ${deduplicatedCalendar.length} posts (removed ${duplicateCount} duplicates)`);
    console.log(`[Analytics] 📊 Category breakdown:`, categoryBreakdown);
    console.log(`[Analytics] 🏛️ Pillar breakdown:`, pillarBreakdown);
    console.log(`[Analytics] 📁 Source breakdown:`, sourceBreakdown);
    
    // Log research posts count
    const researchPostsCount = deduplicatedCalendar.filter((p: any) => p.category === 'research').length;
    console.log(`[Analytics] 🔬 Research posts in final calendar: ${researchPostsCount}`);
    
    // ✅ Log date range for diagnosis
    const researchPosts = deduplicatedCalendar.filter((p: any) => p.category === 'research');
    if (researchPosts.length > 0) {
      const dates = researchPosts.map((p: any) => p.date).sort();
      const earliestDate = dates[0];
      const latestDate = dates[dates.length - 1];
      const janCount = dates.filter((d: string) => d.startsWith('2026-01')).length;
      const augCount = dates.filter((d: string) => d.startsWith('2026-08')).length;
      console.log(`[Analytics] 📅 Research posts date range: ${earliestDate} to ${latestDate}`);
      console.log(`[Analytics] 📊 Research posts by month: Jan=${janCount}, Aug=${augCount}, Total=${dates.length}`);
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check which posts have actual files
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');
    
    // ✅ FIX: Use direct filesystem checks instead of array includes
    // This is more reliable and handles edge cases (case sensitivity, timing, exact path matching)
    const posts = deduplicatedCalendar.map((post: any) => {
      // Direct filesystem check - more reliable than array includes
      const mdxPath = path.join(postsDir, `${post.slug}.mdx`);
      const imagePath = path.join(imagesDir, `${post.slug}.png`);
      
      // ✅ ENHANCED: Add error handling and logging for production debugging
      let hasFiles = false;
      try {
        const mdxExists = fs.existsSync(mdxPath);
        const imageExists = fs.existsSync(imagePath);
        hasFiles = mdxExists && imageExists;
        
        // Log missing files for debugging (only for published research posts to reduce noise)
        if (!hasFiles && post.category === 'research' && post.status === 'published') {
          console.warn(`[Analytics] Research post files missing: ${post.slug}`, {
            mdxPath,
            imagePath,
            mdxExists,
            imageExists,
            postsDirExists: fs.existsSync(postsDir),
            imagesDirExists: fs.existsSync(imagesDir),
            cwd: process.cwd(),
          });
        }
      } catch (error: any) {
        console.error(`[Analytics] Error checking files for ${post.slug}:`, error.message);
        // If we can't check, assume files don't exist (safer default)
        hasFiles = false;
      }
      const postDate = new Date(post.date);
      const todayDate = new Date(today);
      
      // ✅ FIX: If files exist and date has passed, treat as published (auto-detect)
      // This handles cases where calendar wasn't updated but files were generated
      const effectiveStatus = hasFiles && postDate <= todayDate 
        ? 'published' 
        : post.status;
      
      // ✅ FIX: Only mark as overdue if status is pending AND no files exist
      const isOverdue = postDate < todayDate && effectiveStatus === 'pending';
      
      // Get published time from calendar (publishedAt) - this is the actual publish time
      // Fall back to file modification time if publishedAt is not available (actual publish time)
      let publishedTime: string | null = null;
      if (hasFiles && effectiveStatus === 'published') {
        // Prefer publishedAt from calendar (actual publish time)
        if (post.publishedAt) {
          publishedTime = post.publishedAt;
        } else {
          // ✅ FIX: Use file modification time instead of scheduled time (actual publish time)
          // We already know the file exists (hasFiles is true), so we can safely use mdxPath
          if (fs.existsSync(mdxPath)) {
            const mdxStats = fs.statSync(mdxPath);
            publishedTime = mdxStats.mtime.toISOString();
          } else {
            // Fallback to scheduled time only if file doesn't exist (shouldn't happen)
            const scheduledDateTime = post.scheduledTime 
              ? `${post.date}T${post.scheduledTime}:00Z`
              : `${post.date}T00:00:00Z`;
            publishedTime = scheduledDateTime;
          }
        }
      }
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        date: post.date,
        scheduledDate: post.date,
        scheduledTime: post.scheduledTime || null,
        status: effectiveStatus, // ✅ Use effective status instead of calendar status
        pillar: post.pillar,
        category: post.category ?? 'deep-dive', // ✅ Preserve category (research, how-to-in-tech, or deep-dive)
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
    // Note: Status counts now use effectiveStatus (auto-detected from file existence)
    const researchPostsInFinal = posts.filter((p: any) => p.category === 'research').length;

    const result = {
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
    return result;
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

async function getLeadsData(startDate: Date) {
  try {
    const { db } = await import('@/db/sales/client');
    const { leads } = await import('@/db/sales/schema');
    const { gte, desc, like, and } = await import('drizzle-orm');

    // ✅ FILTER: Only get leads from waitlist (exclude autonomous sales engine)
    const leadsList = await db
      .select({
        id: leads.id,
        email: leads.email,
        firstName: leads.firstName,
        lastName: leads.lastName,
        companyName: leads.companyName,
        status: leads.status,
        createdAt: leads.createdAt,
        dataSource: leads.dataSource,
      })
      .from(leads)
      .where(and(
        gte(leads.createdAt, startDate),
        like(leads.dataSource, 'waitlist_%')  // ✅ Only waitlist leads
      ))
      .orderBy(desc(leads.createdAt));

    const total = leadsList.length;
    const byStatus = leadsList.reduce((acc, lead) => {
      const status = lead.status || 'NEW';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ✅ Simplified: All leads are from waitlist now
    const bySource = {
      waitlist: total
    };

    // Last 7 days count
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7Days = leadsList.filter(lead => 
      lead.createdAt && new Date(lead.createdAt) >= sevenDaysAgo
    ).length;

    return {
      total,
      last7Days,
      byStatus,
      bySource,
      recent: leadsList.slice(0, 10), // First 10 leads (already sorted desc, so most recent)
    };
  } catch (error) {
    console.error('Leads data fetch error:', error);
    return {
      total: 0,
      last7Days: 0,
      byStatus: {},
      bySource: {},
      recent: [],
    };
  }
}

