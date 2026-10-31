import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './open-surface.css';
import { SurfaceProvider } from '../components/SurfaceProvider';
import OpenSurfaceThemeLock from './_components/OpenSurfaceThemeLock';
import OpenFaviconLock from './_components/OpenFaviconLock';
import OpenNavbar from './_components/OpenNavbar';
import OpenFooter from './_components/OpenFooter';
import { ComplianceBannerServer } from '../components/compliance/ComplianceBanner';
import { OPEN_URLS, SURFACE_ORG, SURFACE_POSITIONING } from '../../lib/canonical-claims';
import { openPageSocial } from './shared-metadata';

/**
 * app/open/layout.tsx
 *
 * Nested layout for the Open Portfolio (O.) surface. Mounted via the
 * middleware.ts host gate which rewrites every request on
 * www.openportfolio.co.uk to /open/<path>. The root app/layout.tsx still
 * provides <html>/<body> and the analytics scripts; this layout adds:
 *
 *   - SurfaceProvider value="open" so <Logo /> renders the O. monogram and
 *     "Open Portfolio." wordmark instead of the P. brand.
 *   - JSON-LD Organization schema pointing at www.openportfolio.co.uk so
 *     search engines treat the O. surface as a distinct entity.
 *
 * Metadata defaults here flow into every aliased developer route unless the
 * thin-wrapper at app/open/<route>/page.tsx overrides them.
 */

const openOrgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SURFACE_ORG.open.name,
  alternateName: SURFACE_ORG.open.alternateName,
  url: SURFACE_ORG.open.url,
  logo: SURFACE_ORG.open.logo,
  description: SURFACE_ORG.open.description,
  sameAs: [
    'https://github.com/PocketPortfolio/Financialprofilenetwork',
    'https://www.npmjs.com/org/pocket-portfolio',
    'https://x.com/OIntelligenceUK',
    'https://www.youtube.com/@OpenIntelligenceUK',
    'https://www.linkedin.com/company/open-portfolio-infrastructure/',
  ],
};

// Static O.-branded OG card — see shared-metadata.ts (must be re-spread on every
// child openGraph export; Next replaces the whole openGraph object per segment).

export const metadata: Metadata = {
  metadataBase: new URL(OPEN_URLS.home),
  title: {
    default: 'Open Portfolio — The Sovereign Ingestion & Inference Layer',
    template: '%s | Open Portfolio',
  },
  description: SURFACE_ORG.open.description,
  alternates: {
    canonical: OPEN_URLS.home,
  },
  ...openPageSocial({
    title: 'Open Portfolio — The Sovereign Ingestion & Inference Layer',
    description: SURFACE_POSITIONING.open.primary,
    url: OPEN_URLS.home,
    type: 'website',
  }),
  robots: 'index,follow,max-image-preview:large',
  icons: {
    icon: [
      { url: '/brand/op-monogram-amber.svg', type: 'image/svg+xml' },
      { url: '/brand/op-icon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [{ url: '/brand/op-icon.png', sizes: '256x256' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b0d10',
};

export default function OpenSurfaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <SurfaceProvider value="open">
      <OpenSurfaceThemeLock />
      <OpenFaviconLock />
      <Script
        id="open-portfolio-org-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(openOrgJsonLd) }}
      />
      <div
        className="open-surface"
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <OpenNavbar />
        <ComplianceBannerServer />
        <div style={{ flex: '1 1 auto', minHeight: 0, width: '100%' }}>{children}</div>
        <OpenFooter />
      </div>
    </SurfaceProvider>
  );
}
