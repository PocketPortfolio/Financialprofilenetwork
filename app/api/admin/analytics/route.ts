import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getArchitectureChallengeLeadsAnalytics } from '@/lib/challenge/challenge-leads-firestore';
import { getViralMomentBlastMetrics } from '@/lib/marketing/viral-moment-blast-stats';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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
  // Founders Club subscription (monthly £12, annual £100)
  foundersClubMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY || 'price_1TAWC9D4sftWa1WtO7Nwk7Vd',
  foundersClubAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL || 'price_1TAWCxD4sftWa1WtEZtg2Oli',
  // Legacy one-time (for backward compatibility with old checkout sessions)
  foundersClubLegacy: 'price_1Sg3ykD4sftWa1Wtheztc1hR',
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
  [SPONSOR_PRICE_IDS.foundersClubMonthly]: "Founder's Club (Monthly)",
  [SPONSOR_PRICE_IDS.foundersClubAnnual]: "Founder's Club (Annual)",
  [SPONSOR_PRICE_IDS.foundersClubLegacy]: "Founder's Club (Legacy one-time)",
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
  SPONSOR_PRICE_IDS.foundersClubMonthly,
  SPONSOR_PRICE_IDS.foundersClubAnnual,
  SPONSOR_PRICE_IDS.foundersClubLegacy,
  SPONSOR_PRICE_IDS.oneTimeDonation,
]);

