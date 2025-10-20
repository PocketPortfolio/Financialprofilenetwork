'use client';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/brand/og-base.png',
  ogType = 'website',
  noIndex = false,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes('Pocket Portfolio') ? title : `${title} | Pocket Portfolio`;
  const fullDescription = description || 'Pocket Portfolio is an open-source, community-led investing dashboard with live prices, profit/loss, mock trades, news, and simple trade import. Invest smarter, together.';
  
  const defaultKeywords = [
    'portfolio tracker',
    'investment dashboard',
    'stock portfolio',
    'crypto portfolio',
    'trading dashboard',
    'portfolio management',
    'investment tracking',
    'financial dashboard',
    'stock tracker',
    'crypto tracker',
    'portfolio analytics',
    'investment tools',
    'trading tools',
    'financial tools',
    'open source finance',
    'community finance',
    'privacy-first investing'
  ];

  const allKeywords = [...new Set([...keywords, ...defaultKeywords])].join(', ');

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content="Pocket Portfolio Team" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `https://pocketportfolio.app${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`Pocket Portfolio - ${title}`} />
      <meta property="og:url" content={canonical || 'https://pocketportfolio.app'} />
      <meta property="og:site_name" content="Pocket Portfolio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `https://pocketportfolio.app${ogImage}`} />
      <meta name="twitter:image:alt" content={`Pocket Portfolio - ${title}`} />
      <meta name="twitter:site" content="@pocketportfolio" />
      <meta name="twitter:creator" content="@pocketportfolio" />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="apple-mobile-web-app-title" content="Pocket Portfolio" />
      <meta name="application-name" content="Pocket Portfolio" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </>
  );
}
