import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Explicitly allow dynamic params
export const runtime = 'nodejs'; // Explicitly set runtime for Vercel
export const revalidate = 0; // Force no caching - ensure fresh data

// Rate limiting storage (in production, use Redis or Vercel KV)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Free tier: 20 calls per hour per IP
const FREE_TIER_LIMIT = 20;
const FREE_TIER_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Demo key (free community key)
const DEMO_KEY = 'demo_key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  // Next.js 15: params is always a Promise
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  const apiKey = request.nextUrl.searchParams.get('key') || DEMO_KEY;
  
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Rate limiting for free tier
  if (apiKey === DEMO_KEY) {
    const now = Date.now();
    const key = `free:${ip}`;
    const limit = rateLimitMap.get(key);
    
    if (limit) {
      // Check if window has expired
      if (now > limit.resetTime) {
        // Reset counter
        rateLimitMap.set(key, { count: 1, resetTime: now + FREE_TIER_WINDOW });
      } else {
        // Check if limit exceeded
        if (limit.count >= FREE_TIER_LIMIT) {
          return NextResponse.json(
            { 
              error: 'Rate Limit Exceeded. Get Unlimited Key: pocketportfolio.app/sponsor',
              limit: FREE_TIER_LIMIT,
              window: '1 hour'
            },
            { status: 429 }
          );
        }
        // Increment counter
        limit.count++;
        rateLimitMap.set(key, limit);
      }
    } else {
      // First request from this IP
      rateLimitMap.set(key, { count: 1, resetTime: now + FREE_TIER_WINDOW });
    }
  }
  
  // Validate paid API keys against database
  if (apiKey !== DEMO_KEY) {
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      
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
      
      const db = getFirestore();
      const apiKeySnapshot = await db.collection('apiKeysByEmail')
        .where('apiKey', '==', apiKey)
        .limit(1)
        .get();
      
      if (apiKeySnapshot.empty) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      // Valid paid key - unlimited access
    } catch (error) {
      console.error('API key validation error:', error);
      // Fallback: allow if key format is valid (pp_ prefix)
      if (!apiKey.startsWith('pp_')) {
        return NextResponse.json(
          { error: 'Invalid API key format' },
          { status: 401 }
        );
      }
    }
  }
  
  try {
    // Fetch price from a free stock API (Yahoo Finance, Alpha Vantage, etc.)
    // For now, we'll use a mock response. In production, integrate with a real API.
    const price = await fetchStockPrice(ticker);
    
    if (!price) {
      return NextResponse.json(
        { error: `Price not found for ticker: ${ticker}` },
        { status: 404 }
      );
    }
    
    // Return CSV format for IMPORTDATA compatibility
    return new NextResponse(price.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error: any) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock price' },
      { status: 500 }
    );
  }
}

/**
 * Fetch stock price from external API
 * TODO: Integrate with real stock price API (Yahoo Finance, Alpha Vantage, etc.)
 */
async function fetchStockPrice(ticker: string): Promise<number | null> {
  try {
    // Mock implementation - replace with real API call
    // Example: Yahoo Finance API, Alpha Vantage, or your own data source
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    
    return price || null;
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    // Fallback: return null (will show error to user)
    return null;
  }
}

