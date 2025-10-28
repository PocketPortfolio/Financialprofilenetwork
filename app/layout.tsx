import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import './styles/tokens.css';
import './styles/brand.css';
import './styles/animations.css';
import { BrandProvider } from './lib/brand/theme';
import { generateMetadata as genMeta } from './lib/seo/meta';
import { getHomePageSchema, renderJsonLd } from './lib/seo/schema';
import { getCleanGAId } from './lib/env-utils';
import TabBar from './components/nav/TabBar';
import LandingPageTracker from './components/LandingPageTracker';
import { ErrorBoundary } from './components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

// Use brand V2 metadata if enabled, fallback to legacy
const brandEnabled = process.env.NEXT_PUBLIC_BRAND_V2 === 'true';

export const metadata: Metadata = brandEnabled
  ? genMeta({
      title: '',
      description: 'Track positions with clean, reliable data pipelines. Built in public, evidence first.',
      path: '/',
    })
  : {
      title: 'Pocket Portfolio — Invest smarter, together',
      description: 'Pocket Portfolio is an open-source, community-led investing dashboard with live prices, profit/loss, mock trades, news, and simple trade import. Invest smarter, together.',
      robots: 'index,follow,max-image-preview:large',
        openGraph: {
          title: 'Pocket Portfolio — Invest smarter, together',
          description: 'Open-source, community-led investing dashboard with live P/L, mock trades, prices, and insights.',
          url: 'https://www.pocketportfolio.app/',
          siteName: 'Pocket Portfolio',
          images: [
            {
              url: 'https://www.pocketportfolio.app/brand/og-base.png',
              width: 1200,
              height: 630,
              alt: 'Pocket Portfolio app preview',
            },
          ],
          locale: 'en_GB',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Pocket Portfolio — Invest smarter, together',
          description: 'Open-source, community-led investing dashboard with live P/L, mock trades, prices, and insights.',
          images: ['https://www.pocketportfolio.app/brand/og-base.png'],
        },
    };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d10' },
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover', // For iOS safe areas
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/pp-monogram.svg" />
        <link rel="apple-touch-icon" href="/brand/pp-monogram.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        {/* Mobile-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pocket Portfolio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Set theme immediately to prevent flash
                try {
                  const savedTheme = localStorage.getItem('pocket-portfolio-theme');
                  const theme = savedTheme && ['system', 'light', 'dark', 'contrast'].includes(savedTheme) 
                    ? savedTheme 
                    : 'system';
                  
                  let themeValue = 'dark'; // Default fallback
                  
                  if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    themeValue = prefersDark ? 'dark' : 'light';
                  } else {
                    themeValue = theme;
                  }
                  
                  // Apply theme immediately
                  if (document.documentElement) {
                    document.documentElement.setAttribute('data-theme', themeValue);
                  }
                  if (document.body) {
                    document.body.setAttribute('data-theme', themeValue);
                  }
                } catch (e) {
                  // Silent fallback to prevent hydration issues
                  try {
                    if (document.documentElement) {
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    if (document.body) {
                      document.body.setAttribute('data-theme', 'dark');
                    }
                  } catch (e2) {
                    // Silent fail
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} mobile-container`} suppressHydrationWarning>
        {/* Google Analytics 4 */}
        {getCleanGAId() && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${getCleanGAId()}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${getCleanGAId()}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                  cookie_flags: 'SameSite=Lax;Secure',
                });
              `}
            </Script>
          </>
        )}
        
        {brandEnabled && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={renderJsonLd(getHomePageSchema())}
          />
        )}
        <BrandProvider>
          <ErrorBoundary scope="app-root">
            <LandingPageTracker />
            <div className="safe-area-all">
              <ErrorBoundary scope="main-content">
                {children}
              </ErrorBoundary>
              <ErrorBoundary scope="tab-bar">
                <TabBar />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </BrandProvider>
      </body>
    </html>
  );
}
