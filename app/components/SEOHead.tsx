'use client';

import { useEffect } from 'react';

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
  ogImage = 'https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=2',
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

  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update basic meta tags
    updateMetaTag('description', fullDescription);
    updateMetaTag('keywords', allKeywords);
    updateMetaTag('author', 'Pocket Portfolio Team');
    updateMetaTag('robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    
    // Update Open Graph tags
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `https://www.pocketportfolio.app${ogImage}`, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', `Pocket Portfolio - ${title}`, true);
    updateMetaTag('og:url', canonical || 'https://www.pocketportfolio.app', true);
    updateMetaTag('og:site_name', 'Pocket Portfolio', true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `https://www.pocketportfolio.app${ogImage}`);
    updateMetaTag('twitter:image:alt', `Pocket Portfolio - ${title}`);
    updateMetaTag('twitter:site', '@pocketportfolio');
    updateMetaTag('twitter:creator', '@pocketportfolio');
    
    // Update additional SEO tags
    updateMetaTag('theme-color', '#6366f1');
    updateMetaTag('msapplication-TileColor', '#6366f1');
    updateMetaTag('apple-mobile-web-app-title', 'Pocket Portfolio');
    updateMetaTag('application-name', 'Pocket Portfolio');
    
    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }
    
    // Add structured data
    if (structuredData) {
      // Remove existing structured data script
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [fullTitle, fullDescription, allKeywords, canonical, ogImage, ogType, noIndex, structuredData, title]);

  // This component doesn't render anything visible
  return null;
}
