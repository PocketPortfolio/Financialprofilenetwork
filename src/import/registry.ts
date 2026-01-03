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
import { koinly } from './adapters/koinly';
import { turbotax } from './adapters/turbotax';
import { ghostfolio } from './adapters/ghostfolio';
import { sharesight } from './adapters/sharesight';

export const ADAPTERS: BrokerAdapter[] = [
  // Order matters! More specific patterns first
  trading212, ibkrFlex, // Most specific headers
  schwab, vanguard, etrade, fidelity, // US brokers
  freetrade, ig, saxo, interactiveInvestor, revolut, // UK/EU (without degiro)
  coinbase, // Crypto (coinbase before degiro - has "Transaction Type" + "Spot Price at Transaction")
  kraken, binance, // Crypto (binance before degiro to avoid false match)
  degiro, // UK/EU (after crypto brokers to avoid false matches)
  koinly, turbotax, ghostfolio, sharesight // Competitor platforms
];

export function detectBroker(sampleCsvHead: string): BrokerId | 'unknown' {
  const hit = ADAPTERS.find(a => a.detect(sampleCsvHead));
  return hit?.id ?? 'unknown';
}
