import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Skip security headers in development to avoid CSP issues with Next.js dev server
  if (process.env.NODE_ENV === 'development') {
    return res;
  }
  
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.gstatic.com https://apis.google.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.finance.yahoo.com https://stooq.com https://region1.google-analytics.com https://*.google-analytics.com https://www.google-analytics.com https://firebaseinstallations.googleapis.com https://*.firebaseinstallations.googleapis.com https://www.googletagmanager.com https://securetoken.google.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://apis.google.com https://accounts.google.com https://www.gstatic.com",
      "frame-src 'self' https://accounts.google.com https://pocket-portfolio-67fa6.firebaseapp.com"
    ].join('; ')
  );
  
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/ (API routes)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     */
    '/((?!_next/static|_next/image|favicon.ico|brand|public|api|sitemap.xml|robots.txt).*)',
  ],
};