const FOUNDERS_CLUB_PRICE_IDS = new Set([
  SPONSOR_PRICE_IDS.foundersClubMonthly,
  SPONSOR_PRICE_IDS.foundersClubAnnual,
  SPONSOR_PRICE_IDS.foundersClubLegacy,
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
  '@pocket-portfolio/universal-csv-importer',
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

    // Fetch app signups (Google) from Firebase Auth (isolated so failure doesn't 500 the whole dashboard)
    let googleSignups: Awaited<ReturnType<typeof getGoogleSignupsData>>;
    try {
      console.log('[Analytics API] 🔐 Fetching Google signups...');
      googleSignups = await getGoogleSignupsData(startDate);
    } catch (e: any) {
      console.error('[Analytics API] 🔐 Google signups failed:', e?.message);
      googleSignups = { total: 0, last7Days: 0, cohortSinceOct2025: 0, signups: [], error: e?.message };
    }

    // Fetch referral events (clicks + conversions)
    let referral: Awaited<ReturnType<typeof getReferralData>>;
    try {
      console.log('[Analytics API] 🔗 Fetching referral data...');
      referral = await getReferralData(startDate);
    } catch (e: any) {
      console.error('[Analytics API] 🔗 Referral data failed:', e?.message);
      referral = {
        clicks: 0,
        conversions: 0,
        last7DaysClicks: 0,
        last7DaysConversions: 0,
        bySource: {},
        byCampaign: {},
      };
    }

    let viralMomentEmailBlast: {
      totalSentAllTime: number;
      emailsSentInSelectedRange: number;
      emailsSentLast7Days: number;
      viralMomentV1ConversionsInRange: number;
      loopVelocityPer100Emails: number | null;
      lastCronRunAt: string | null;
      lastCronRunSent: number;
      lastCronRunEvaluated: number;
      lastCronRunSuppressed: number;
    };
    try {
      const db = getDb();
      const m = await getViralMomentBlastMetrics(db, startDate);
      const viralConv = referral.byCampaign?.['viral_moment_v1']?.conversions ?? 0;
      const emails = m.emailsSentInSelectedRange;
      viralMomentEmailBlast = {
        ...m,
        viralMomentV1ConversionsInRange: viralConv,
        loopVelocityPer100Emails:
          emails > 0 ? Math.round((viralConv / emails) * 10_000) / 100 : null,
      };
    } catch (e: any) {
      console.error('[Analytics API] 📧 Viral blast metrics failed:', e?.message);
      viralMomentEmailBlast = {
        totalSentAllTime: 0,
        emailsSentInSelectedRange: 0,
        emailsSentLast7Days: 0,
        viralMomentV1ConversionsInRange: 0,
        loopVelocityPer100Emails: null,
        lastCronRunAt: null,
        lastCronRunSent: 0,
        lastCronRunEvaluated: 0,
        lastCronRunSuppressed: 0,
      };
    }

    // Fetch conversion funnel (lead_magnet_clicked, mobile_setup_requested, quota_upgrade_initiated)
    let conversionFunnel: Awaited<ReturnType<typeof getConversionFunnelData>>;
    try {
      console.log('[Analytics API] 📊 Fetching conversion funnel data...');
      conversionFunnel = await getConversionFunnelData(startDate);
    } catch (e: any) {
      console.error('[Analytics API] 📊 Conversion funnel failed:', e?.message);
      conversionFunnel = {
        leadMagnetClicked: { total: 0, last7Days: 0, byTicker: {} },
        mobileSetupRequested: { total: 0, last7Days: 0 },
        quotaUpgradeInitiated: { total: 0, last7Days: 0 },
      };
    }

    let monetizationFunnelBoard: Awaited<ReturnType<typeof getMonetizationFunnelBoardData>>;
    try {
      monetizationFunnelBoard = await getMonetizationFunnelBoardData(startDate, seoPages.totalViews);
    } catch (e: any) {
      console.error('[Analytics API] 📈 Monetization funnel board failed:', e?.message);
      monetizationFunnelBoard = {
        organicTraffic: seoPages.totalViews,
        paywallImpressions: 0,
        checkoutStarts: 0,
        paidFoundersActive: 0,
        paywallToCheckoutPercent: null,
        checkoutToPaidDropoffPercent: null,
      };
    }

    // Architecture Challenge (/challenge) — CTO funnel emails (Firestore)
    let architectureChallengeLeads: Awaited<ReturnType<typeof getArchitectureChallengeLeadsAnalytics>>;
    try {
      console.log('[Analytics API] 🎯 Fetching architecture challenge leads...');
      architectureChallengeLeads = await getArchitectureChallengeLeadsAnalytics(startDate);
    } catch (e: any) {
      console.error('[Analytics API] 🎯 Architecture challenge leads failed:', e?.message);
      architectureChallengeLeads = {
        total: 0,
        last7Days: 0,
        signups: [],
        error: e?.message,
      };
    }

    return NextResponse.json({
      monetization,
      toolUsage,
      seoPages,
      npm: npmData,
      blogPosts,
      leads: leadsData,
      googleSignups,
      referral,
      viralMomentEmailBlast,
      conversionFunnel,
      monetizationFunnelBoard,
      architectureChallengeLeads,
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
        count: 0,
        cashCollected: 0
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

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    let totalMRR = 0;
    const uniquePatrons = new Set<string>();
    const subscriptionBreakdown: Record<string, { count: number; revenue: number }> = {};
    let foundersClubMRR = 0;
    const foundersClubSubscriberIds = new Set<string>();
    let foundersClubCashCollected = 0;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const priceId = price.id;
        
        // Only track subscriptions from /sponsor page (filter by Price ID)
        if (!VALID_PRICE_IDS.has(priceId)) {
          continue;
        }
        
        // Handle both monthly and annual subscriptions
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
          
          if (FOUNDERS_CLUB_PRICE_IDS.has(priceId)) {
            foundersClubMRR += monthlyAmount;
            const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
            if (customerId) foundersClubSubscriberIds.add(customerId);
          }
          
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
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        uniquePatrons.add(customerId);
      }
    }

    // Founders Club: legacy one-time checkout sessions (cash collected)
    let foundersClubLegacyCount = 0;
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
            if (priceId === SPONSOR_PRICE_IDS.foundersClubLegacy && item.amount_total) {
              foundersClubCashCollected += item.amount_total / 100;
              foundersClubLegacyCount += 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching checkout sessions for Founder\'s Club:', error);
    }

    // Founders Club: cash collected from subscription invoices in period (for runway)
    try {
      const invoices = await stripe.invoices.list({
        created: { gte: startTimestamp },
        status: 'paid',
        limit: 100
      });
      for (const inv of invoices.data) {
        const subRef = (inv as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
        const subId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subId) continue;
        const sub = await stripe.subscriptions.retrieve(subId, { expand: ['items.data.price'] });
        const hasFC = sub.items.data.some((item: { price: Stripe.Price }) => FOUNDERS_CLUB_PRICE_IDS.has(item.price.id));
        if (hasFC && inv.amount_paid) {
          foundersClubCashCollected += inv.amount_paid / 100;
        }
      }
    } catch (error) {
      console.error('Error fetching invoices for Founder\'s Club cash:', error);
    }

    const foundersClubCount = foundersClubSubscriberIds.size + foundersClubLegacyCount;

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
        revenue: Math.round(foundersClubMRR * 100) / 100,
        count: foundersClubCount,
        cashCollected: Math.round(foundersClubCashCollected * 100) / 100
      },
      oneTimeDonations: 0
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
        count: 0,
        cashCollected: 0
      },
      oneTimeDonations: 0
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

    const pocketAnalyst = {
      questions: 0,
      errors: 0,
      quotaExceeded: 0,
      uniqueUsers: new Set<string>(),
      last7Days: 0,
      byTier: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
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

        case 'pocket_analyst': {
          const uid = data.metadata?.uid;
          if (typeof uid === 'string') pocketAnalyst.uniqueUsers.add(uid);
          const tier = typeof data.metadata?.tier === 'string' ? data.metadata.tier : 'unknown';
          const provider = typeof data.metadata?.provider === 'string' ? data.metadata.provider : 'unknown';
          if (data.action === 'question') {
            pocketAnalyst.questions++;
            if (isLast7Days) pocketAnalyst.last7Days++;
            pocketAnalyst.byTier[tier] = (pocketAnalyst.byTier[tier] || 0) + 1;
            pocketAnalyst.byProvider[provider] = (pocketAnalyst.byProvider[provider] || 0) + 1;
          } else if (data.action === 'error') {
            pocketAnalyst.errors++;
            if (data.metadata?.errorCode === 'quota_exceeded') pocketAnalyst.quotaExceeded++;
          }
          break;
        }
        
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
      csvDownloads,
      pocketAnalyst: {
        questions: pocketAnalyst.questions,
        errors: pocketAnalyst.errors,
        quotaExceeded: pocketAnalyst.quotaExceeded,
        uniqueUsers: pocketAnalyst.uniqueUsers.size,
        last7Days: pocketAnalyst.last7Days,
        byTier: pocketAnalyst.byTier,
        byProvider: pocketAnalyst.byProvider,
      },
    };
  } catch (error) {
    console.error('Tool usage fetch error:', error);
    return {
      taxConverter: { total: 0, successful: 0, byPair: {}, last7Days: 0 },
      googleSheets: { total: 0, formulasGenerated: 0, copies: 0, last7Days: 0 },
      advisorTool: { total: 0, pdfsGenerated: 0, last7Days: 0 },
      csvDownloads: { total: 0, last7Days: 0, last24Hours: 0, byTicker: {} },
      pocketAnalyst: { questions: 0, errors: 0, quotaExceeded: 0, uniqueUsers: 0, last7Days: 0, byTier: {}, byProvider: {} },
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

async function getReferralData(startDate: Date) {
  try {
    const db = getDb();
    const ref = db.collection('referralEvents');
    const startTimestamp = Timestamp.fromDate(startDate);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snapshot = await ref
      .where('timestamp', '>=', startTimestamp)
      .get();

    let clicks = 0;
    let conversions = 0;
    let last7DaysClicks = 0;
    let last7DaysConversions = 0;
    const bySource: Record<string, { clicks: number; conversions: number }> = {};
    const byCampaign: Record<
      string,
      { clicks: number; conversions: number; last7DaysClicks: number; last7DaysConversions: number }
    > = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const action = data?.action;
      const source = (data?.source as string) || 'unknown';
      const campaignRaw = data?.campaign as string | undefined;
      const campaign =
        campaignRaw && String(campaignRaw).trim()
          ? String(campaignRaw).trim()
          : '_uncampaigned';
      const ts = data?.timestamp as Timestamp;
      const isLast7Days = ts && ts.toMillis ? ts.toMillis() >= sevenDaysAgo.getTime() : false;

      if (!bySource[source]) bySource[source] = { clicks: 0, conversions: 0 };
      if (!byCampaign[campaign]) {
        byCampaign[campaign] = {
          clicks: 0,
          conversions: 0,
          last7DaysClicks: 0,
          last7DaysConversions: 0,
        };
      }

      if (action === 'click') {
        clicks++;
        bySource[source].clicks++;
        byCampaign[campaign].clicks++;
        if (isLast7Days) {
          last7DaysClicks++;
          byCampaign[campaign].last7DaysClicks++;
        }
      } else if (action === 'conversion') {
        conversions++;
        bySource[source].conversions++;
        byCampaign[campaign].conversions++;
        if (isLast7Days) {
          last7DaysConversions++;
          byCampaign[campaign].last7DaysConversions++;
        }
      }
    });

    return {
      clicks,
      conversions,
      last7DaysClicks,
      last7DaysConversions,
      bySource,
      byCampaign,
    };
  } catch (error) {
    console.error('Referral data fetch error:', error);
    return {
      clicks: 0,
      conversions: 0,
      last7DaysClicks: 0,
      last7DaysConversions: 0,
      bySource: {},
      byCampaign: {},
    };
  }
}

