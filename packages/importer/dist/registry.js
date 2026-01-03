"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADAPTERS = void 0;
exports.detectBroker = detectBroker;
const schwab_1 = require("./adapters/schwab");
const vanguard_1 = require("./adapters/vanguard");
const etrade_1 = require("./adapters/etrade");
const fidelity_1 = require("./adapters/fidelity");
const trading212_1 = require("./adapters/trading212");
const freetrade_1 = require("./adapters/freetrade");
const degiro_1 = require("./adapters/degiro");
const ig_1 = require("./adapters/ig");
const saxo_1 = require("./adapters/saxo");
const interactiveInvestor_1 = require("./adapters/interactiveInvestor");
const revolut_1 = require("./adapters/revolut");
const ibkrFlex_1 = require("./adapters/ibkrFlex");
const kraken_1 = require("./adapters/kraken");
const binance_1 = require("./adapters/binance");
const coinbase_1 = require("./adapters/coinbase");
const koinly_1 = require("./adapters/koinly");
const turbotax_1 = require("./adapters/turbotax");
const ghostfolio_1 = require("./adapters/ghostfolio");
const sharesight_1 = require("./adapters/sharesight");
exports.ADAPTERS = [
    // Order matters! More specific patterns first
    trading212_1.trading212, ibkrFlex_1.ibkrFlex, // Most specific headers
    schwab_1.schwab, vanguard_1.vanguard, etrade_1.etrade, fidelity_1.fidelity, // US brokers
    freetrade_1.freetrade, ig_1.ig, saxo_1.saxo, interactiveInvestor_1.interactiveInvestor, revolut_1.revolut, // UK/EU (without degiro)
    coinbase_1.coinbase, // Crypto (coinbase before degiro - has "Transaction Type" + "Spot Price at Transaction")
    kraken_1.kraken, binance_1.binance, // Crypto (binance before degiro to avoid false match)
    degiro_1.degiro, // UK/EU (after crypto brokers to avoid false matches)
    koinly_1.koinly, turbotax_1.turbotax, ghostfolio_1.ghostfolio, sharesight_1.sharesight // Competitor platforms
];
function detectBroker(sampleCsvHead) {
    const hit = exports.ADAPTERS.find(a => a.detect(sampleCsvHead));
    return hit?.id ?? 'unknown';
}
