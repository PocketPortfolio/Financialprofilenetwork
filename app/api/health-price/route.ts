import { NextResponse } from 'next/server';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// ACTUAL Pocket Portfolio data sources (from api/health-price.js)
interface DataSourceHealth {
  name: string;
  status: 'Fresh' | 'Fallback' | 'Unhealthy';
  lastUpdate: string;
  responseTime: number;
  errorRate: number;
  dataQuality: number;
  fallbackSource?: string;
}

interface RAGHealthStatus {
  overallStatus: 'Fresh' | 'Fallback' | 'Unhealthy';
  message: string;
  sources: DataSourceHealth[];
  timestamp: string;
  responseTime: number;
  ragAssessment: {
    fresh: number;
    fallback: number;
    unhealthy: number;
  };
}

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test ACTUAL Pocket Portfolio data sources
    const sourceTests = await Promise.allSettled([
      testYahooQuote(),
      testYahooChart(),
      testStooq()
    ]);

    const sources: DataSourceHealth[] = sourceTests.map((result, index) => {
      const sourceNames = ['Yahoo Finance (Quote)', 'Yahoo Finance (Chart)', 'Stooq'];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: sourceNames[index],
          status: 'Unhealthy',
          lastUpdate: new Date().toISOString(),
          responseTime: 0,
          errorRate: 100,
          dataQuality: 0
        };
      }
    });

    // RAG-based overall assessment
    const freshSources = sources.filter(s => s.status === 'Fresh').length;
    const fallbackSources = sources.filter(s => s.status === 'Fallback').length;
    const unhealthySources = sources.filter(s => s.status === 'Unhealthy').length;
    
    let overallStatus: 'Fresh' | 'Fallback' | 'Unhealthy';
    let message: string;
    
    if (freshSources > 0) {
      overallStatus = 'Fresh';
      message = `${freshSources} primary source(s) operational`;
    } else if (fallbackSources > 0) {
      overallStatus = 'Fallback';
      message = `Using ${fallbackSources} fallback source(s)`;
    } else {
      overallStatus = 'Unhealthy';
      message = 'All data sources unavailable';
    }

    return NextResponse.json({
      overallStatus,
      message,
      sources,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      ragAssessment: {
        fresh: freshSources,
        fallback: fallbackSources,
        unhealthy: unhealthySources
      }
    });

  } catch (error) {
    return NextResponse.json({
      overallStatus: 'Unhealthy',
      message: 'RAG health assessment failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ACTUAL Yahoo Finance Quote API (from api/quote.js)
async function testYahooQuote(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (PocketPortfolio)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.quoteResponse?.result?.[0]) {
      return {
        name: 'Yahoo Finance (Quote)',
        status: 'Fresh',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 0,
        dataQuality: 95
      };
    } else {
      return {
        name: 'Yahoo Finance (Quote)',
        status: 'Fallback',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 10,
        dataQuality: 70
      };
    }
  } catch (error) {
    return {
      name: 'Yahoo Finance (Quote)',
      status: 'Unhealthy',
      lastUpdate: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      errorRate: 100,
      dataQuality: 0
    };
  }
}

// ACTUAL Yahoo Finance Chart API (from api/quote.js)
async function testYahooChart(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  try {
    const response = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1m', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (PocketPortfolio)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.chart?.result?.[0]?.timestamp) {
      return {
        name: 'Yahoo Finance (Chart)',
        status: 'Fresh',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 0,
        dataQuality: 90
      };
    } else {
      return {
        name: 'Yahoo Finance (Chart)',
        status: 'Fallback',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 15,
        dataQuality: 65
      };
    }
  } catch (error) {
    return {
      name: 'Yahoo Finance (Chart)',
      status: 'Unhealthy',
      lastUpdate: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      errorRate: 100,
      dataQuality: 0
    };
  }
}

// ACTUAL Stooq API (from api/quote.js)
async function testStooq(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  try {
    const response = await fetch('https://stooq.com/q/l/?s=aapl&f=sd2t2ohlcv&h&e=csv', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (PocketPortfolio)',
        'Accept': 'text/csv'
      },
      cache: 'no-store'
    });
    
    const responseTime = Date.now() - startTime;
    const csvData = await response.text();
    
    if (response.ok && csvData.includes('AAPL')) {
      return {
        name: 'Stooq',
        status: 'Fresh',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 0,
        dataQuality: 85
      };
    } else {
      return {
        name: 'Stooq',
        status: 'Fallback',
        lastUpdate: new Date().toISOString(),
        responseTime,
        errorRate: 20,
        dataQuality: 60
      };
    }
  } catch (error) {
    return {
      name: 'Stooq',
      status: 'Unhealthy',
      lastUpdate: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      errorRate: 100,
      dataQuality: 0
    };
  }
}