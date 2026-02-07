/**
 * Global broker list for the import dropdown.
 * Supported brokers (with built-in parsers) use their BrokerId; all others use 'generic'
 * and will use Smart Import (column mapping) when selected.
 */
import type { BrokerId } from '@pocket-portfolio/importer';

export type BrokerOptionId = BrokerId | 'generic';

export interface BrokerOption {
  id: BrokerOptionId;
  label: string;
}

/** Supported brokers we have parsers for — keep in sync with packages/importer adapters */
const SUPPORTED: { id: BrokerId; label: string }[] = [
  { id: 'binance', label: 'Binance' },
  { id: 'coinbase', label: 'Coinbase' },
  { id: 'degiro', label: 'DEGIRO' },
  { id: 'etrade', label: 'E*TRADE' },
  { id: 'fidelity', label: 'Fidelity' },
  { id: 'freetrade', label: 'Freetrade' },
  { id: 'ghostfolio', label: 'Ghostfolio' },
  { id: 'ibkr_flex', label: 'Interactive Brokers' },
  { id: 'ig', label: 'IG' },
  { id: 'interactive_investor', label: 'Interactive Investor' },
  { id: 'koinly', label: 'Koinly' },
  { id: 'kraken', label: 'Kraken' },
  { id: 'revolut', label: 'Revolut' },
  { id: 'saxo', label: 'Saxo' },
  { id: 'schwab', label: 'Charles Schwab' },
  { id: 'sharesight', label: 'Sharesight' },
  { id: 'trading212', label: 'Trading212' },
  { id: 'turbotax', label: 'TurboTax' },
  { id: 'vanguard', label: 'Vanguard' },
];

/** Additional global brokers (Smart Import when selected) — alphabetically by label */
const GLOBAL_BROKERS: string[] = [
  'AJ Bell',
  'Ally Invest',
  'Alpaca',
  'Ameritrade',
  'Bittrex',
  'BlockFi',
  'BMO InvestorLine',
  'Borsa Italiana',
  'Boursorama',
  'Capital.com',
  'Capitol One Investing',
  'Celsius',
  'Comdirect',
  'Crypto.com',
  'Dough (formerly DriveWealth)',
  'eToro',
  'Fineco Bank',
  'Firstrade',
  'Gemini',
  'Hargreaves Lansdown',
  'HSBC InvestDirect',
  'iWeb',
  'Lynx',
  'M1 Finance',
  'Merrill Edge',
  'N26',
  'Nexo',
  'Nordnet',
  'Pepperstone',
  'Plus500',
  'Questrade',
  'Robinhood',
  'Saxo Bank',
  'Schwab International',
  'SoFi Invest',
  'Stake',
  'Stash',
  'TD Ameritrade',
  'TradeStation',
  'Trading 212',
  'Uphold',
  'Vanguard UK',
  'Webull',
  'Wealthsimple',
  'XTB',
  'Zacks Trade',
];

const supportedLabels = new Set(SUPPORTED.map((b) => b.label.toLowerCase()));

/** Full list: supported first (with parser id), then global brokers (generic → Smart Import). Sorted by label. */
export const GLOBAL_BROKER_OPTIONS: BrokerOption[] = [
  ...SUPPORTED,
  ...GLOBAL_BROKERS
    .filter((label) => !supportedLabels.has(label.toLowerCase()))
    .map((label): BrokerOption => ({ id: 'generic', label })),
].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
