/**
 * Conversion Pair Definitions
 * Maps broker-to-tax-software conversion pairs
 */

export interface ConversionPair {
  id: string;
  sourceBroker: string;
  targetSoftware: string;
  sourceBrokerId: string;
  targetSoftwareId: string;
  description: string;
  keywords: string[];
}

export const CONVERSION_PAIRS: ConversionPair[] = [
  {
    id: 'fidelity-to-turbotax',
    sourceBroker: 'Fidelity',
    targetSoftware: 'TurboTax',
    sourceBrokerId: 'fidelity',
    targetSoftwareId: 'turbotax',
    description: 'Convert Fidelity CSV to TurboTax format for easy tax filing',
    keywords: ['fidelity turbotax', 'fidelity csv turbotax', 'convert fidelity to turbotax']
  },
  {
    id: 'schwab-to-turbotax',
    sourceBroker: 'Charles Schwab',
    targetSoftware: 'TurboTax',
    sourceBrokerId: 'schwab',
    targetSoftwareId: 'turbotax',
    description: 'Convert Charles Schwab CSV to TurboTax format for tax filing',
    keywords: ['schwab turbotax', 'charles schwab turbotax', 'schwab csv turbotax']
  },
  {
    id: 'fidelity-to-taxact',
    sourceBroker: 'Fidelity',
    targetSoftware: 'TaxAct',
    sourceBrokerId: 'fidelity',
    targetSoftwareId: 'taxact',
    description: 'Convert Fidelity CSV to TaxAct format for tax preparation',
    keywords: ['fidelity taxact', 'fidelity csv taxact', 'convert fidelity to taxact']
  },
  {
    id: 'vanguard-to-turbotax',
    sourceBroker: 'Vanguard',
    targetSoftware: 'TurboTax',
    sourceBrokerId: 'vanguard',
    targetSoftwareId: 'turbotax',
    description: 'Convert Vanguard CSV to TurboTax format for investment tax filing',
    keywords: ['vanguard turbotax', 'vanguard csv turbotax', 'convert vanguard to turbotax']
  },
  {
    id: 'etrade-to-turbotax',
    sourceBroker: 'E*TRADE',
    targetSoftware: 'TurboTax',
    sourceBrokerId: 'etrade',
    targetSoftwareId: 'turbotax',
    description: 'Convert E*TRADE CSV to TurboTax format for tax filing',
    keywords: ['etrade turbotax', 'etrade csv turbotax', 'convert etrade to turbotax']
  },
  {
    id: 'coinbase-to-koinly',
    sourceBroker: 'Coinbase',
    targetSoftware: 'Koinly',
    sourceBrokerId: 'coinbase',
    targetSoftwareId: 'koinly',
    description: 'Convert Coinbase CSV to Koinly format for crypto tax calculations',
    keywords: ['coinbase koinly', 'coinbase csv koinly', 'convert coinbase to koinly']
  },
  {
    id: 'coinbase-to-taxact',
    sourceBroker: 'Coinbase',
    targetSoftware: 'TaxAct',
    sourceBrokerId: 'coinbase',
    targetSoftwareId: 'taxact',
    description: 'Convert Coinbase CSV to TaxAct format for cryptocurrency tax reporting',
    keywords: ['coinbase taxact', 'coinbase csv taxact', 'convert coinbase to taxact']
  },
  {
    id: 'trading212-to-koinly',
    sourceBroker: 'Trading212',
    targetSoftware: 'Koinly',
    sourceBrokerId: 'trading212',
    targetSoftwareId: 'koinly',
    description: 'Convert Trading212 CSV to Koinly format for UK tax reporting',
    keywords: ['trading212 koinly', 'trading212 csv koinly', 'convert trading212 to koinly']
  },
  {
    id: 'binance-to-koinly',
    sourceBroker: 'Binance',
    targetSoftware: 'Koinly',
    sourceBrokerId: 'binance',
    targetSoftwareId: 'koinly',
    description: 'Convert Binance CSV to Koinly format for crypto tax calculations',
    keywords: ['binance koinly', 'binance csv koinly', 'convert binance to koinly']
  },
  {
    id: 'kraken-to-koinly',
    sourceBroker: 'Kraken',
    targetSoftware: 'Koinly',
    sourceBrokerId: 'kraken',
    targetSoftwareId: 'koinly',
    description: 'Convert Kraken CSV to Koinly format for cryptocurrency tax reporting',
    keywords: ['kraken koinly', 'kraken csv koinly', 'convert kraken to koinly']
  },
  {
    id: 'freetrade-to-koinly',
    sourceBroker: 'Freetrade',
    targetSoftware: 'Koinly',
    sourceBrokerId: 'freetrade',
    targetSoftwareId: 'koinly',
    description: 'Convert Freetrade CSV to Koinly format for UK tax reporting',
    keywords: ['freetrade koinly', 'freetrade csv koinly', 'convert freetrade to koinly']
  }
];

/**
 * Get conversion pair by ID
 */
export function getConversionPair(id: string): ConversionPair | undefined {
  return CONVERSION_PAIRS.find(pair => pair.id === id);
}

/**
 * Get all pairs for a source broker
 */
export function getPairsByBroker(brokerId: string): ConversionPair[] {
  return CONVERSION_PAIRS.filter(pair => pair.sourceBrokerId === brokerId);
}

/**
 * Get all pairs for a target software
 */
export function getPairsBySoftware(softwareId: string): ConversionPair[] {
  return CONVERSION_PAIRS.filter(pair => pair.targetSoftwareId === softwareId);
}

