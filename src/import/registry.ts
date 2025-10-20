import type { BrokerAdapter, BrokerId } from './adapters/types';
import { schwab } from './adapters/schwab';
import { vanguard } from './adapters/vanguard';
import { etrade } from './adapters/etrade';
import { fidelity } from './adapters/fidelity';
import { trading212 } from './adapters/trading212';
import { freetrade } from './adapters/freetrade';
import { degiro } from './adapters/degiro';
import { ig } from './adapters/ig';
import { saxo } from './adapters/saxo';
import { interactiveInvestor } from './adapters/interactiveInvestor';
import { revolut } from './adapters/revolut';
import { ibkrFlex } from './adapters/ibkrFlex';
import { kraken } from './adapters/kraken';
import { binance } from './adapters/binance';
import { coinbase } from './adapters/coinbase';

export const ADAPTERS: BrokerAdapter[] = [
  // Order matters! More specific patterns first
  trading212, ibkrFlex, // Most specific headers
  schwab, vanguard, etrade, fidelity, // US brokers
  freetrade, degiro, ig, saxo, interactiveInvestor, revolut, // UK/EU
  kraken, binance, coinbase // Crypto
];

export function detectBroker(sampleCsvHead: string): BrokerId | 'unknown' {
  const hit = ADAPTERS.find(a => a.detect(sampleCsvHead));
  return hit?.id ?? 'unknown';
}
