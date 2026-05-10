import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import './styles/tokens.css';
import './styles/brand.css';
import './styles/animations.css';
import { BrandProvider } from './lib/brand/theme';
import { generateMetadata as genMeta, siteConfig } from './lib/seo/meta';
import { getHomePageSchema, renderJsonLd } from './lib/seo/schema';
import { getCleanGAId } from './lib/env-utils';
import TabBar from './components/nav/TabBar';
import LandingPageTracker from './components/LandingPageTracker';
import ReferralCapture from './components/ReferralCapture';
import ReferralPendingNotice from './components/ReferralPendingNotice';
import { ErrorBoundary } from './components/ErrorBoundary';
import PremiumThemeProvider from './components/PremiumThemeProvider';
import { PremiumTierProvider } from './contexts/PremiumTierContext';
import PWAInstallPromptWrapper from './components/PWAInstallPromptWrapper';
import GlobalFoundersClubBanner from './components/GlobalFoundersClubBanner';
import { PocketAnalystProvider } from './components/ai/PocketAnalystProvider';

const inter = Inter({ subsets: ['latin'] });

/** Code-split footer so first interaction isn’t blocked parsing a large client chunk. */
const GlobalFooter = dynamic(() => import('./components/layout/GlobalFooter'), {
  loading: () => (
    <footer
      style={{
        marginTop: 'auto',
        minHeight: '100px',
        borderTop: '1px solid var(--border-warm)',
        background: 'var(--bg)',
      }}
      aria-label="Site footer"
    />
  ),
});

// Use brand V2 metadata if enabled, fallback to legacy
const brandEnabled = process.env.NEXT_PUBLIC_BRAND_V2 === 'true';

export const metadata: Metadata = brandEnabled
  ? genMeta({
      title: '',
      description: siteConfig.description,
      path: '/',
    })
  : {
      title: {
        default: siteConfig.title,
        template: '%s | Pocket Portfolio',
      },
      description: siteConfig.description,
      robots: 'index,follow,max-image-preview:large',
      openGraph: {
        title: siteConfig.title,
        description: siteConfig.description,
        url: 'https://www.pocketportfolio.app/',
        siteName: siteConfig.name,
        images: [
          {
            url: siteConfig.ogImage,
            secureUrl: siteConfig.ogImage,
            width: 1200,
            height: 630,
            alt: 'Pocket Portfolio — Sovereign Local-First Wealth Tracker',
            type: 'image/png',
          },
        ],
        locale: 'en_GB',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
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
        {/* PNG favicon variants for crawlers + iOS Safari rich link previews.
            iOS does not render SVG for apple-touch-icon — using SVG here was
            causing iMessage / Safari Share Sheet to show a generic preview. */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/svg+xml" href="/brand/pp-maskable.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
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
                    : 'dark';
                  
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
          <PremiumTierProvider>
          <ErrorBoundary scope="app-root">
            <PremiumThemeProvider />
            <PocketAnalystProvider>
            <GlobalFoundersClubBanner />
            <LandingPageTracker />
            <ReferralCapture />
            <ReferralPendingNotice />
            <div className="safe-area-all" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* flex-1 + minHeight 0 keeps bottom TabBar/footer in view when pages use full viewport height */}
              <div
                style={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                <ErrorBoundary scope="main-content">{children}</ErrorBoundary>
              </div>
              <ErrorBoundary scope="tab-bar">
                <TabBar />
              </ErrorBoundary>
              <ErrorBoundary scope="global-footer">
                <GlobalFooter />
              </ErrorBoundary>
              <PWAInstallPromptWrapper />
            </div>
            </PocketAnalystProvider>
          </ErrorBoundary>
          </PremiumTierProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
