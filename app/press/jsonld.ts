/**
 * app/press/jsonld.ts — JSON-LD builders for /press.
 *
 * Extracted from page.tsx so they can be unit-tested without a React render.
 * Single source of truth: ../../lib/canonical-claims.ts.
 */

import {
  POSITIONING,
  ORG,
  PERSON_ABBA,
  SDK,
  PACKAGES,
  CANONICAL_ARTICLES,
  URLS,
} from '@/lib/canonical-claims';

export const PRESS_URL = URLS.press;

export interface LiveSignal {
  totalDownloads: number;
  lastUpdated: string;
  source: 'live' | 'snapshot';
}

export function buildOrganizationLd(live: LiveSignal) {
  // Only attach an InteractionCounter when the signal is genuinely live.
  // Otherwise answer engines would treat a frozen snapshot as a verified live
  // count and over-cite it. The dated row stays in the visible numeric
  // receipts table either way.
  const interactionStatistic =
    live.source === 'live'
      ? {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'DownloadAction' },
          userInteractionCount: live.totalDownloads,
          name: 'Aggregate npm downloads · 11 @pocket-portfolio/* packages',
          observationDate: live.lastUpdated,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORG.url}#organization`,
    name: ORG.name,
    legalName: ORG.legalName,
    alternateName: ORG.alternateName,
    url: ORG.url,
    logo: ORG.logo,
    foundingDate: ORG.foundingDate,
    description: ORG.description,
    slogan: POSITIONING.primary,
    sameAs: ORG.sameAs,
    knowsAbout: [
      'Local-first software architecture',
      'Sovereign AI infrastructure',
      'Wealth-tech ingestion',
      'Stateless inference',
    ],
    founder: {
      '@type': 'Person',
      '@id': `${ORG.url}/press#abba-lawal`,
      name: PERSON_ABBA.name,
    },
    ...(interactionStatistic ? { interactionStatistic } : {}),
  };
}

export function buildPersonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${ORG.url}/press#abba-lawal`,
    mainEntityOfPage: URLS.personAbba,
    url: URLS.personAbba,
    name: PERSON_ABBA.name,
    jobTitle: PERSON_ABBA.jobTitle,
    description: PERSON_ABBA.description,
    worksFor: { '@type': 'Organization', '@id': `${ORG.url}#organization`, name: ORG.name },
    alumniOf: PERSON_ABBA.alumniOf,
    knowsAbout: PERSON_ABBA.knowsAbout,
    award: PERSON_ABBA.award,
    sameAs: PERSON_ABBA.sameAs,
  };
}

export function buildSoftwareApplicationLd() {
  return PACKAGES.map((pkg) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `https://www.npmjs.com/package/${pkg.name}#software`,
    name: pkg.name,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: pkg.category === 'core' ? 'SDK' : 'SDK Adapter',
    operatingSystem: 'Cross-platform (Node.js / Browser)',
    softwareVersion: pkg.name === SDK.name ? SDK.version : undefined,
    license: `https://opensource.org/licenses/${SDK.license}`,
    description: pkg.description,
    url: `https://www.npmjs.com/package/${pkg.name}`,
    codeRepository: SDK.repo,
    publisher: { '@type': 'Organization', '@id': `${ORG.url}#organization`, name: ORG.name },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }));
}

export function buildArticlesLd() {
  return CANONICAL_ARTICLES.map((article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    url: article.url,
    mainEntityOfPage: article.url,
    datePublished: article.datePublished,
    author: { '@type': 'Person', '@id': `${ORG.url}/press#abba-lawal`, name: PERSON_ABBA.name },
    publisher: {
      '@type': 'Organization',
      '@id': `${ORG.url}#organization`,
      name: ORG.name,
      logo: { '@type': 'ImageObject', url: ORG.logo },
    },
  }));
}

export function buildWebPageLd(args: { dateModified: string; lastHumanVerified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PRESS_URL}#webpage`,
    url: PRESS_URL,
    name: 'Pocket Portfolio · Press Kit',
    description:
      'Canonical, machine-readable facts about Pocket Portfolio: positioning, founder, SDK, packages, and live distribution signal.',
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', '@id': `${ORG.url}#website`, url: ORG.url, name: ORG.name },
    about: { '@id': `${ORG.url}#organization` },
    primaryImageOfPage: ORG.logo,
    dateModified: args.dateModified,
    /** Custom property — non-schema.org field consumed by our own validators. */
    lastReviewed: args.lastHumanVerified,
  };
}

export function buildBreadcrumbLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORG.url },
      { '@type': 'ListItem', position: 2, name: 'Press Kit', item: PRESS_URL },
    ],
  };
}
