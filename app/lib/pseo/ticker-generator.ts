/**
 * pSEO Ticker Generator - REAL TICKERS ONLY
 * Growth Mandate: Real pages for real searches = real traffic
 * Focus: Quality over quantity - only real, tradeable securities
 */

// S&P 500 - Top 500 US stocks
const SP500_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'V', 'JPM', 'WMT', 'PG', 'MA', 'HD', 'DIS', 'BAC', 'ADBE', 'NFLX',
  'CRM', 'PYPL', 'INTC', 'CMCSA', 'PEP', 'TMO', 'COST', 'AVGO', 'ABT', 'CSCO',
  'NKE', 'MRK', 'ACN', 'TXN', 'QCOM', 'DHR', 'VZ', 'LIN', 'NEE', 'BMY',
  'PM', 'HON', 'UPS', 'RTX', 'LOW', 'SPGI', 'INTU', 'AMGN', 'BKNG', 'AMAT',
  'DE', 'ADI', 'GE', 'CAT', 'GS', 'AXP', 'SYK', 'ISRG', 'BLK', 'TJX',
  'GILD', 'MDT', 'ZTS', 'ADP', 'CB', 'CI', 'ELV', 'EQIX', 'FI', 'ICE',
  'KLAC', 'MCHP', 'MNST', 'NXPI', 'ODFL', 'PCAR', 'SNPS', 'SPLK', 'TTD', 'VRSK',
  'WDAY', 'ZBRA', 'A', 'AAL', 'AAP', 'ABBV', 'ABC', 'ABMD', 'ACGL', 'ACN',
  'ADM', 'ADP', 'ADSK', 'AEE', 'AEP', 'AES', 'AFL', 'A', 'AIG', 'AIZ',
  'AJG', 'AKAM', 'ALB', 'ALGN', 'ALK', 'ALL', 'ALLE', 'AMAT', 'AMCR', 'AMD',
  'AME', 'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'ANTM', 'AON', 'AOS',
  'APA', 'APD', 'APH', 'APTV', 'ARE', 'ATO', 'ATVI', 'AVB', 'AVGO', 'AVY',
  'AWK', 'AXP', 'AZO', 'BA', 'BAC', 'BAX', 'BBWI', 'BBY', 'BEN', 'BF.B',
  'BIIB', 'BIO', 'BK', 'BKNG', 'BKR', 'BLK', 'BLL', 'BMY', 'BR', 'BRK.B',
  'BSX', 'BWA', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE',
  'CBRE', 'CCI', 'CCL', 'CDAY', 'CDNS', 'CDW', 'CE', 'CF', 'CFG', 'CHD',
  'CHRW', 'CHTR', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG',
  'CMI', 'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COST', 'CPB', 'CPRT',
  'CPT', 'CRL', 'CRM', 'CSCO', 'CSX', 'CTAS', 'CTLT', 'CTSH', 'CTVA', 'CTXS',
  'CVS', 'CVX', 'CZR', 'D', 'DAL', 'DD', 'DE', 'DFS', 'DG', 'DGX',
  'DHI', 'DHR', 'DIS', 'DISCA', 'DISH', 'DLR', 'DLTR', 'DOCN', 'DOCS', 'DOV',
  'DOW', 'DPZ', 'DRE', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXCM', 'DXPE',
  'EA', 'EBAY', 'ECH', 'ECL', 'ED', 'EFX', 'EIX', 'EL', 'EMN', 'EMR',
  'ENPH', 'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT', 'ES', 'ESS', 'ETN', 'ETR',
  'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR', 'F', 'FANG', 'FAST', 'FBHS',
  'FCX', 'FDS', 'FDX', 'FE', 'FFIV', 'FIS', 'FISV', 'FITB', 'FLT', 'FMC',
  'FOX', 'FOXA', 'FRC', 'FRT', 'FSLR', 'FTNT', 'FTV', 'FWONA', 'FWONK', 'GD',
  'GE', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL', 'GPC',
  'GPN', 'GRMN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA', 'HD', 'HES',
  'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRL', 'HSIC', 'HST',
  'HSY', 'HUM', 'HWM', 'HZN', 'IBM', 'ICE', 'IDXX', 'IEX', 'IFF', 'ILMN',
  'INCY', 'INFO', 'INTC', 'INTU', 'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM',
  'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT', 'JCI', 'JKHY', 'JLL', 'JNJ',
  'JNPR', 'JPM', 'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC', 'KMB',
  'KMI', 'KMX', 'KO', 'KR', 'L', 'LDOS', 'LEG', 'LEN', 'LH', 'LHX',
  'LIN', 'LKQ', 'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LUMN', 'LUV',
  'LVS', 'LW', 'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP',
  'MCK', 'MCO', 'MDLZ', 'MDT', 'MET', 'MGM', 'MHK', 'MKC', 'MKTX', 'MLI',
  'MMC', 'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MPWR', 'MRK', 'MRNA',
  'MRO', 'MS', 'MSCI', 'MSFT', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU', 'NCLH',
  'NDAQ', 'NDSN', 'NEE', 'NEM', 'NFLX', 'NGVT', 'NKE', 'NLOK', 'NLSN', 'NOC',
  'NOV', 'NOW', 'NRG', 'NSC', 'NTAP', 'NTRS', 'NUE', 'NVDA', 'NVR', 'NWL',
  'NWS', 'NWSA', 'NXPI', 'O', 'ODFL', 'OGN', 'OKE', 'OMC', 'ON', 'ORCL',
  'ORLY', 'OTIS', 'OXY', 'PAYC', 'PAYX', 'PBCT', 'PCAR', 'PCG', 'PEAK', 'PEG',
  'PENN', 'PEP', 'PFE', 'PG', 'PGR', 'PH', 'PHM', 'PKG', 'PKI', 'PLD',
  'PM', 'PNC', 'PNR', 'PNW', 'POOL', 'PPG', 'PPL', 'PRGO', 'PRU', 'PSA',
  'PSX', 'PTC', 'PVH', 'PWR', 'PXD', 'PYPL', 'QCOM', 'QRVO', 'RCL', 'RE',
  'REG', 'REGN', 'RF', 'RHI', 'RJF', 'RL', 'RMD', 'ROK', 'ROL', 'ROP',
  'ROST', 'RSG', 'RTX', 'SBAC', 'SBUX', 'SCHW', 'SCI', 'SEE', 'SHW', 'SIVB',
  'SJM', 'SLB', 'SLG', 'SNA', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE', 'STE',
  'STT', 'STX', 'STZ', 'SWK', 'SWKS', 'SYF', 'SYK', 'SYY', 'T', 'TAP',
  'TDG', 'TECH', 'TEL', 'TER', 'TFC', 'TFX', 'TGT', 'TJX', 'TMO', 'TMUS',
  'TPG', 'TROW', 'TRV', 'TSCO', 'TSLA', 'TT', 'TTD', 'TXN', 'TXT', 'TYL',
  'UA', 'UAA', 'UAL', 'UDR', 'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URI',
  'USB', 'V', 'VFC', 'VICI', 'VLO', 'VMC', 'VRSK', 'VRSN', 'VRTX', 'VTR',
  'VTRS', 'VZ', 'WAB', 'WAT', 'WBA', 'WBD', 'WDC', 'WEC', 'WELL', 'WFC',
  'WHR', 'WLTW', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WST', 'WTW', 'WY',
  'WYNN', 'XEL', 'XYL', 'YUM', 'ZBH', 'ZBRA', 'ZION', 'ZTS'
];

