import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const koinly: BrokerAdapter = {
  id: 'koinly',
  detect: (sample) => {
    const firstLine = sample.split('\n')[0] || '';
    const hasKoinlyDate = /Koinly Date/i.test(firstLine);
    const hasPair = /Pair/i.test(firstLine);
    const hasSentAmount = /Sent Amount/i.test(firstLine);
    const hasReceivedAmount = /Received Amount/i.test(firstLine);
    const hasKoinly = /Koinly/i.test(sample);
    return hasKoinlyDate || (hasPair && hasSentAmount && hasReceivedAmount) || hasKoinly;
  },
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const label = (r['Label'] || r['label'] || '').toUpperCase();
        if (!label || label.includes('DEPOSIT') || label.includes('WITHDRAWAL') || label.includes('TRANSFER') || (label !== 'TRADE' && !label.includes('TRADE'))) {
          continue; // Skip non-trade rows
        }
        
        // Koinly format: Sent Amount / Received Amount determines BUY/SELL
        const sentAmount = toNumber(r['Sent Amount'] ?? r['sent amount'] ?? '0', locale);
        const receivedAmount = toNumber(r['Received Amount'] ?? r['received amount'] ?? '0', locale);
        const sentCurrency = r['Sent Currency'] ?? r['sent currency'] ?? '';
        const receivedCurrency = r['Received Currency'] ?? r['received currency'] ?? '';
        
        // Extract ticker from Pair column (e.g., "BTC-USD" -> "BTC")
        const pair = r['Pair'] ?? r['pair'] ?? '';
        let ticker = '';
        if (pair) {
          // Extract base currency from pair (e.g., "BTC-USD" -> "BTC")
          const pairParts = pair.split('-');
          ticker = pairParts[0] || '';
        }
        
        // Determine trade direction
        let type: 'BUY' | 'SELL' = 'BUY';
        let qty = 0;
        let price = 0;
        let currency = '';
        
        if (sentAmount > 0 && receivedAmount > 0) {
          // Exchange: sent one asset, received another
          // Determine which asset to track based on pair
          if (pair) {
            const pairParts = pair.split('-');
            const baseCurrency = pairParts[0] || sentCurrency;
            const quoteCurrency = pairParts[1] || receivedCurrency;
            
            // If we sent the base currency, it's a SELL
            if (sentCurrency === baseCurrency || !sentCurrency) {
              type = 'SELL';
              ticker = ticker || toTicker(baseCurrency);
              qty = sentAmount;
              price = receivedAmount / sentAmount; // Exchange rate
              currency = quoteCurrency || receivedCurrency || inferCurrency(r, 'USD');
            } else {
              // If we received the base currency, it's a BUY
              type = 'BUY';
              ticker = ticker || toTicker(baseCurrency);
              qty = receivedAmount;
              price = sentAmount / receivedAmount; // Exchange rate
              currency = quoteCurrency || sentCurrency || inferCurrency(r, 'USD');
            }
          } else {
            // No pair info - treat as SELL of sent currency
            type = 'SELL';
            ticker = ticker || toTicker(sentCurrency || '');
            qty = sentAmount;
            price = receivedAmount / sentAmount; // Exchange rate
            currency = receivedCurrency || inferCurrency(r, 'USD');
          }
        } else if (sentAmount > 0) {
          // Sell: sent currency, received fiat or nothing
          type = 'SELL';
          ticker = ticker || toTicker(sentCurrency || (pair ? pair.split('-')[0] : ''));
          qty = sentAmount;
          // Calculate price from received amount (if any) or use USD price
          if (receivedAmount > 0) {
            price = receivedAmount / sentAmount;
            currency = receivedCurrency || sentCurrency || inferCurrency(r, 'USD');
          } else {
            price = toNumber(r['Price'] ?? '0', locale);
            currency = sentCurrency || inferCurrency(r, 'USD');
          }
        } else if (receivedAmount > 0) {
          // Buy: received currency, sent fiat
          type = 'BUY';
          ticker = ticker || toTicker(receivedCurrency || (pair ? pair.split('-')[0] : ''));
          qty = receivedAmount;
          // Calculate price from sent amount (if any) or use USD price
          if (sentAmount > 0) {
            price = sentAmount / receivedAmount;
            currency = sentCurrency || receivedCurrency || inferCurrency(r, 'USD');
          } else {
            price = toNumber(r['Price'] ?? '0', locale);
            currency = receivedCurrency || inferCurrency(r, 'USD');
          }
        } else {
          continue; // Skip rows with no amounts
        }
        
        // Ensure price is positive and valid
        if (!price || price <= 0) {
          price = 1; // Fallback to 1 if calculation fails
        }
        
        const out: NormalizedTrade = {
          date: toISO(r['Koinly Date'] ?? r['koinly date'] ?? r['Date'] ?? r['date'] ?? '', locale),
          ticker: ticker || toTicker(r['Asset'] ?? r['Symbol'] ?? ''),
          type,
          qty,
          price: price || 1, // Fallback to 1 if price calculation fails
          currency: currency || inferCurrency(r, 'USD'),
          fees: toNumber(r['Fee Amount'] ?? r['fee amount'] ?? r['Fee'] ?? '0', locale),
          source: 'koinly',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'koinly', trades, warnings, meta };
  }
};

