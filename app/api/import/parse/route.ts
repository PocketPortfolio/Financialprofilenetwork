import { NextResponse } from 'next/server';
// import { ADAPTERS, detectBroker } from '@/src/import/registry';
// import { csvFrom } from '@/src/import/io/csvFrom';

export const runtime = 'nodejs'; // not edge; needs Buffer/SheetJS

export async function POST(req: Request) {
  return NextResponse.json({ error: 'Import functionality temporarily disabled' }, { status: 503 });
}