// NASDAQ 100 - Top tech and growth stocks
const NASDAQ100_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'COST',
  'NFLX', 'AMD', 'PEP', 'ADBE', 'CSCO', 'CMCSA', 'INTC', 'TXN', 'QCOM', 'AMGN',
  'HON', 'INTU', 'AMAT', 'BKNG', 'ISRG', 'VRTX', 'ADI', 'ADP', 'GILD', 'MU',
  'LRCX', 'SNPS', 'CDNS', 'MELI', 'KLAC', 'NXPI', 'ASML', 'FTNT', 'PAYX', 'CTSH',
  'MCHP', 'MRVL', 'FAST', 'DXCM', 'BKR', 'ODFL', 'XEL', 'ON', 'ANSS', 'TEAM',
  'ZS', 'CRWD', 'FANG', 'ENPH', 'ALGN', 'CDW', 'PCAR', 'CPRT', 'MRNA', 'IDXX',
  'GEHC', 'CTAS', 'AZN', 'AEP', 'DLTR', 'ROST', 'CSGP', 'WBD', 'EXC', 'DASH',
  'KDP', 'CTVA', 'VRSK', 'TTD', 'FRSH', 'GFS', 'ZS', 'DOCN', 'DOCS'
];

// Import real ticker lists
import { 
  MAJOR_ETFS, 
  CRYPTO_PAIRS, 
  RUSSELL_2000_TOP, 
  INTERNATIONAL_STOCKS, 
  ADDITIONAL_POPULAR,
  SP600_STOCKS,
  ADDITIONAL_ETFS_EXPANDED,
  ADDITIONAL_CRYPTO_EXPANDED,
  ADDITIONAL_INTERNATIONAL_EXPANDED,
  OTC_STOCKS,
  ADDITIONAL_REAL_TICKERS,
  MUTUAL_FUNDS,
  FOREX_PAIRS,
  ALTCOIN_GEMS,
  OTC_ADRS
} from './real-tickers';

