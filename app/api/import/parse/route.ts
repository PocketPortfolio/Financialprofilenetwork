import { NextResponse } from 'next/server';
// import { ADAPTERS, detectBroker } from '@/src/import/registry';
// import { csvFrom } from '@/src/import/io/csvFrom';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // not edge; needs Buffer/SheetJS
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  return NextResponse.json({ error: 'Import functionality temporarily disabled' }, { status: 503 });
}
