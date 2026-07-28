import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Resolve ISO country from Cloudflare or Vercel edge headers. */
export function resolveUserCountry(request: NextRequest): string {
  return (
    request.headers.get('cf-ipcountry')?.trim() ||
    request.headers.get('x-vercel-ip-country')?.trim() ||
    'US'
  );
}

/** Forward geo country to downstream Server Components via request + response headers. */
export function nextWithGeoCountry(request: NextRequest): NextResponse {
  const country = resolveUserCountry(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-country', country);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-user-country', country);
  return response;
}

export function attachGeoCountry(request: NextRequest, response: NextResponse): NextResponse {
  const country = resolveUserCountry(request);
  response.headers.set('x-user-country', country);
  return response;
}
