/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker (Vercel handles this automatically)
  // Only use standalone for Docker deployments, not for Vercel
  // output: 'standalone', // Commented out - Vercel uses serverless functions
  compiler: {
    // Keep console.warn and console.error in production for debugging
    // Only remove console.log (but keep DIVIDEND_DEBUG logs via console.warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['warn', 'error'],
    } : false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [], // Don't lint any directories
  },
  images: {
    domains: ['assets.example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Rewrites for API route compatibility (internal mapping, no URL change)
  async rewrites() {
    return [
      // Map /api/tickers/{ticker}/json to catch-all route for Next.js 15 compatibility
      {
        source: '/api/tickers/:ticker/json',
        destination: '/api/tickers/:ticker/json',
      },
      // Sitemap rewrites removed - now using static files in public/ folder
      // Static files are served automatically by Next.js from public/ directory
    ];
  },
  // Comprehensive redirects for canonicalization and legacy routes
  async redirects() {
    return [
      // HTTP to HTTPS redirects (force HTTPS) - exclude API routes
      {
        source: '/:path((?!api).)*',
        destination: 'https://www.pocketportfolio.app/:path*',
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
      },
      // Non-www to www redirects (canonical domain) - exclude API routes
      {
        source: '/:path((?!api).)*',
        destination: 'https://www.pocketportfolio.app/:path*',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'pocketportfolio.app',
          },
        ],
      },
      // Legacy route redirects
      {
        source: '/portfolio-tracker',
        destination: '/static/portfolio-tracker',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
      // Sector pages not yet implemented - redirect to dashboard
      {
        source: '/sector',
        destination: '/dashboard',
        permanent: false, // Temporary redirect until sector pages are implemented
      },
      {
        source: '/sector/:path*',
        destination: '/dashboard',
        permanent: false, // Temporary redirect until sector pages are implemented
      },
      // Static file path normalization
      {
        source: '/app/static/:path*',
        destination: '/static/:path*',
        permanent: true,
      },
      // Remove .html extensions for cleaner URLs
      {
        source: '/static/:path*.html',
        destination: '/static/:path*',
        permanent: true,
      },
    ];
  },
  // Headers for security (only in production)
  async headers() {
    // Skip security headers in development to avoid CSP issues with Next.js dev server
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    return [
      // Note: Gzip sitemap files are served from public/ folder
      // Vercel automatically sets Content-Encoding: gzip for .gz files
      // No explicit headers needed for static files
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://apis.google.com https://accounts.google.com https://www.google-analytics.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.googleapis.com https://*.googleapis.com https://securetoken.google.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://apis.google.com https://accounts.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://region1.google-analytics.com https://*.google-analytics.com https://www.google-analytics.com https://firebaseinstallations.googleapis.com https://*.firebaseinstallations.googleapis.com https://api.stripe.com https://checkout.stripe.com https://www.google.com",
              "frame-src 'self' https://accounts.google.com https://content.googleapis.com https://pocket-portfolio-67fa6.firebaseapp.com https://checkout.stripe.com https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ];
  },
  // Windows-specific webpack configuration to prevent runtime errors
  webpack: (config, { dev, isServer }) => {
    if (dev && process.platform === 'win32') {
      // Disable webpack caching on Windows to prevent corruption
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;