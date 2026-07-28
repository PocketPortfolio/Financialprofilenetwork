import { NextResponse } from 'next/server';
import { buildLlmsFullDocumentation, LLMS_FEED_CACHE_HEADERS } from '@/lib/llms-feed';

export const runtime = 'edge';

export async function GET() {
  const content = buildLlmsFullDocumentation();
  return new NextResponse(content, { headers: LLMS_FEED_CACHE_HEADERS });
}