async function getMonetizationFunnelBoardData(startDate: Date, organicTraffic: number) {
  try {
    const db = getDb();
    const startTimestamp = Timestamp.fromDate(startDate);
    const snap = await db.collection('monetizationFunnelEvents').where('timestamp', '>=', startTimestamp).get();
    let paywallImpressions = 0;
    let checkoutStarts = 0;
    snap.docs.forEach((doc) => {
      const t = doc.data()?.eventType;
      if (t === 'paywall_impression') paywallImpressions++;
      else if (t === 'checkout_start') checkoutStarts++;
    });
    let paidFoundersActive = 0;
    try {
      const agg = await db.collection('apiKeysByEmail').where('tier', '==', 'foundersClub').count().get();
      paidFoundersActive = agg.data().count;
    } catch {
      const q = await db.collection('apiKeysByEmail').limit(5000).get();
      q.docs.forEach((d) => {
        if (d.data()?.tier === 'foundersClub') paidFoundersActive++;
      });
    }
    const paywallToCheckoutPercent =
      paywallImpressions > 0 ? Math.round((checkoutStarts / paywallImpressions) * 1000) / 10 : null;
    let checkoutToPaidDropoffPercent: number | null = null;
    if (checkoutStarts > 0) {
      const ratio = Math.min(1, paidFoundersActive / checkoutStarts);
      checkoutToPaidDropoffPercent = Math.round((1 - ratio) * 1000) / 10;
    }
    return {
      organicTraffic,
      paywallImpressions,
      checkoutStarts,
      paidFoundersActive,
      paywallToCheckoutPercent,
      checkoutToPaidDropoffPercent,
    };
  } catch (error) {
    console.error('Monetization funnel board error:', error);
    return {
      organicTraffic,
      paywallImpressions: 0,
      checkoutStarts: 0,
      paidFoundersActive: 0,
      paywallToCheckoutPercent: null,
      checkoutToPaidDropoffPercent: null,
    };
  }
}

