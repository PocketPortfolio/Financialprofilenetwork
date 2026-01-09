import { NextRequest, NextResponse } from 'next/server';
// Rate limiting temporarily disabled for production compatibility
// import { take } from '@/src/lib/ratelimit/memory';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JUA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache"
};

// Map company names to ticker symbols for Yahoo Finance (fallback for legacy data)
const COMPANY_TICKER_MAP: Record<string, string> = {
  'MICROSOFT CORPORATION': 'MSFT',
  'JPMORGAN CHASE & CO.': 'JPM',
  'TESLA, INC.': 'TSLA',
  'VISA INC. CLASS A': 'V',
  'THE COCA‑COLA COMPANY': 'KO',
  'APPLE INC.': 'AAPL',
  'NETFLIX, INC.': 'NFLX',
  'INTEL CORPORATION': 'INTC',
  'THE WALT DISNEY COMPANY': 'DIS',
  'PEPSICO, INC.': 'PEP',
  'TAIWAN SEMICONDUCTOR (ADR)': 'TSM',
  'MERCK & CO., INC.': 'MRK',
  'ADVANCED MICRO DEVICES, INC.': 'AMD',
  'NVIDIA CORPORATION': 'NVDA',
  'ALPHABET INC. CLASS A': 'GOOGL',
  'MASTERCARD INC. CLASS A': 'MA',
  'AMAZON.COM, INC.': 'AMZN',
  'PFIZER INC.': 'PFE',
  'META PLATFORMS, INC. CLASS A': 'META',
  'BERKSHIRE HATHAWAY INC. CLASS B': 'BRK.B'
};

// Map commodity names to Yahoo Finance tickers
const COMMODITY_TICKER_MAP: Record<string, string> = {
  'GOLD': 'GC=F', // Gold futures
  'SILVER': 'SI=F', // Silver futures
  'OIL': 'CL=F', // Crude oil futures
  'CRUDE OIL': 'CL=F',
  'BRENT': 'BZ=F', // Brent crude futures
  'NATURAL GAS': 'NG=F', // Natural gas futures
  'COPPER': 'HG=F', // Copper futures
  'PLATINUM': 'PL=F', // Platinum futures
  'PALLADIUM': 'PA=F', // Palladium futures
  'CORN': 'ZC=F', // Corn futures
  'WHEAT': 'ZW=F', // Wheat futures
  'SOYBEAN': 'ZS=F', // Soybean futures
  'SUGAR': 'SB=F', // Sugar futures
  'COFFEE': 'KC=F', // Coffee futures
  'COTTON': 'CT=F', // Cotton futures
  'US TECH 100': '^NDX', // NASDAQ 100 index
  'NASDAQ 100': '^NDX',
  'S&P 500': '^GSPC',
  'DOW JONES': '^DJI',
  'FTSE 100': '^FTSE',
  'DAX': '^GDAXI',
  'NIKKEI 225': '^N225'
};

// Common crypto symbols that need -USD suffix for Yahoo Finance
const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'LINK', 'UNI', 'ATOM', 'ALGO', 'XRP', 'DOGE', 'LTC', 'BCH', 'ETC', 'XLM', 'TRX', 'EOS', 'AAVE', 'MKR', 'COMP', 'SNX', 'SUSHI', 'YFI', 'CRV', '1INCH', 'BAL', 'BAND', 'BAT', 'BNB', 'CEL', 'CELO', 'CHZ', 'COTI', 'ENJ', 'FIL', 'FLOW', 'GRT', 'ICP', 'KNC', 'MANA', 'NEAR', 'OMG', 'REN', 'SAND', 'SKL', 'SLP', 'STORJ', 'UMA', 'ZEC', 'ZRX']);

// UK stock tickers that need .L suffix for London Stock Exchange
const UK_STOCKS = new Set(['HSBA', 'ULVR', 'VOD', 'BP', 'RDS', 'RDS-A', 'RDS-B', 'GSK', 'AZN', 'BATS', 'BT', 'LLOY', 'BARC', 'RBS', 'TSCO', 'SBRY', 'MKS', 'NXT', 'ASOS', 'JD', 'ITV', 'PSN', 'BA', 'RR', 'BDEV', 'TW', 'PURP', 'III', 'SMT', 'FGT', 'SBRY', 'TSCO', 'MKS', 'NXT', 'ASOS', 'JD', 'ITV', 'PSN', 'BA', 'RR', 'BDEV', 'TW', 'PURP', 'III', 'SMT', 'FGT']);

