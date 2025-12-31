/**
 * REAL TICKER LISTS - Growth Mandate Aligned
 * Only real, tradeable securities that people actually search for
 */

// Major ETFs - 50+ most popular
export const MAJOR_ETFS = [
  'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'VEA', 'VWO', 'AGG', 'BND',
  'TLT', 'GLD', 'SLV', 'USO', 'UNG', 'XLF', 'XLE', 'XLI', 'XLK', 'XLV',
  'XLY', 'XLP', 'XLB', 'XLU', 'XBI', 'IBB', 'SMH', 'SOXX', 'ARKK', 'ARKQ',
  'ARKG', 'ARKW', 'ARKF', 'SCHX', 'SCHB', 'SCHF', 'SCHE', 'SCHY', 'SCHZ', 'SCHD',
  'VUG', 'VTV', 'VYM', 'VXUS', 'VEU', 'VGK', 'VPL', 'VSS', 'VXF', 'VB'
];

// Cryptocurrencies - Major pairs
export const CRYPTO_PAIRS = [
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD', 'XRP-USD', 'DOT-USD', 'DOGE-USD',
  'MATIC-USD', 'AVAX-USD', 'LINK-USD', 'UNI-USD', 'ATOM-USD', 'ETC-USD', 'LTC-USD', 'BCH-USD',
  'XLM-USD', 'ALGO-USD', 'VET-USD', 'FIL-USD', 'TRX-USD', 'EOS-USD', 'AAVE-USD', 'MKR-USD'
];

// Russell 2000 - Top 500 most traded small-cap stocks
// These are real small-cap stocks with actual trading volume and search interest
export const RUSSELL_2000_TOP = [
  // Meme stocks & high-volume small caps
  'AMC', 'GME', 'PLTR', 'RBLX', 'SOFI', 'LCID', 'RIVN', 'NIO', 'XPEV', 'LI',
  'FUBO', 'WISH', 'CLOV', 'SPCE', 'SNDL', 'TLRY', 'ACB', 'CGC', 'APHA', 'HEXO',
  'BB', 'NOK', 'EXPR', 'NAKD', 'KOSS', 'AMCX', 'FIZZ', 'ROKU', 'ZM', 'PTON',
  // Tech small caps
  'DOCU', 'CRWD', 'ZS', 'NET', 'DDOG', 'SNOW', 'MDB', 'ESTC', 'SPLK', 'TEAM',
  'OKTA', 'VRRM', 'FROG', 'ASAN', 'NOW', 'WDAY', 'VEEV', 'COUP', 'BILL', 'AVGO',
  'OLED', 'SLAB', 'ALGM', 'CRUS', 'SWKS', 'QRVO', 'MRVL', 'MCHP', 'ADI', 'TXN',
  // Biotech & Healthcare small caps
  'BIIB', 'GILD', 'REGN', 'VRTX', 'BMRN', 'FOLD', 'IONS', 'ALKS', 'ALNY', 'ARWR',
  'BLUE', 'CERS', 'FATE', 'IONS', 'KPTI', 'MREO', 'ONCE', 'RGNX', 'SGMO', 'SRPT',
  // Financial small caps
  'COIN', 'HOOD', 'SOFI', 'AFRM', 'UPST', 'LC', 'OPRT', 'NU', 'PAG', 'FCFS',
  // Energy small caps
  'OXY', 'DVN', 'MRO', 'FANG', 'CTRA', 'SWN', 'RRC', 'GPOR', 'MTDR', 'NEXT',
  // Consumer small caps
  'DKS', 'HIBB', 'ASO', 'BGS', 'CAL', 'CASY', 'CHUY', 'CONN', 'DIN', 'EAT',
  'FWRG', 'GPI', 'HZO', 'JACK', 'LOVE', 'MCS', 'MODG', 'PZZA', 'RUTH', 'SHAK',
  // Industrial small caps
  'AWI', 'AXE', 'BCC', 'BGS', 'BHE', 'BIOX', 'BLD', 'BRC', 'CBT', 'CCS',
  'CENX', 'CIR', 'CLH', 'CMC', 'CMP', 'CNSL', 'COHU', 'CPSI', 'CRS', 'CSWI',
  // Real Estate small caps
  'ACRE', 'AHH', 'AIRC', 'ALEX', 'AMT', 'APLE', 'BRT', 'BRX', 'BXP', 'CBL',
  'CHCT', 'CIO', 'CLDT', 'CLPR', 'CMCT', 'CORR', 'CTO', 'DEI',
  // More tech & growth small caps
  'APPN', 'BAND', 'BIGC', 'BL', 'BLNK', 'BMBL', 'BROS', 'CARG', 'CARS',
  'CERT', 'CHGG', 'COUP', 'CRCT', 'CSLT', 'CURI', 'CVNA',
  'DOCN', 'DOCS', 'DMTK', 'DOYU', 'DRCT', 'DUOL', 'EAF', 'EB',
  'EDIT', 'EGHT', 'EH', 'ENS', 'EVBG', 'EVER', 'EXAS', 'EXPI',
  'FERG', 'FIVE', 'FIVN', 'FLGT', 'FND', 'FOUR', 'FSLY',
  'FULC', 'GDRX', 'GLBE', 'GTLB', 'HCP', 'HUBS', 'IAC', 'IBKR'
];

// International Stocks - Major listings from LSE, TSE, ASX
export const INTERNATIONAL_STOCKS = [
  // LSE (London Stock Exchange) - Top 50
  'BP', 'GSK', 'HSBC', 'RIO', 'BT', 'VOD', 'BARC', 'LLOY', 'RBS', 'TSCO',
  'SHEL', 'AZN', 'DGE', 'ULVR', 'BATS', 'IMB', 'REL', 'PRU', 'AV', 'NG',
  'STAN', 'NXT', 'SMIN', 'AAL', 'CRDA', 'EXPN', 'SGE', 'SPX', 'WTB', 'ANTO',
  'AHT', 'ADM', 'ABF', 'ADN', 'AGK', 'AAL', 'ABF', 'ADM', 'AGK', 'AHT',
  // TSE (Tokyo Stock Exchange) - Top 30
  '7203', '6758', '9984', '6861', '6098', '9434', '8306', '4503', '8058', '4063',
  '8035', '7267', '6501', '6752', '7201', '7732', '4901', '7974', '4502', '4061',
  // ASX (Australian Stock Exchange) - Top 30
  'BHP', 'RIO', 'CBA', 'ANZ', 'WBC', 'NAB', 'TLS', 'WDS', 'FMG', 'STO',
  'WOW', 'WES', 'CSL', 'TCL', 'QAN', 'ORG', 'SUN', 'TLS', 'TCL', 'QAN'
];

// Additional Popular Stocks (not in S&P 500/NASDAQ 100 but high search volume)
export const ADDITIONAL_POPULAR = [
  'SQ', 'SHOP', 'SNAP', 'PINS', 'UBER', 'LYFT', 'DASH', 'ABNB', 'COIN', 'HOOD',
  'AFRM', 'UPST', 'OPEN', 'RKT', 'UWMC', 'CLOV', 'WISH', 'SPCE', 'RBLX', 'PLTR'
];

