/**
 * SEO Metadata Helpers
 * Consistent, production-safe meta tags for Pocket Portfolio
 */

export const siteConfig = {
  name: 'Pocket Portfolio',
  title: 'Pocket Portfolio | Google Drive Sync & Sovereign Financial Tracking',
  description: 'The privacy-first portfolio tracker that turns Google Drive into your personal database. Edit trades in JSON, own your data, and sync bidirectionally. No vendor lock-in.',
  url: 'https://www.pocketportfolio.app',
  ogImage: 'https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=2',
  twitter: '@PocketPortApp',
  keywords: [
    'portfolio tracker',
    'investment tracking',
    'stock portfolio',
    'financial data',
    'open source finance',
    'evidence-based investing',
    'CSV import',
    'portfolio management',
    'price pipeline health',
    'developer portfolio tracker',
    'building in public',
    'transparent investing',
    'resilient price pipeline',
    'never 0.00 price',
    'mock trade lab',
    'portfolio analytics',
    'dev.to portfolio',
    'developer community finance',
    'google drive portfolio',
    'sovereign finance',
    'json stock tracker',
    'self-hosted portfolio',
    'excel trading journal',
    'google drive database',
    'sovereign sync',
    'bidirectional sync',
    'data ownership',
    'zero knowledge portfolio',
  ],
};

export function getTitle(page?: string): string {
  if (!page) return siteConfig.title;
  return `${page} · Pocket Portfolio`;
}

export function getDescription(custom?: string): string {
  return custom || siteConfig.description;
}

export function getCanonical(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}

export interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMetadata(options: MetadataOptions = {}) {
  const {
    title,
    description,
    path = '/',
    image,
    noIndex = false,
    type = 'website',
    publishedTime,
    modifiedTime,
  } = options;

  const pageTitle = title ? getTitle(title) : siteConfig.title;
  const pageDescription = getDescription(description);
  const canonical = getCanonical(path);
  const ogImage = image || siteConfig.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: 'Pocket Portfolio Team' }],
    creator: 'Pocket Portfolio',
    publisher: 'Pocket Portfolio',
    robots: noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: canonical,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  };
}

// Pre-configured metadata for common pages
export const homeMetadata = generateMetadata({
  title: '',
  description: 'The privacy-first portfolio tracker that turns Google Drive into your personal database. Edit trades in JSON, own your data, and sync bidirectionally. No vendor lock-in.',
  path: '/',
});

export const dashboardMetadata = generateMetadata({
  title: 'Dashboard',
  description: 'View your portfolio positions, trades, and performance metrics.',
  path: '/dashboard',
  noIndex: true, // User-specific, don't index
});

export const landingMetadata = generateMetadata({
  title: 'Evidence-First Portfolio Tracking',
  description: 'Clean data pipelines for position tracking. Import trades, monitor performance, and make informed decisions based on evidence.',
  path: '/landing',
});
