// Generate REAL ticker list only - no generated patterns
function generateTickerList(): string[] {
  const tickers = new Set<string>();
  
  // Add S&P 500 (500 real stocks)
  SP500_TICKERS.forEach(t => tickers.add(t));
  
  // Add NASDAQ 100 (100 real stocks, may overlap with S&P 500)
  NASDAQ100_TICKERS.forEach(t => tickers.add(t));
  
  // Add Russell 2000 top stocks (7,500+ real small-cap stocks with high search volume)
  RUSSELL_2000_TOP.forEach(t => tickers.add(t));
  
  // Add S&P 600 Small-Cap stocks (~1,000+ real stocks)
  SP600_STOCKS?.forEach(t => tickers.add(t));
  
  // Add Major ETFs (266+ real ETFs)
  MAJOR_ETFS.forEach(t => tickers.add(t));
  
  // Add Additional ETFs (20+ more real ETFs)
  ADDITIONAL_ETFS_EXPANDED?.forEach(t => tickers.add(t));
  
  // Add Cryptocurrencies (100+ major crypto pairs)
  CRYPTO_PAIRS.forEach(t => tickers.add(t));
  
  // Add Additional Crypto (100+ more pairs)
  ADDITIONAL_CRYPTO_EXPANDED?.forEach(t => tickers.add(t));
  
  // Add International Stocks (347+ real international listings)
  INTERNATIONAL_STOCKS.forEach(t => tickers.add(t));
  
  // Add Additional International (184+ more)
  ADDITIONAL_INTERNATIONAL_EXPANDED?.forEach(t => tickers.add(t));
  
  // Add OTC Stocks (270+ popular penny stocks)
  OTC_STOCKS?.forEach(t => tickers.add(t));
  
  // Add Additional Popular stocks (52+ high-search-volume stocks)
  ADDITIONAL_POPULAR.forEach(t => tickers.add(t));
  
  // Add Additional Real Tickers (8,000+ more unique real tickers)
  ADDITIONAL_REAL_TICKERS?.forEach(t => tickers.add(t));
  
  // Add Mutual Funds (~6,000 real mutual fund tickers)
  MUTUAL_FUNDS?.forEach(t => tickers.add(t));
  
  // Add Forex Pairs (~150 major currency pairs)
  FOREX_PAIRS?.forEach(t => tickers.add(t));
  
  // Add Expanded Crypto (~500 additional crypto pairs)
  ALTCOIN_GEMS?.forEach(t => tickers.add(t));
  
  // Add OTC ADRs (~1,000 real OTC/ADR tickers)
  OTC_ADRS?.forEach(t => tickers.add(t));
  
  // NO GENERATED PATTERNS - Only real, tradeable securities
  // This ensures: Real pages for real searches = Real traffic
  // Growth Mandate: Quality over quantity
  
  const uniqueTickers = Array.from(tickers);
  console.log(`[pSEO] Generated ${uniqueTickers.length} REAL tickers (no generated patterns)`);
  
  return uniqueTickers;
}

// Cache the generated list
let cachedTickerList: string[] | null = null;

export function getAllTickersExpanded(): string[] {
  if (!cachedTickerList) {
    cachedTickerList = generateTickerList();
  }
  return cachedTickerList;
}

// Get tickers by category
export function getTickersByCategory(category: 'sp500' | 'nasdaq100' | 'all'): string[] {
  switch (category) {
    case 'sp500':
      return SP500_TICKERS;
    case 'nasdaq100':
      return NASDAQ100_TICKERS;
    case 'all':
      return getAllTickersExpanded();
    default:
      return getAllTickersExpanded();
  }
}

// Get ticker count
export function getTickerCount(): number {
  return getAllTickersExpanded().length;
}

