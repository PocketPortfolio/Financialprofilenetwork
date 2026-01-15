// app/lib/api/insider.ts
import YahooFinance from 'yahoo-finance2';

export interface InsiderTransaction {
  filerName?: string;
  name?: string;
  title?: string;
  position?: string;
  transactionText?: string;
  transactionCode?: string;
  shares?: number;
  value?: number;
  startDate?: number; // Unix timestamp
}

export interface InsiderHolder {
  name?: string;
  relation?: string;
  shares?: number;
  value?: number;
}

export interface InsiderData {
  valid: boolean;
  transactions?: InsiderTransaction[];
  holders?: InsiderHolder[];
  reason?: string;
  quoteType?: string;
}

export async function getInsiderData(symbol: string): Promise<InsiderData> {
  try {
    // Skip during build time (ISR will handle it)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        process.env.NEXT_PHASE === 'phase-development-build';
    
    if (isBuildTime) {
      return { 
        valid: false, 
        transactions: [],
        reason: 'Data will be fetched during ISR revalidation'
      };
    }

    // 1. Instantiate YahooFinance (required in v3)
    const yahooFinance = new YahooFinance();
    
    // 2. Fetch the Data (yahoo-finance2 handles crumb/session automatically)
    const result: any = await yahooFinance.quoteSummary(symbol, {
      modules: ['insiderTransactions', 'insiderHolders', 'quoteType']
    });

    // 3. Validation Guard (Stop fetching for ETFs/Crypto)
    const type = result?.quoteType?.quoteType;
    if (!['EQUITY', 'STOCK', 'REIT'].includes(type || '')) {
      return { 
        valid: false, 
        reason: `Asset type '${type}' does not have insider filings.`,
        quoteType: type
      };
    }

    // 4. Return the Transactions
    const transactions = result.insiderTransactions?.transactions || [];
    const holders = result.insiderHolders?.holders || [];
    
    // Sort by date (newest first) as Yahoo sometimes returns random order
    const sortedTransactions = transactions.sort((a: any, b: any) => {
      const dateA = a.startDate || 0;
      const dateB = b.startDate || 0;
      return dateB - dateA; // Newest first
    });
    
    return {
      valid: true,
      transactions: sortedTransactions.slice(0, 20), // Last 20 transactions
      holders: holders.slice(0, 10), // Top 10 holders
      quoteType: type
    };

  } catch (error: any) {
    console.error(`[Insider Trading] Error fetching insider data for ${symbol}:`, error);
    return { 
      valid: false, 
      transactions: [],
      reason: error.message || 'Failed to fetch insider data'
    };
  }
}

