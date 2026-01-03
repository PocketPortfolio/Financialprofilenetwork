import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || 'AAPL').toUpperCase();
  
  const results: any = {
    ticker,
    timestamp: new Date().toISOString(),
    sources: {} as any,
  };
  
  // Test EODHD
  const EODHD_API_KEY = process.env.EODHD_API_KEY || '';
  results.sources.eodhd = {
    hasKey: !!EODHD_API_KEY,
    keyLength: EODHD_API_KEY?.length || 0,
    status: 'not_configured',
    error: null as string | null,
  };
  
  if (EODHD_API_KEY) {
    try {
      const url = `https://eodhistoricaldata.com/api/splits-dividends/${ticker}.US?api_token=${EODHD_API_KEY}&from=2023-01-01&to=2024-12-31`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      
      results.sources.eodhd.status = response.ok ? 'success' : `http_${response.status}`;
      if (response.ok) {
        const data = await response.json();
        results.sources.eodhd.dividendCount = Array.isArray(data) ? data.length : 0;
      } else {
        results.sources.eodhd.error = `HTTP ${response.status}`;
      }
    } catch (error: any) {
      results.sources.eodhd.status = 'error';
      results.sources.eodhd.error = error.message;
    }
  }
  
  // Test Alpha Vantage
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
  results.sources.alphaVantage = {
    hasKey: !!ALPHA_VANTAGE_API_KEY,
    keyLength: ALPHA_VANTAGE_API_KEY?.length || 0,
    status: 'not_configured',
    error: null as string | null,
  };
  
  if (ALPHA_VANTAGE_API_KEY) {
    try {
      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const response = await fetch(url, { cache: 'no-store' });
      
      if (response.ok) {
        const data = await response.json();
        if (data['Note'] || data['Information']) {
          results.sources.alphaVantage.status = 'rate_limited';
          results.sources.alphaVantage.error = data['Note'] || data['Information'];
        } else if (data['Symbol'] === ticker) {
          results.sources.alphaVantage.status = 'success';
          results.sources.alphaVantage.hasDividendYield = !!data['DividendYield'] && data['DividendYield'] !== 'None';
          results.sources.alphaVantage.hasDividendPerShare = !!data['DividendPerShare'] && data['DividendPerShare'] !== 'None';
        } else {
          results.sources.alphaVantage.status = 'invalid_response';
          results.sources.alphaVantage.error = 'Symbol mismatch';
        }
      } else {
        results.sources.alphaVantage.status = `http_${response.status}`;
        results.sources.alphaVantage.error = `HTTP ${response.status}`;
      }
    } catch (error: any) {
      results.sources.alphaVantage.status = 'error';
      results.sources.alphaVantage.error = error.message;
    }
  }
  
  // Test Yahoo Finance API
  const JUA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };
  
  results.sources.yahooFinanceAPI = {
    status: 'testing',
    error: null as string | null,
  };
  
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`;
    const response = await fetch(url, { headers: JUA, cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      const summaryDetail = data?.quoteSummary?.result?.[0]?.summaryDetail;
      if (summaryDetail) {
        results.sources.yahooFinanceAPI.status = 'success';
        results.sources.yahooFinanceAPI.hasDividendYield = !!summaryDetail.dividendYield?.raw;
        results.sources.yahooFinanceAPI.hasDividendRate = !!summaryDetail.dividendRate?.raw;
      } else {
        results.sources.yahooFinanceAPI.status = 'no_data';
        results.sources.yahooFinanceAPI.error = 'No summaryDetail in response';
      }
    } else {
      results.sources.yahooFinanceAPI.status = `http_${response.status}`;
      results.sources.yahooFinanceAPI.error = `HTTP ${response.status}`;
    }
  } catch (error: any) {
    results.sources.yahooFinanceAPI.status = 'error';
    results.sources.yahooFinanceAPI.error = error.message;
  }
  
  // Test Yahoo Finance HTML
  results.sources.yahooFinanceHTML = {
    status: 'testing',
    error: null as string | null,
  };
  
  try {
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: 'no-store',
    });
    
    if (response.ok) {
      const html = await response.text();
      results.sources.yahooFinanceHTML.htmlLength = html.length;
      
      // Check for embedded JSON
      const jsonMatch = html.match(/root\.App\.main\s*=\s*({.+?});/s);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[1]);
          const quoteSummary = jsonData?.context?.dispatcher?.stores?.QuoteSummaryStore?.summaryDetail;
          if (quoteSummary) {
            results.sources.yahooFinanceHTML.status = 'success';
            results.sources.yahooFinanceHTML.hasDividendYield = !!quoteSummary.dividendYield?.raw;
            results.sources.yahooFinanceHTML.hasDividendRate = !!quoteSummary.dividendRate?.raw;
          } else {
            results.sources.yahooFinanceHTML.status = 'no_data';
            results.sources.yahooFinanceHTML.error = 'No quoteSummary in embedded JSON';
          }
        } catch (e: any) {
          results.sources.yahooFinanceHTML.status = 'parse_error';
          results.sources.yahooFinanceHTML.error = `JSON parse error: ${e.message}`;
        }
      } else {
        results.sources.yahooFinanceHTML.status = 'no_json';
        results.sources.yahooFinanceHTML.error = 'No embedded JSON found in HTML';
      }
    } else {
      results.sources.yahooFinanceHTML.status = `http_${response.status}`;
      results.sources.yahooFinanceHTML.error = `HTTP ${response.status}`;
    }
  } catch (error: any) {
    results.sources.yahooFinanceHTML.status = 'error';
    results.sources.yahooFinanceHTML.error = error.message;
  }
  
  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}










