'use client';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'WebApplication' | 'Product' | 'Article' | 'FAQPage' | 'FinancialProduct';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    switch (type) {
      case 'Organization':
        return {
          ...baseData,
          '@type': 'Organization',
          name: 'Pocket Portfolio',
          url: 'https://www.pocketportfolio.app',
          logo: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg',
          description: 'Open-source, community-led investing dashboard with live P/L, mock trades, prices, and insights.',
          sameAs: [
            'https://github.com/PocketPortfolio/Financialprofilenetwork',
            'https://discord.gg/Ch9PpjRzwe',
            'https://dev.to/pocketportfolioapp',
            'https://coderlegion.com/5738/welcome-to-coderlegion-22s'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            url: 'https://www.pocketportfolio.app'
          }
        };

      case 'WebSite':
        return {
          ...baseData,
          '@type': 'WebSite',
          name: 'Pocket Portfolio',
          url: 'https://www.pocketportfolio.app',
          description: 'Open-source, community-led investing dashboard',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.pocketportfolio.app/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        };

      case 'WebApplication':
        return {
          ...baseData,
          '@type': 'WebApplication',
          name: 'Pocket Portfolio',
          url: 'https://www.pocketportfolio.app',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier available. Enterprise Sync for Corporate Sponsors.'
          },
          featureList: [
            'Google Drive Bidirectional Sync',
            'JSON Data Ownership',
            'Zero Knowledge Privacy',
            'Portfolio Tracking',
            'Live Price Updates',
            'CSV Import',
            'Mock Trading',
            'News Integration',
            'Privacy-First Design'
          ]
        };

      case 'Product':
        return {
          ...baseData,
          '@type': 'Product',
          name: 'Pocket Portfolio',
          description: 'Open-source, community-led investing dashboard',
          brand: {
            '@type': 'Brand',
            name: 'Pocket Portfolio'
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        };

      case 'Article':
        return {
          ...baseData,
          '@type': 'Article',
          headline: data.headline,
          description: data.description,
          author: {
            '@type': 'Organization',
            name: 'Pocket Portfolio Team'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Pocket Portfolio',
            logo: {
              '@type': 'ImageObject',
              url: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg'
            }
          },
          datePublished: data.datePublished || new Date().toISOString(),
          dateModified: data.dateModified || new Date().toISOString()
        };

      case 'FAQPage':
        return {
          ...baseData,
          '@type': 'FAQPage',
          mainEntity: data.faqs?.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          })) || []
        };

      case 'FinancialProduct':
        return {
          ...baseData,
          '@type': 'FinancialProduct',
          name: data.name || 'Financial Product',
          description: data.description,
          identifier: data.identifier,
          category: data.category || 'Financial Product',
          provider: {
            '@type': 'Organization',
            name: data.provider?.name || 'Pocket Portfolio',
            url: 'https://www.pocketportfolio.app'
          }
        };

      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
}

// Predefined structured data for common pages
export const organizationData = {
  name: 'Pocket Portfolio',
  url: 'https://www.pocketportfolio.app',
  logo: 'https://www.pocketportfolio.app/brand/pp-wordmark.svg',
  description: 'Open-source, community-led investing dashboard with live P/L, mock trades, prices, and insights.',
  sameAs: [
    'https://github.com/PocketPortfolio/Financialprofilenetwork',
    'https://discord.gg/Ch9PpjRzwe',
    'https://dev.to/pocketportfolioapp',
    'https://coderlegion.com/5738/welcome-to-coderlegion-22s'
  ]
};

export const websiteData = {
  name: 'Pocket Portfolio',
  url: 'https://www.pocketportfolio.app',
  description: 'Open-source, community-led investing dashboard',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.pocketportfolio.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

export const webAppData = {
  name: 'Pocket Portfolio',
  url: 'https://www.pocketportfolio.app',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available. Enterprise Sync for Corporate Sponsors.'
  },
  featureList: [
    'Google Drive Bidirectional Sync',
    'JSON Data Ownership',
    'Zero Knowledge Privacy',
    'Portfolio Tracking',
    'Live Price Updates',
    'CSV Import',
    'Mock Trading',
    'News Integration',
    'Privacy-First Design'
  ]
};

export const faqData = {
  faqs: [
    {
      question: 'Is Pocket Portfolio free?',
      answer: 'Yes. It\'s open source. If the community later wants premium data sources, we\'ll decide together.'
    },
    {
      question: 'How do you handle my data?',
      answer: 'You control your data. We store the minimum needed and make export easy. See our privacy note in the repository.'
    },
    {
      question: 'Can I contribute?',
      answer: 'Please! Check the GitHub repo for issues, roadmap, and contribution guidelines.'
    },
    {
      question: 'What data sources do you use for live prices?',
      answer: 'We use multiple data providers including Yahoo Finance, Alpha Vantage, and others with fallback support to ensure reliability.'
    },
    {
      question: 'Is my portfolio data secure?',
      answer: 'Yes, we use industry-standard encryption and follow privacy-first principles. Your data is stored securely and you can export it anytime.'
    },
    {
      question: 'Can I import data from other platforms?',
      answer: 'Yes, we support CSV import from most major brokers with smart normalization to handle different formats.'
    }
  ]
};