// Convert company names to ticker symbols
function normalizeSymbols(symbols: string[]): { original: string; ticker: string }[] {
  return symbols.map(symbol => {
    let normalized = symbol.trim().toUpperCase();
    
    // Handle exchange suffixes (e.g., "TSLA:US" -> "TSLA")
    if (normalized.includes(':')) {
      normalized = normalized.split(':')[0];
    }
    
    // Skip invalid/partial company names that are not real tickers
    const invalidPatterns = ['ADR', 'INC.', 'CORPORATION', 'COMPANY', 'CO.', 'LTD', 'LLC', 'INC', 'CORP'];
    if (invalidPatterns.includes(normalized) || normalized.length < 2) {
      console.log(`⚠️ Skipping invalid ticker: "${normalized}"`);
      return { original: symbol, ticker: null }; // Will be filtered out
    }
    
    // Check commodity map FIRST (for "GOLD", "SILVER", "US TECH 100", etc.)
    // This must happen before the "already a ticker" check
    if (COMMODITY_TICKER_MAP[normalized]) {
      const mappedTicker = COMMODITY_TICKER_MAP[normalized];
      console.log(`✅ Commodity mapping: "${normalized}" -> "${mappedTicker}"`);
      return { original: symbol, ticker: mappedTicker };
    }
    
    // If it's already a ticker symbol (1-5 chars, no spaces), use it directly
    if (normalized.length <= 5 && !normalized.includes(' ')) {
      // For UK stocks, add .L suffix for London Stock Exchange
      if (UK_STOCKS.has(normalized)) {
        return { original: symbol, ticker: `${normalized}.L` };
      }
      // For crypto symbols, add -USD suffix for Yahoo Finance
      const ticker = CRYPTO_SYMBOLS.has(normalized) ? `${normalized}-USD` : normalized;
      return { original: symbol, ticker };
    }
    
    // Otherwise, try to map company name to ticker
    const ticker = COMPANY_TICKER_MAP[normalized] || normalized;
    return { original: symbol, ticker };
  }).filter(item => item.ticker !== null); // Remove invalid tickers
}

// Yahoo batch (fast path) - simplified to reduce 401 errors
async function yahooBatch(symbols: string[]) {
  // Skip batch API for now due to frequent 401 errors, rely on individual chart API
  console.log(`Skipping Yahoo batch API to avoid 401 errors, using individual chart API for: ${symbols.join(',')}`);
  return [];
}

// Yahoo chart (compute change%)
async function yahooChart(sym: string) {
  const u = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1m`;
  const r = await fetch(u, { headers: JUA });
  if (!r.ok) throw new Error(`chart_${r.status}`);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  
  // Get current price and previous close from meta data (more reliable)
  const currentPrice = res?.meta?.regularMarketPrice;
  const previousClose = res?.meta?.previousClose;
  
  if (typeof currentPrice === 'number' && typeof previousClose === 'number') {
    const change = currentPrice - previousClose;
    const changePct = (change / previousClose) * 100;
    
    // For UK stocks (.L suffix), return the original ticker without .L in the symbol field
    // This ensures the dashboard can match quotes using the original ticker (e.g., "VOD" not "VOD.L")
    const returnSymbol = sym.endsWith('.L') ? sym.replace('.L', '') : sym.toUpperCase();
    
    return {
      symbol: returnSymbol,
      name: sym.toUpperCase(),
      price: currentPrice,
      change: Number.isFinite(change) ? change : null,
      changePct: Number.isFinite(changePct) ? changePct : null,
      currency: res?.meta?.currency || "",
      source: "yahoo_chart",
    };
  }
  
  // Fallback to old method if meta data is not available
  const px = (res?.indicators?.quote?.[0]?.close || []).filter((n: any) => typeof n === "number");
  if (!px.length) throw new Error("no_px");
  const last = px[px.length - 1];
  const first = px.find((n: any) => typeof n === "number");
  const change = last - first;
  const changePct = first ? (change / first) * 100 : null;
  
  return {
    symbol: sym.toUpperCase(),
    name: sym.toUpperCase(),
    price: last ?? null,
    change: Number.isFinite(change) ? change : null,
    changePct: Number.isFinite(changePct) ? changePct : null,
    currency: res?.meta?.currency || "",
    source: "yahoo_chart",
  };
}

// Stooq fallback
async function stooqTwo(sym: string) {
  const u = `https://stooq.com/q/l/?s=${encodeURIComponent(sym.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`;
  const r = await fetch(u, { headers: { "User-Agent": JUA["User-Agent"], Accept: "text/csv" } });
  if (!r.ok) throw new Error(`stooq_${r.status}`);
  const t = await r.text();
  const [, ...rows] = t.trim().split(/\r?\n/);
  if (!rows.length) throw new Error("stooq_empty");
  const cols = rows[0].split(",");
  const close = parseFloat(cols[6]); // Close
  const open = parseFloat(cols[3]); // Open
  const change = Number.isFinite(close) && Number.isFinite(open) ? close - open : null;
  const changePct = Number.isFinite(change) && change !== null && open ? (change / open) * 100 : null;
  return { price: Number.isFinite(close) ? close : null, change, changePct, currency: "" };
}