async function getConversionFunnelData(startDate: Date) {
  try {
    const db = getDb();
    const ref = db.collection('conversionEvents');
    const startTimestamp = Timestamp.fromDate(startDate);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

    const snapshot = await ref.where('timestamp', '>=', startTimestamp).get();

    const leadMagnetClicked = { total: 0, last7Days: 0, byTicker: {} as Record<string, number> };
    const mobileSetupRequested = { total: 0, last7Days: 0 };
    const quotaUpgradeInitiated = { total: 0, last7Days: 0 };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const event = data?.event as string;
      const ticker = typeof data?.ticker === 'string' ? data.ticker : undefined;
      const ts = data?.timestamp as Timestamp;
      const isLast7Days = ts && ts.toMillis ? ts.toMillis() >= sevenDaysAgo.getTime() : false;

      if (event === 'lead_magnet_clicked') {
        leadMagnetClicked.total++;
        if (isLast7Days) leadMagnetClicked.last7Days++;
        if (ticker) {
          const t = ticker.toUpperCase();
          leadMagnetClicked.byTicker[t] = (leadMagnetClicked.byTicker[t] || 0) + 1;
        }
      } else if (event === 'mobile_setup_requested') {
        mobileSetupRequested.total++;
        if (isLast7Days) mobileSetupRequested.last7Days++;
      } else if (event === 'quota_upgrade_initiated') {
        quotaUpgradeInitiated.total++;
        if (isLast7Days) quotaUpgradeInitiated.last7Days++;
      }
    });

    return {
      leadMagnetClicked,
      mobileSetupRequested,
      quotaUpgradeInitiated,
    };
  } catch (error) {
    console.error('Conversion funnel fetch error:', error);
    return {
      leadMagnetClicked: { total: 0, last7Days: 0, byTicker: {} },
      mobileSetupRequested: { total: 0, last7Days: 0 },
      quotaUpgradeInitiated: { total: 0, last7Days: 0 },
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
          let allTimeDownloads = 0;
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

          // Fetch all-time downloads (from npm stats epoch to today)
          try {
            const endDate = new Date();
            const allTimeStartDate = new Date('2010-01-01');
            const startDateStr = allTimeStartDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            const allTimeResponse = await fetchWithRetry(
              `https://api.npmjs.org/downloads/point/${startDateStr}:${endDateStr}/${encodeURIComponent(packageName)}`,
              {
                headers: { 'Accept': 'application/json' },
              },
              3,
              1000
            );

            if (allTimeResponse.ok) {
              const allTimeData = await allTimeResponse.json();
              allTimeDownloads = allTimeData.downloads || 0;
            }
          } catch (error: any) {
            console.warn(`Error fetching all-time stats for ${packageName}:`, error.message);
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
            allTimeDownloads,
            error: false,
          };
        } catch (error: any) {
          console.error(`Error fetching ${packageName}:`, error.message || error);
          return {
            name: packageName,
            version: 'unknown',
            monthlyDownloads: 0,
            last7Days: 0,
            allTimeDownloads: 0,
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
    const totalAllTimeDownloads = packageStats.reduce(
      (sum, pkg) => sum + pkg.allTimeDownloads,
      0
    );

    // Log totals for debugging
    console.log('📊 NPM Stats Summary:', {
      totalMonthlyDownloads,
      totalLast7Days,
      totalAllTimeDownloads,
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
      totalAllTimeDownloads,
      packageCount: packageStats.length,
    };
  } catch (error) {
    console.error('NPM data fetch error:', error);
    return {
      packages: [],
      totalMonthlyDownloads: 0,
      totalLast7Days: 0,
      totalAllTimeDownloads: 0,
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
    const todayDate = new Date(today);
    const isVercel = typeof process.env.VERCEL === 'string';

    // Check which posts have actual files (only possible when filesystem is available, e.g. local/build)
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'blog');

    const posts = deduplicatedCalendar.map((post: any) => {
      const mdxPath = path.join(postsDir, `${post.slug}.mdx`);
      const imagePath = path.join(imagesDir, `${post.slug}.png`);

      // On Vercel serverless, content/posts and public/images/blog are not in the function bundle,
      // so fs checks always fail. Infer from calendar: published + date <= today => assume files deployed.
      let hasFiles = false;
      if (isVercel) {
        hasFiles = post.status === 'published' && new Date(post.date) <= todayDate;
      } else {
        try {
          const mdxExists = fs.existsSync(mdxPath);
          const imageExists = fs.existsSync(imagePath);
          hasFiles = mdxExists && imageExists;
          if (!hasFiles && post.category === 'research' && post.status === 'published') {
            console.warn(`[Analytics] Research post files missing: ${post.slug}`, {
              mdxPath, imagePath, mdxExists, imageExists,
              postsDirExists: fs.existsSync(postsDir),
              imagesDirExists: fs.existsSync(imagesDir),
              cwd: process.cwd(),
            });
          }
        } catch (error: any) {
          console.error(`[Analytics] Error checking files for ${post.slug}:`, error.message);
          hasFiles = false;
        }
      }

      const postDate = new Date(post.date);
      // If we inferred hasFiles from calendar (Vercel), effectiveStatus is already post.status for published
      const effectiveStatus = !isVercel && hasFiles && postDate <= todayDate
        ? 'published'
        : post.status;
      const isOverdue = postDate < todayDate && effectiveStatus === 'pending';

      // Published time: from calendar (publishedAt), file mtime (local), or scheduled time when published
      const scheduledDateTime = post.scheduledTime
        ? `${post.date}T${post.scheduledTime}:00Z`
        : `${post.date}T00:00:00Z`;
      let publishedTime: string | null = null;
      const consideredPublished = effectiveStatus === 'published' || (isVercel && hasFiles);
      if (consideredPublished) {
        if (post.publishedAt) {
          publishedTime = post.publishedAt;
        } else if (!isVercel && fs.existsSync(mdxPath)) {
          try {
            publishedTime = fs.statSync(mdxPath).mtime.toISOString();
          } catch {
            publishedTime = scheduledDateTime;
          }
        } else {
          publishedTime = scheduledDateTime;
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

/** Cohort date for "new users" (e.g. Stack Reveal): signups on or after this date. Always used for App Signups so the list is not limited by dashboard time range. */
const COHORT_DATE_2025_10_27 = new Date('2025-10-27T00:00:00Z');

async function getGoogleSignupsData(_startDate: Date) {
  try {
    getDb(); // Ensure Firebase Admin is initialized
    const auth = getAuth();
    const signups: Array<{
      email: string;
      uid: string;
      displayName: string | null;
      firstName: string | null;
      createdAt: string;
    }> = [];
    let nextPageToken: string | undefined;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Always use cohort date so we show full cohort (57+), not filtered by dashboard 7d/30d/90d
    const cohortStart = COHORT_DATE_2025_10_27;

    do {
      const listResult = await auth.listUsers(1000, nextPageToken);
      nextPageToken = listResult.pageToken;

      for (const user of listResult.users) {
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : null;
        if (!creationTime || creationTime < cohortStart) continue;

        const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
        if (!isGoogle) continue;

        const displayName = user.displayName || null;
        const firstName = displayName?.trim() ? displayName.trim().split(/\s+/)[0] || null : null;

        signups.push({
          email: user.email || '',
          uid: user.uid,
          displayName,
          firstName,
          createdAt: user.metadata.creationTime || '',
        });
      }
    } while (nextPageToken);

    // Sort by createdAt descending (most recent first)
    signups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const last7Days = signups.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;

    return {
      total: signups.length,
      last7Days,
      cohortSinceOct2025: signups.length, // Same as total when using cohort start
      signups: signups.slice(0, 100), // Show full cohort (all since Oct 27 2025)
    };
  } catch (error: any) {
    console.error('Google signups fetch error:', error);
    return {
      total: 0,
      last7Days: 0,
      cohortSinceOct2025: 0,
      signups: [],
      error: error?.message,
    };
  }
}

