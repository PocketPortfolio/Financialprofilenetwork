'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useTrades } from '@/app/hooks/useTrades';
import { useQuotes } from '@/app/hooks/useDataFetching';
import AlertModal from '@/app/components/modals/AlertModal';
import AdvisorPortfolioReport from './AdvisorPortfolioReport';
import {
  downloadPortfolioReportPdf,
  type PortfolioReportInput,
} from '@/app/lib/advisors/generate-portfolio-report-pdf';
import { loadImageNaturalSize } from '@/app/lib/advisors/logo-fit';
import { formatReportDate } from '@/app/lib/advisors/sovereign-report-theme';
import { 
  trackToolPageView, 
  trackToolInteraction, 
  trackToolSuccess,
  trackToolDownload,
  trackToolError 
} from '@/app/lib/analytics/tools';

interface PortfolioData {
  clientName: string;
  totalValue: number;
  primaryCurrency?: string;
  positions: Array<{
    ticker: string;
    shares: number;
    value: number;
    allocation: number;
    currency?: string;
  }>;
}

export default function AdvisorTool() {
  const { user, isAuthenticated } = useAuth();
  const { trades } = useTrades();
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hasCorporateLicense, setHasCorporateLicense] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);
  const [clientName, setClientName] = useState<string>('Sample Client');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate positions from real trades (filter out mock trades)
  const realTrades = useMemo(() => {
    return trades.filter(trade => !trade.mock);
  }, [trades]);

  // Calculate positions from trades
  const calculatedPositions = useMemo(() => {
    const positionMap = realTrades.reduce((acc: { [key: string]: {
      ticker: string;
      shares: number;
      avgCost: number;
      currency: string;
    }}, trade) => {
      const { ticker, qty, price, type } = trade;
      
      if (!acc[ticker]) {
        acc[ticker] = {
          ticker,
          shares: 0,
          avgCost: 0,
          currency: trade.currency || 'USD'
        };
      }
      
      if (type === 'BUY') {
        const totalCost = acc[ticker].shares * acc[ticker].avgCost + qty * price;
        acc[ticker].shares += qty;
        acc[ticker].avgCost = totalCost / acc[ticker].shares;
      } else {
        // For SELL trades, reduce shares
        acc[ticker].shares -= qty;
      }
      
      return acc;
    }, {});

    // Filter out positions with zero or negative shares
    return Object.values(positionMap).filter(pos => pos.shares > 0);
  }, [realTrades]);

  // Normalize ticker function (EXACT same as dashboard)
  const normalizeTickerForQuote = useCallback((ticker: string): string => {
    // Commodity ticker mapping (must match quote API mapping)
    const COMMODITY_TICKER_MAP: Record<string, string> = {
      'GOLD': 'GC=F',
      'SILVER': 'SI=F',
      'OIL': 'CL=F',
      'CRUDE OIL': 'CL=F',
      'BRENT': 'BZ=F',
      'NATURAL GAS': 'NG=F',
      'COPPER': 'HG=F',
      'PLATINUM': 'PL=F',
      'PALLADIUM': 'PA=F',
      'CORN': 'ZC=F',
      'WHEAT': 'ZW=F',
      'SOYBEAN': 'ZS=F',
      'SUGAR': 'SB=F',
      'COFFEE': 'KC=F',
      'COTTON': 'CT=F',
      'US TECH 100': '^NDX',
      'NASDAQ 100': '^NDX',
      'S&P 500': '^GSPC',
      'DOW JONES': '^DJI',
      'FTSE 100': '^FTSE',
      'DAX': '^GDAXI',
      'NIKKEI 225': '^N225'
    };
    
    const trimmed = ticker.trim().toUpperCase();
    
    // Check commodity map FIRST (must match quote API logic)
    if (COMMODITY_TICKER_MAP[trimmed]) {
      return COMMODITY_TICKER_MAP[trimmed];
    }
    
    let baseTicker = trimmed;
    // Handle exchange suffixes (e.g., "TSLA:US" -> "TSLA")
    if (/^[A-Z0-9]+:[A-Z0-9]+$/i.test(trimmed)) {
      baseTicker = trimmed.split(':')[0];
    } else if (/^[A-Z0-9]+\/[A-Z0-9]+$/i.test(trimmed)) {
      baseTicker = trimmed.split('/')[0];
    } else if (/^[A-Z0-9]+\-[A-Z0-9]+$/i.test(trimmed)) {
      baseTicker = trimmed.split('-')[0];
    }
    
    // For UK stocks, add .L suffix for London Stock Exchange (must match quote API)
    const UK_STOCKS = ['HSBA', 'ULVR', 'VOD', 'BP', 'RDS', 'RDS-A', 'RDS-B', 'GSK', 'AZN', 'BATS', 'BT', 'LLOY', 'BARC', 'RBS', 'TSCO', 'SBRY', 'MKS', 'NXT', 'ASOS', 'JD', 'ITV', 'PSN', 'BA', 'RR', 'BDEV', 'TW', 'PURP', 'III', 'SMT', 'FGT'];
    if (UK_STOCKS.includes(baseTicker)) {
      return `${baseTicker}.L`;
    }
    
    // For crypto, Yahoo Finance uses BTC-USD format
    const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'LINK', 'UNI', 'ATOM', 'ALGO', 'XRP', 'DOGE', 'LTC', 'BCH', 'ETC', 'XLM', 'TRX', 'EOS'];
    if (CRYPTO_SYMBOLS.includes(baseTicker)) {
      return `${baseTicker}-USD`;
    }
    
    return baseTicker;
  }, []);

  // Get tickers for quote fetching - MUST normalize BEFORE passing to API
  const tickers = useMemo(() => {
    return calculatedPositions.map(pos => normalizeTickerForQuote(pos.ticker));
  }, [calculatedPositions, normalizeTickerForQuote]);

  // Fetch current prices with normalized tickers
  const { data: quotesData } = useQuotes(tickers);

  // Calculate final positions with current prices and values
  const positionsWithPrices = useMemo(() => {
    return calculatedPositions.map(position => {
      const normalizedTicker = normalizeTickerForQuote(position.ticker);
      // For UK stocks, the quote API returns the symbol without .L (e.g., "VOD" not "VOD.L")
      // So we need to look up using the original ticker, not the normalized one with .L
      const lookupTicker = normalizedTicker.endsWith('.L') ? normalizedTicker.replace('.L', '') : normalizedTicker;
      // Handle exchange suffixes like "TSLA:US" - try with and without the suffix
      const tickerWithoutSuffix = position.ticker.includes(':') ? position.ticker.split(':')[0] : position.ticker;
      // Try normalized ticker first (e.g., "GC=F" for "GOLD"), then base ticker, then original, then without suffix
      // EXACT same lookup logic as dashboard
      const quote = quotesData?.[lookupTicker] || quotesData?.[normalizedTicker] || quotesData?.[normalizedTicker.split('-')[0]] || quotesData?.[normalizedTicker.split('=')[0]] || quotesData?.[position.ticker] || quotesData?.[tickerWithoutSuffix];
      
      let currentPrice = 0;
      let currency = position.currency;
      
      if (quote && typeof quote === 'object' && 'price' in quote && quote.price !== null && quote.price !== undefined && quote.price > 0) {
        // Convert GBp (pence) to GBP (pounds) for UK stocks
        if (quote.currency === 'GBp') {
          currentPrice = quote.price / 100;
          currency = 'GBP';
        } else {
          currentPrice = quote.price;
          currency = quote.currency || position.currency;
        }
      } else {
        // Set default values when no quote data is available (same as dashboard)
        currentPrice = 0;
      }

      const currentValue = currentPrice * position.shares;
      
      return {
        ticker: position.ticker,
        shares: position.shares,
        value: currentValue,
        currency: currency
      };
    });
  }, [calculatedPositions, quotesData, normalizeTickerForQuote]);

  // Calculate total value and allocations
  const portfolioData = useMemo(() => {
    const totalValue = positionsWithPrices.reduce((sum, pos) => sum + pos.value, 0);
    
    // Determine primary currency (most common currency in portfolio)
    const currencyCounts: { [key: string]: number } = {};
    positionsWithPrices.forEach(pos => {
      currencyCounts[pos.currency] = (currencyCounts[pos.currency] || 0) + 1;
    });
    const primaryCurrency = Object.keys(currencyCounts).reduce((a, b) => 
      currencyCounts[a] > currencyCounts[b] ? a : b, 'GBP'
    );
    
    const positions = positionsWithPrices.map(pos => ({
      ticker: pos.ticker,
      shares: pos.shares,
      value: pos.value,
      allocation: totalValue > 0 ? Math.round((pos.value / totalValue) * 100) : 0,
      currency: pos.currency
    }));

    return {
      clientName: clientName,
      totalValue: totalValue || 0,
      positions: positions,
      primaryCurrency: primaryCurrency
    };
  }, [positionsWithPrices, clientName]);

  // Track page view on mount
  useEffect(() => {
    trackToolPageView('advisor_tool');
  }, []);

  // Check for corporate license from authenticated user's subscription
  useEffect(() => {
    const checkCorporateLicense = async () => {
      setCheckingLicense(true);
      
      if (!isAuthenticated || !user) {
        // Not authenticated - check localStorage as fallback (for legacy users)
        const corporateKey = typeof window !== 'undefined' 
          ? localStorage.getItem('CORPORATE_KEY') 
          : null;
        // Also check for founder tier in localStorage
        const cachedTier = typeof window !== 'undefined'
          ? localStorage.getItem('pocket-portfolio-tier')
          : null;
        const hasAccess = corporateKey === 'VALID_CORPORATE_KEY' || cachedTier === 'foundersClub';
        setHasCorporateLicense(hasAccess);
        setCheckingLicense(false);
        return;
      }

      // Check cache first to avoid unnecessary API calls
      const cacheKey = `apiKeys_${user.email}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < 5 * 60 * 1000) { // 5 minutes
          try {
            const data = JSON.parse(cachedData);
            // Grant access if they have corporateLicense OR are foundersClub
            const hasLicense = !!data.corporateLicense || data.tier === 'foundersClub';
            setHasCorporateLicense(hasLicense);
            setCheckingLicense(false);
            return; // Don't fetch if we have fresh cache
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      try {
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        // Fetch corporate license from API
        const response = await fetch('/api/api-keys/user', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Grant access if they have corporateLicense OR are foundersClub
          const hasLicense = !!data.corporateLicense || data.tier === 'foundersClub';
          setHasCorporateLicense(hasLicense);
          
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          
          // Store in localStorage for persistence (optional, for client-side checks)
          if (hasLicense) {
            if (data.corporateLicense) {
              localStorage.setItem('CORPORATE_KEY', data.corporateLicense);
            }
            // Also cache tier for founder access
            if (data.tier === 'foundersClub') {
              localStorage.setItem('pocket-portfolio-tier', 'foundersClub');
            }
          } else {
            localStorage.removeItem('CORPORATE_KEY');
          }
        } else if (response.status === 503) {
          // Quota exceeded - use cached data
          if (cachedData) {
            try {
              const data = JSON.parse(cachedData);
              const hasLicense = !!data.corporateLicense || data.tier === 'foundersClub';
              setHasCorporateLicense(hasLicense);
            } catch (e) {
              // Invalid cache
            }
          } else {
            // Fallback to localStorage check
            const corporateKey = typeof window !== 'undefined' 
              ? localStorage.getItem('CORPORATE_KEY') 
              : null;
            const cachedTier = typeof window !== 'undefined'
              ? localStorage.getItem('pocket-portfolio-tier')
              : null;
            const hasAccess = corporateKey === 'VALID_CORPORATE_KEY' || cachedTier === 'foundersClub';
            setHasCorporateLicense(hasAccess);
          }
        } else {
          // API call failed - fallback to localStorage check
          const corporateKey = typeof window !== 'undefined' 
            ? localStorage.getItem('CORPORATE_KEY') 
            : null;
          const cachedTier = typeof window !== 'undefined'
            ? localStorage.getItem('pocket-portfolio-tier')
            : null;
          const hasAccess = corporateKey === 'VALID_CORPORATE_KEY' || cachedTier === 'foundersClub';
          setHasCorporateLicense(hasAccess);
        }
      } catch (error) {
        console.error('Error checking corporate license:', error);
        // Use cached data on error
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);
            const hasLicense = !!data.corporateLicense || data.tier === 'foundersClub';
            setHasCorporateLicense(hasLicense);
          } catch (e) {
            // Invalid cache, fallback to localStorage
            const corporateKey = typeof window !== 'undefined' 
              ? localStorage.getItem('CORPORATE_KEY') 
              : null;
            const cachedTier = typeof window !== 'undefined'
              ? localStorage.getItem('pocket-portfolio-tier')
              : null;
            const hasAccess = corporateKey === 'VALID_CORPORATE_KEY' || cachedTier === 'foundersClub';
            setHasCorporateLicense(hasAccess);
          }
        } else {
          // Fallback to localStorage on error
          const corporateKey = typeof window !== 'undefined' 
            ? localStorage.getItem('CORPORATE_KEY') 
            : null;
          const cachedTier = typeof window !== 'undefined'
            ? localStorage.getItem('pocket-portfolio-tier')
            : null;
          const hasAccess = corporateKey === 'VALID_CORPORATE_KEY' || cachedTier === 'foundersClub';
          setHasCorporateLicense(hasAccess);
        }
      } finally {
        setCheckingLicense(false);
      }
    };

    checkCorporateLicense();
  }, [user, isAuthenticated]);

  // Use sample data if no real trades exist
  const displayData = useMemo(() => {
    if (portfolioData.positions.length === 0) {
      // Show sample data when no real portfolio exists
      return {
        clientName: clientName,
        totalValue: 125000,
        positions: [
          { ticker: 'AAPL', shares: 100, value: 17500, allocation: 14, currency: 'GBP' },
          { ticker: 'MSFT', shares: 50, value: 18750, allocation: 15, currency: 'GBP' },
          { ticker: 'GOOGL', shares: 75, value: 11250, allocation: 9, currency: 'GBP' },
          { ticker: 'TSLA', shares: 200, value: 50000, allocation: 40, currency: 'GBP' },
          { ticker: 'NVDA', shares: 30, value: 15000, allocation: 12, currency: 'GBP' },
          { ticker: 'AMZN', shares: 40, value: 12500, allocation: 10, currency: 'GBP' },
        ],
        primaryCurrency: 'GBP'
      };
    }
    return portfolioData;
  }, [portfolioData, clientName]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      trackToolError('advisor_tool', 'invalid_file_type', {
        fileType: file.type,
        fileSize: file.size
      });
      setAlertModal({
        isOpen: true,
        title: 'Invalid File Type',
        message: 'Please upload an image file (PNG, JPG, or SVG).',
        type: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      trackToolError('advisor_tool', 'file_too_large', {
        fileSize: file.size,
        maxSize: 5 * 1024 * 1024
      });
      setAlertModal({
        isOpen: true,
        title: 'File Too Large',
        message: 'Logo file must be less than 5MB. Please compress your image and try again.',
        type: 'error'
      });
      return;
    }

    setLogoFile(file);

    // Track logo upload
    trackToolInteraction('advisor_tool', 'logo_upload', {
      fileSize: file.size
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!hasCorporateLicense) {
      trackToolError('advisor_tool', 'license_required', {
        hasLogo: !!logo
      });
      setAlertModal({
        isOpen: true,
        title: 'Corporate License Required',
        message: 'To generate high-res PDFs for clients without watermarks, you need a Corporate License ($100/mo) or Founder\'s Club membership.\n\nPreview is available for free. Get your Corporate License at pocketportfolio.app/sponsor',
        type: 'warning'
      });
      return;
    }

    try {
      trackToolInteraction('advisor_tool', 'logo_upload', {
        hasCorporateLicense: true,
        hasLogo: !!logo,
      });

      setAlertModal({
        isOpen: true,
        title: 'Generating PDF',
        message: 'Building your institutional-grade portfolio report…',
        type: 'info',
      });

      const firmLogoNaturalSize = logo ? await loadImageNaturalSize(logo) : null;

      const reportPayload: PortfolioReportInput = {
        clientName: displayData.clientName,
        reportDate: formatReportDate(),
        totalValue: displayData.totalValue,
        primaryCurrency: displayData.primaryCurrency || 'GBP',
        positions: displayData.positions,
        firmLogoDataUrl: logo,
        firmLogoNaturalSize,
        showWatermark: false,
      };

      const filename = `portfolio-report-${displayData.clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      await downloadPortfolioReportPdf(reportPayload, filename);

      // Track success
      trackToolSuccess('advisor_tool', {
        hasCorporateLicense: true,
        hasLogo: !!logo
      });

      trackToolDownload('advisor_tool', 'pdf', {
        hasCorporateLicense: true,
        hasLogo: !!logo
      });

      // Show success message
      setAlertModal({
        isOpen: true,
        title: 'PDF Generated!',
        message: 'Your portfolio report PDF has been downloaded successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      trackToolError('advisor_tool', 'pdf_generation_failed', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        hasLogo: !!logo
      });

      setAlertModal({
        isOpen: true,
        title: 'PDF Generation Failed',
        message: error instanceof Error 
          ? `Failed to generate PDF: ${error.message}. Please try again or contact support.` 
          : 'Failed to generate PDF. Please try again or contact support.',
        type: 'error'
      });
    }
  }, [hasCorporateLicense, logo, displayData]);

  return (
    <>
      <div className="advisor-glass-panel">
      {/* Client Name Editor */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          Client Name
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter client name"
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-elevated)',
            color: 'var(--text)',
            fontSize: 'var(--font-size-base)'
          }}
        />
        {portfolioData.positions.length === 0 && (
          <p style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            No portfolio data found. Showing sample data. Import trades to generate real reports.
          </p>
        )}
      </div>

      {/* Logo Upload */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--text)',
          marginBottom: 'var(--space-2)'
        }}>
          Upload Firm Logo (Optional)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {logo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <img
                src={logo}
                alt="Firm Logo"
                style={{
                  height: '64px',
                  width: 'auto',
                  maxWidth: '280px',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
              <button
                onClick={() => {
                  setLogo(null);
                  setLogoFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="brand-link"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2)'
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
              <div style={{
                padding: 'var(--space-3) var(--space-6)',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                transition: 'border-color 0.2s ease',
                background: 'var(--surface-elevated)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              >
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  Click to upload logo (PNG, JPG, SVG - Max 5MB)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
        <p style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)'
        }}>
          Logo files stay in your browser for preview and PDF generation — not uploaded to our servers for this
          workflow.
        </p>
      </div>

      {/* Sovereign report preview — matches vector PDF export */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Live Report Preview
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-4)',
            maxWidth: '640px',
          }}
        >
          Institutional print layout (obsidian / amber). Corporate License exports the same design as
          crisp vector PDF — not a screen screenshot.
        </p>
        <div className="advisor-sovereign-report-wrap">
          <AdvisorPortfolioReport
            clientName={displayData.clientName}
            reportDate={formatReportDate()}
            totalValue={displayData.totalValue}
            primaryCurrency={displayData.primaryCurrency || 'GBP'}
            positions={displayData.positions}
            firmLogoDataUrl={logo}
            showWatermark={!hasCorporateLicense}
          />
        </div>
        {!hasCorporateLicense && (
          <p
            style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            Preview watermark removed with Corporate License
          </p>
        )}
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleDownload}
          className={`brand-button ${hasCorporateLicense ? 'brand-button-primary' : 'brand-button-secondary'}`}
          style={{
            padding: 'var(--space-4) var(--space-8)',
            fontSize: 'var(--font-size-lg)',
            borderColor: hasCorporateLicense ? undefined : 'var(--border-warm)',
          }}
        >
          Download High-Res PDF
        </button>
        {!hasCorporateLicense && (
          <p className="advisor-download-gate">
            Requires Corporate License ($100/mo) •{' '}
            <Link
              href="/sponsor?utm_source=advisor_tool&utm_medium=download_gate&utm_campaign=corporate"
              className="brand-link"
            >
              Get License →
            </Link>
          </p>
        )}
      </div>
    </div>
    
    <AlertModal
      isOpen={alertModal.isOpen}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
      onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
    />
    </>
  );
}
