/**
 * MINIMAL TEST VERSION - To isolate routing issue
 */

import { Metadata } from 'next';

// Minimal generateStaticParams
export async function generateStaticParams() {
  return [{ ticker: 'aapl' }];
}

// Minimal generateMetadata
export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const ticker = resolvedParams?.ticker?.toUpperCase() || 'STOCK';
  return {
    title: `Track ${ticker} Risk`,
    description: `Calculate ${ticker} portfolio risk.`,
  };
}

// Minimal page component
export default async function TrackTickerRiskPage({ params }: { params: Promise<{ ticker: string }> }) {
  console.warn('[MINIMAL-TEST] Route handler invoked');
  const resolvedParams = await params;
  const ticker = resolvedParams?.ticker?.toUpperCase() || 'STOCK';
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Track {ticker} Risk (Minimal Test)</h1>
      <p>Ticker: {ticker}</p>
    </div>
  );
}

export const dynamicParams = true;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';






