import { NextRequest, NextResponse } from 'next/server';
import { enforceDataApiGate } from '@/app/lib/server/data-api-gate';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const gate = await enforceDataApiGate(request);
  if (!gate.allowed) return gate.response;

  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase();
  const apiKey = request.nextUrl.searchParams.get('key') || 'demo_key';

  if (apiKey !== 'demo_key') {
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');

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
      const apiKeySnapshot = await db
        .collection('apiKeysByEmail')
        .where('apiKey', '==', apiKey)
        .limit(1)
        .get();

      if (apiKeySnapshot.empty) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } catch (error) {
      console.error('API key validation error:', error);
      if (!apiKey.startsWith('pp_')) {
        return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
      }
    }
  }

  try {
    const price = await fetchStockPrice(ticker);

    if (!price) {
      return NextResponse.json(
        { error: `Price not found for ticker: ${ticker}` },
        { status: 404 },
      );
    }

    return new NextResponse(price.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error: unknown) {
    console.error('Price fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock price' }, { status: 500 });
  }
}

async function fetchStockPrice(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price || null;
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return null;
  }
}