export async function GET(request: NextRequest) {
  // Rate limiting disabled for production compatibility
  // const ip = request.headers.get('x-forwarded-for') ?? 'local';
  // const { allowed, remaining, resetAt } = take(`quote:${ip}`, 100, 60_000);
  // if (!allowed) { return 429 response }

  try {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get("symbols") || "").trim();
    const symbols = [...new Set(raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 100);
    
    if (!symbols.length) {
      return NextResponse.json([]);
    }

    // Normalize company names to ticker symbols
    const normalizedSymbols = normalizeSymbols(symbols);
    const tickers = [...new Set(normalizedSymbols.map(n => n.ticker))];
    
    
    
    console.log('🔥 Normalized symbols:', normalizedSymbols);
    console.log('🔥 Unique tickers:', tickers);

    // 1) Try Yahoo batch
    let batch: any[] = [];
    try {
      batch = await yahooBatch(tickers);
      console.log('🔥 Yahoo batch response:', batch);
    } catch (error) {
      console.warn('Yahoo batch failed:', error);
    }

    const by = new Map(batch.map((r) => [r.symbol, r]));
    console.log('🔥 Batch map:', Array.from(by.entries()));
    const out: any[] = [];

    // 2) Ensure price/changePct per symbol with chart → stooq fallbacks
    for (const { original, ticker } of normalizedSymbols) {
      // Use normalized ticker as the symbol (not original) to ensure consistent lookup
      let rec = by.get(ticker) || {
        symbol: ticker, // Use normalized ticker, not original
        name: original,
        price: null,
        change: null,
        changePct: null,
        currency: "",
        source: "none",
      };

      if (rec.changePct == null || rec.price == null) {
        try {
          const c = await yahooChart(ticker);
          // Use the complete chart data if available
          if (c.price !== null) {
            rec.symbol = c.symbol; // Use the symbol from yahooChart (strips .L for UK stocks)
            rec.name = c.name;
            rec.price = c.price;
            rec.change = c.change;
            rec.changePct = c.changePct;
            rec.currency = c.currency;
            rec.source = "yahoo_chart";
          }
        } catch {
          try {
            const s = await stooqTwo(ticker);
            rec.symbol = ticker.toUpperCase(); // Use the normalized ticker as the symbol
            rec.name = ticker.toUpperCase();
            rec.price ??= s.price;
            rec.change ??= s.change;
            rec.changePct ??= s.changePct;
            if (!rec.currency) rec.currency = s.currency;
            if (rec.source === "none") rec.source = "stooq";
          } catch {
            // Keep normalized ticker as symbol even if quote fetch fails
            rec.symbol = ticker.toUpperCase();
          }
        }
      } else {
        // If we already have data from batch, strip .L for UK stocks to match dashboard lookup
        rec.symbol = ticker.endsWith('.L') ? ticker.replace('.L', '') : ticker.toUpperCase();
        rec.name = original; // Keep original name for display
      }

      out.push(rec);
    }

    console.log('🔥 Final output:', out);
    const src = out.every((x) => x.source === "yahoo") ? "yahoo" : out.every((x) => x.source === "stooq") ? "stooq" : "mixed";
    
    

    return NextResponse.json(out, {
      headers: {
        'Cache-Control': 's-maxage=20, stale-while-revalidate=60',
        'X-Data-Source': src,
        'X-Data-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' }, 
      { status: 500 }
    );
  }
}
