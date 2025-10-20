import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface SymbolPageProps {
  params: { symbol: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SymbolPageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  
  return {
    title: `${symbol} Stock Price & Analysis | Pocket Portfolio`,
    description: `Track ${symbol} stock price, performance, and portfolio analysis. Free, open-source portfolio tracking for ${symbol} investors.`,
    keywords: `${symbol}, stock price, portfolio tracking, investment analysis, free portfolio tracker`,
    openGraph: {
      title: `${symbol} Stock Analysis | Pocket Portfolio`,
      description: `Track ${symbol} stock performance with Pocket Portfolio's free portfolio tracker.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Analysis | Pocket Portfolio`,
      description: `Track ${symbol} stock performance with Pocket Portfolio's free portfolio tracker.`,
    },
  };
}

// Main component
export default function SymbolPage({ params }: SymbolPageProps) {
  const symbol = params.symbol.toUpperCase();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {symbol} Stock Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track {symbol} stock price, performance, and portfolio analysis
            </p>
          </div>

          {/* Stock Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {symbol} Stock Information
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Real-time data
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Loading...
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Price
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading...
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Change
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading...
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Change %
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add {symbol} to Your Portfolio
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track {symbol} in your portfolio with Pocket Portfolio's free portfolio tracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </a>
              <a
                href="/import"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Import Trades
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Free Portfolio Tracking
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Track {symbol} performance</li>
                <li>• Real-time price updates</li>
                <li>• Portfolio analytics</li>
                <li>• No signup required</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Open Source
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Community-driven</li>
                <li>• Privacy-first</li>
                <li>• Always ad-free</li>
                <li>• Transparent code</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ISR configuration
export const revalidate = 300; // 5 minutes


