/**
 * OPERATION VELOCITY: Broker Configuration
 * 57 brokers for programmatic SEO expansion (SUPPORTED_BROKERS)
 */

export interface BrokerConfig {
  name: string;
  displayName: string;
  description: string;
  logo: string;
  requiredColumns: string[];
  sampleData: string;
  tips: string[];
}

export const BROKER_CONFIG: Record<string, BrokerConfig> = {
  // Existing 10 brokers
  'etoro': {
    name: 'eToro',
    displayName: 'eToro',
    description: 'Social trading platform with copy trading features',
    logo: '📈',
    requiredColumns: ['Instrument', 'Type', 'Units', 'Open Rate', 'Close Rate', 'PnL'],
    sampleData: 'Instrument,Type,Units,Open Rate,Close Rate,PnL\nAAPL,BUY,10,150.00,155.00,50.00',
    tips: [
      'Export your account statement from eToro',
      'Make sure to include all closed positions',
      'The "Instrument" column should contain stock symbols'
    ]
  },
  'trading212': {
    name: 'Trading212',
    displayName: 'Trading212',
    description: 'Commission-free trading platform',
    logo: '📊',
    requiredColumns: ['Instrument', 'Action', 'Quantity', 'Price', 'Value'],
    sampleData: 'Instrument,Action,Quantity,Price,Value\nAAPL,BUY,10,150.00,1500.00',
    tips: [
      'Use the "Export" feature in Trading212',
      'Include both buy and sell transactions',
      'Check that instrument symbols are correct'
    ]
  },
  'coinbase': {
    name: 'Coinbase',
    displayName: 'Coinbase',
    description: 'Cryptocurrency exchange and wallet',
    logo: '₿',
    requiredColumns: ['Timestamp', 'Transaction Type', 'Asset', 'Quantity Transacted', 'USD Spot Price at Transaction'],
    sampleData: 'Timestamp,Transaction Type,Asset,Quantity Transacted,USD Spot Price at Transaction\n2024-01-01T12:00:00Z,Buy,BTC,0.01,45000.00',
    tips: [
      'Download transaction history from Coinbase Pro',
      'Include all transaction types (buy, sell, convert)',
      'Ensure timestamps are in UTC format'
    ]
  },
  'interactive-brokers': {
    name: 'Interactive Brokers',
    displayName: 'Interactive Brokers',
    description: 'Professional trading platform',
    logo: '🏦',
    requiredColumns: ['Symbol', 'Quantity', 'T.Price', 'Proceeds', 'Comm/Fee'],
    sampleData: 'Symbol,Quantity,T.Price,Proceeds,Comm/Fee\nAAPL,100,150.00,15000.00,1.00',
    tips: [
      'Use the Flex Query feature for detailed reports',
      'Include all transaction fees',
      'Export in CSV format for best compatibility'
    ]
  },
  'revolut': {
    name: 'Revolut',
    displayName: 'Revolut',
    description: 'Digital banking and trading app',
    logo: '💳',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export trading history from Revolut app',
      'Include transaction fees in calculations',
      'Verify instrument symbols match standard format'
    ]
  },
  'freetrade': {
    name: 'Freetrade',
    displayName: 'Freetrade',
    description: 'Commission-free UK trading platform',
    logo: '🇬🇧',
    requiredColumns: ['Date', 'Stock', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Stock,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Download account statement from Freetrade',
      'Include all trade types (buy, sell, dividend)',
      'Check that dates are in correct format'
    ]
  },
  'robinhood': {
    name: 'Robinhood',
    displayName: 'Robinhood',
    description: 'Commission-free trading app',
    logo: '🟢',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Request account statement from Robinhood',
      'Include all transaction types',
      'Verify symbol format matches standard tickers'
    ]
  },
  'webull': {
    name: 'Webull',
    displayName: 'Webull',
    description: 'Advanced trading platform',
    logo: '📱',
    requiredColumns: ['Date', 'Symbol', 'Side', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Side,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export detailed transaction history',
      'Include all order types and fees',
      'Ensure proper date formatting'
    ]
  },
  'schwab': {
    name: 'Charles Schwab',
    displayName: 'Charles Schwab',
    description: 'Full-service investment firm',
    logo: '🏛️',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Use Schwab account statement export',
      'Include all transaction types',
      'Verify commission calculations'
    ]
  },
  'fidelity': {
    name: 'Fidelity',
    displayName: 'Fidelity',
    description: 'Investment and retirement services',
    logo: '💼',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Fidelity',
      'Include all trade types and dividends',
      'Check for proper symbol formatting'
    ]
  },
  
  // Additional 40 brokers for Operation Velocity
  // US Brokers
  'td-ameritrade': {
    name: 'TD Ameritrade',
    displayName: 'TD Ameritrade',
    description: 'Full-service online broker now part of Charles Schwab',
    logo: '🏢',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from TD Ameritrade',
      'Account statements include all trade details',
      'Verify commission and fee columns'
    ]
  },
  'etrade': {
    name: 'E*TRADE',
    displayName: 'E*TRADE',
    description: 'Online brokerage platform now part of Morgan Stanley',
    logo: '💹',
    requiredColumns: ['Trade Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Trade Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Download account statement from E*TRADE',
      'Include all transaction types',
      'Check date format matches requirements'
    ]
  },
  'vanguard': {
    name: 'Vanguard',
    displayName: 'Vanguard',
    description: 'Investment management company and brokerage',
    logo: '⚓',
    requiredColumns: ['Transaction Date', 'Symbol', 'Action', 'Quantity', 'Price'],
    sampleData: 'Transaction Date,Symbol,Action,Quantity,Price\n2024-01-01,AAPL,BUY,10,150.00',
    tips: [
      'Export transaction history from Vanguard',
      'Include dividend reinvestments',
      'Verify fund symbols for ETFs'
    ]
  },
  'm1-finance': {
    name: 'M1 Finance',
    displayName: 'M1 Finance',
    description: 'Automated investing platform with fractional shares',
    logo: '🤖',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Value'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Value\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from M1 Finance',
      'Include fractional share purchases',
      'Verify pie allocation details'
    ]
  },
  'sofi': {
    name: 'SoFi',
    displayName: 'SoFi',
    description: 'Financial services platform with investing features',
    logo: '💸',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export account statement from SoFi',
      'Include all investment transactions',
      'Check for proper symbol formatting'
    ]
  },
  'ally-invest': {
    name: 'Ally Invest',
    displayName: 'Ally Invest',
    description: 'Online discount brokerage',
    logo: '🏦',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Download transaction history from Ally Invest',
      'Include commission and fees',
      'Verify trade execution details'
    ]
  },
  'firstrade': {
    name: 'Firstrade',
    displayName: 'Firstrade',
    description: 'Commission-free online broker',
    logo: '📈',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export account statement from Firstrade',
      'Include all transaction types',
      'Check date format consistency'
    ]
  },
  'public': {
    name: 'Public',
    displayName: 'Public',
    description: 'Social investing platform',
    logo: '👥',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Public',
      'Include fractional share purchases',
      'Verify social feed interactions if needed'
    ]
  },
  'stash': {
    name: 'Stash',
    displayName: 'Stash',
    description: 'Micro-investing and banking app',
    logo: '💰',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export account statement from Stash',
      'Include recurring investments',
      'Check for fractional share details'
    ]
  },
  'acorns': {
    name: 'Acorns',
    displayName: 'Acorns',
    description: 'Automated micro-investing platform',
    logo: '🌰',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Acorns',
      'Include round-up investments',
      'Verify portfolio allocation details'
    ]
  },
  'betterment': {
    name: 'Betterment',
    displayName: 'Betterment',
    description: 'Robo-advisor and investment platform',
    logo: '📊',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Value'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Value\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export account statement from Betterment',
      'Include automated rebalancing transactions',
      'Verify tax-loss harvesting if applicable'
    ]
  },
  'wealthfront': {
    name: 'Wealthfront',
    displayName: 'Wealthfront',
    description: 'Automated investment service',
    logo: '📈',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Wealthfront',
      'Include portfolio rebalancing',
      'Check for tax-optimized transactions'
    ]
  },
  'moomoo': {
    name: 'Moomoo',
    displayName: 'Moomoo',
    description: 'Trading platform with advanced tools',
    logo: '🐮',
    requiredColumns: ['Date', 'Symbol', 'Side', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Side,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Moomoo',
      'Include all order types',
      'Verify commission details'
    ]
  },
  'tradestation': {
    name: 'TradeStation',
    displayName: 'TradeStation',
    description: 'Professional trading platform',
    logo: '💻',
    requiredColumns: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Action,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export detailed transaction reports from TradeStation',
      'Include all order types and strategies',
      'Verify commission and fee calculations'
    ]
  },
  'tastyworks': {
    name: 'Tastyworks',
    displayName: 'Tastyworks',
    description: 'Options and futures trading platform',
    logo: '🎯',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Tastyworks',
      'Include options and futures trades',
      'Verify contract details for derivatives'
    ]
  },
  
  // UK/EU Brokers
  'hargreaves-lansdown': {
    name: 'Hargreaves Lansdown',
    displayName: 'Hargreaves Lansdown',
    description: 'UK investment platform and stockbroker',
    logo: '🇬🇧',
    requiredColumns: ['Date', 'Stock', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Stock,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Hargreaves Lansdown',
      'Include all transaction types',
      'Verify UK tax reporting details'
    ]
  },
  'aj-bell': {
    name: 'AJ Bell',
    displayName: 'AJ Bell',
    description: 'UK investment platform',
    logo: '🔔',
    requiredColumns: ['Date', 'Stock', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Stock,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export account statement from AJ Bell',
      'Include ISA and SIPP transactions',
      'Check for proper date formatting'
    ]
  },
  'ig': {
    name: 'IG',
    displayName: 'IG',
    description: 'UK-based spread betting and CFD broker',
    logo: '📊',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from IG',
      'Include spread betting and CFD trades',
      'Verify margin and leverage details'
    ]
  },
  'saxo': {
    name: 'Saxo Bank',
    displayName: 'Saxo Bank',
    description: 'Danish investment bank and online broker',
    logo: '🏦',
    requiredColumns: ['Trade Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Trade Date,Instrument,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Saxo Bank',
      'Include all asset classes',
      'Verify currency conversion details'
    ]
  },
  'degiro': {
    name: 'DEGIRO',
    displayName: 'DEGIRO',
    description: 'European discount broker',
    logo: '🇪🇺',
    requiredColumns: ['Date', 'Product', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Product,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from DEGIRO',
      'Include all exchanges and markets',
      'Verify commission structure'
    ]
  },
  'xtb': {
    name: 'XTB',
    displayName: 'XTB',
    description: 'European online broker',
    logo: '📈',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from XTB',
      'Include CFD and stock trades',
      'Verify leverage and margin details'
    ]
  },
  'plus500': {
    name: 'Plus500',
    displayName: 'Plus500',
    description: 'CFD trading platform',
    logo: '➕',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'PnL'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,PnL\n2024-01-01,AAPL,BUY,10,150.00,50.00',
    tips: [
      'Export transaction history from Plus500',
      'Include CFD positions',
      'Verify leverage and margin calculations'
    ]
  },
  'cmc-markets': {
    name: 'CMC Markets',
    displayName: 'CMC Markets',
    description: 'UK-based spread betting and CFD broker',
    logo: '📊',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from CMC Markets',
      'Include spread betting and CFD trades',
      'Verify margin requirements'
    ]
  },
  'city-index': {
    name: 'City Index',
    displayName: 'City Index',
    description: 'UK spread betting and CFD broker',
    logo: '🏙️',
    requiredColumns: ['Date', 'Instrument', 'Type', 'Quantity', 'Price', 'Total'],
    sampleData: 'Date,Instrument,Type,Quantity,Price,Total\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from City Index',
      'Include spread betting positions',
      'Verify tax implications for UK residents'
    ]
  },
  'finecobank': {
    name: 'FinecoBank',
    displayName: 'FinecoBank',
    description: 'Italian online bank and broker',
    logo: '🇮🇹',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from FinecoBank',
      'Include all European markets',
      'Verify currency conversion'
    ]
  },
  'scalable-capital': {
    name: 'Scalable Capital',
    displayName: 'Scalable Capital',
    description: 'German robo-advisor and broker',
    logo: '🇩🇪',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Scalable Capital',
      'Include automated portfolio transactions',
      'Verify German tax reporting'
    ]
  },
  'trade-republic': {
    name: 'Trade Republic',
    displayName: 'Trade Republic',
    description: 'German commission-free broker',
    logo: '🇩🇪',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Trade Republic',
      'Include all transaction types',
      'Verify German tax documentation'
    ]
  },
  
  // Crypto Exchanges
  'binance': {
    name: 'Binance',
    displayName: 'Binance',
    description: 'World\'s largest cryptocurrency exchange',
    logo: '🪙',
    requiredColumns: ['Date', 'Type', 'Market', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Market,Amount,Price,Total\n2024-01-01,Buy,BTC/USDT,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Binance',
      'Include all transaction types (spot, futures, staking)',
      'Verify USDT vs USD conversions'
    ]
  },
  'kraken': {
    name: 'Kraken',
    displayName: 'Kraken',
    description: 'US-based cryptocurrency exchange',
    logo: '🐙',
    requiredColumns: ['Date', 'Type', 'Asset', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Asset,Amount,Price,Total\n2024-01-01,Buy,BTC,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Kraken',
      'Include all transaction types',
      'Verify fiat currency conversions'
    ]
  },
  'gemini': {
    name: 'Gemini',
    displayName: 'Gemini',
    description: 'US cryptocurrency exchange',
    logo: '♊',
    requiredColumns: ['Date', 'Type', 'Symbol', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Type,Symbol,Quantity,Price,Amount\n2024-01-01,Buy,BTC,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Gemini',
      'Include all transaction types',
      'Verify USD conversions'
    ]
  },
  'bitfinex': {
    name: 'Bitfinex',
    displayName: 'Bitfinex',
    description: 'Cryptocurrency exchange',
    logo: '₿',
    requiredColumns: ['Date', 'Type', 'Pair', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Pair,Amount,Price,Total\n2024-01-01,Buy,BTC/USD,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Bitfinex',
      'Include margin trading if applicable',
      'Verify USD conversions'
    ]
  },
  'kucoin': {
    name: 'KuCoin',
    displayName: 'KuCoin',
    description: 'Global cryptocurrency exchange',
    logo: '🪙',
    requiredColumns: ['Date', 'Type', 'Market', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Market,Amount,Price,Total\n2024-01-01,Buy,BTC-USDT,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from KuCoin',
      'Include spot and futures trades',
      'Verify USDT conversions'
    ]
  },
  'okx': {
    name: 'OKX',
    displayName: 'OKX',
    description: 'Cryptocurrency exchange',
    logo: '🪙',
    requiredColumns: ['Date', 'Type', 'Market', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Market,Amount,Price,Total\n2024-01-01,Buy,BTC-USDT,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from OKX',
      'Include all trading pairs',
      'Verify USDT conversions'
    ]
  },
  'bybit': {
    name: 'Bybit',
    displayName: 'Bybit',
    description: 'Cryptocurrency derivatives exchange',
    logo: '🪙',
    requiredColumns: ['Date', 'Type', 'Symbol', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Type,Symbol,Quantity,Price,Amount\n2024-01-01,Buy,BTCUSDT,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Bybit',
      'Include derivatives and spot trades',
      'Verify USDT conversions'
    ]
  },
  'gate-io': {
    name: 'Gate.io',
    displayName: 'Gate.io',
    description: 'Cryptocurrency exchange',
    logo: '🚪',
    requiredColumns: ['Date', 'Type', 'Market', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Market,Amount,Price,Total\n2024-01-01,Buy,BTC_USDT,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Gate.io',
      'Include all trading pairs',
      'Verify USDT conversions'
    ]
  },
  'crypto-com': {
    name: 'Crypto.com',
    displayName: 'Crypto.com',
    description: 'Cryptocurrency exchange and wallet',
    logo: '💳',
    requiredColumns: ['Date', 'Type', 'Currency', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Currency,Amount,Price,Total\n2024-01-01,Buy,BTC,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Crypto.com',
      'Include exchange and wallet transactions',
      'Verify fiat currency conversions'
    ]
  },
  'bitstamp': {
    name: 'Bitstamp',
    displayName: 'Bitstamp',
    description: 'European cryptocurrency exchange',
    logo: '🪙',
    requiredColumns: ['Date', 'Type', 'Pair', 'Amount', 'Price', 'Total'],
    sampleData: 'Date,Type,Pair,Amount,Price,Total\n2024-01-01,Buy,BTC/USD,0.01,45000.00,450.00',
    tips: [
      'Export transaction history from Bitstamp',
      'Include all transaction types',
      'Verify USD/EUR conversions'
    ]
  },
  
  // Additional International
  'swissquote': {
    name: 'Swissquote',
    displayName: 'Swissquote',
    description: 'Swiss online bank and broker',
    logo: '🇨🇭',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Swissquote',
      'Include all markets and currencies',
      'Verify Swiss tax reporting'
    ]
  },
  'dbs-vickers': {
    name: 'DBS Vickers',
    displayName: 'DBS Vickers',
    description: 'Singapore-based broker',
    logo: '🇸🇬',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from DBS Vickers',
      'Include Asian market trades',
      'Verify SGD conversions'
    ]
  },
  'questrade': {
    name: 'Questrade',
    displayName: 'Questrade',
    description: 'Canadian online broker',
    logo: '🇨🇦',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Questrade',
      'Include RRSP and TFSA transactions',
      'Verify CAD conversions'
    ]
  },
  'wealthsimple': {
    name: 'Wealthsimple',
    displayName: 'Wealthsimple',
    description: 'Canadian robo-advisor and broker',
    logo: '🇨🇦',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from Wealthsimple',
      'Include automated investments',
      'Verify CAD conversions'
    ]
  },
  'commsec': {
    name: 'CommSec',
    displayName: 'CommSec',
    description: 'Australian online broker',
    logo: '🇦🇺',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from CommSec',
      'Include ASX and international trades',
      'Verify AUD conversions'
    ]
  },
  'selfwealth': {
    name: 'SelfWealth',
    displayName: 'SelfWealth',
    description: 'Australian flat-fee broker',
    logo: '🇦🇺',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Amount'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Amount\n2024-01-01,AAPL,BUY,10,150.00,1500.00',
    tips: [
      'Export transaction history from SelfWealth',
      'Include all transaction types',
      'Verify AUD conversions'
    ]
  },
  'koinly': {
    name: 'Koinly',
    displayName: 'Koinly',
    description: 'Crypto tax software and portfolio tracker',
    logo: '₿',
    requiredColumns: ['Date', 'Type', 'Sent Amount', 'Received Amount', 'Fee Amount'],
    sampleData: 'Date,Type,Sent Amount,Sent Currency,Received Amount,Received Currency,Fee Amount\n2024-01-01,Buy,1000,USD,0.02,BTC,0.001',
    tips: [
      'Export transaction history from Koinly',
      'Include all transaction types (buy, sell, exchange)',
      'Verify currency columns are included'
    ]
  },
  'turbotax': {
    name: 'TurboTax',
    displayName: 'TurboTax',
    description: 'Tax preparation software with investment tracking',
    logo: '📊',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Price'],
    sampleData: 'Date,Symbol,Type,Quantity,Price,Currency\n2024-01-01,AAPL,BUY,10,150.00,USD',
    tips: [
      'Export investment transactions from TurboTax',
      'Ensure Symbol column is included',
      'Check date format matches requirements'
    ]
  },
  'ghostfolio': {
    name: 'Ghostfolio',
    displayName: 'Ghostfolio',
    description: 'Open-source portfolio tracker',
    logo: '👻',
    requiredColumns: ['Date', 'Symbol', 'Type', 'Quantity', 'Unit Price'],
    sampleData: 'Date,Symbol,Type,Quantity,Unit Price,Currency\n2024-01-01,AAPL,BUY,10,150.00,USD',
    tips: [
      'Export transaction history from Ghostfolio',
      'Include all transaction types',
      'Verify currency column is present'
    ]
  },
  'sharesight': {
    name: 'Sharesight',
    displayName: 'Sharesight',
    description: 'Portfolio tracking and tax reporting',
    logo: '📈',
    requiredColumns: ['Date', 'Stock', 'Type', 'Quantity', 'Price'],
    sampleData: 'Date,Stock,Type,Quantity,Price,Currency\n2024-01-01,AAPL,BUY,10,150.00,USD',
    tips: [
      'Export transaction history from Sharesight',
      'Include all trade types',
      'Check that Stock column contains ticker symbols'
    ]
  }
};

export const SUPPORTED_BROKERS = Object.keys(BROKER_CONFIG);







