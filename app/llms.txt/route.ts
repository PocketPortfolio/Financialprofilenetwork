import { NextRequest, NextResponse } from 'next/server';
import {
  buildLlmsSummaryForHost,
  LLMS_FEED_CACHE_HEADERS,
} from '@/lib/llms-feed';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const content = buildLlmsSummaryForHost(host);
  return new NextResponse(content, { headers: LLMS_FEED_CACHE_HEADERS });
}
