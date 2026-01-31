/**
 * Company Logo Utility
 * Fetches company logos from multiple free sources with fallbacks
 * Ensures logos always display by trying multiple sources
 */

// Polygon.io (now Massive) API key
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'rhT5t2nUFEdemIUpKfr070c4qNGVK235';

// Popular ticker to domain mapping for Clearbit
const TICKER_DOMAIN_MAP: Record<string, string> = {
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'JPM': 'jpmorgan.com',
  'V': 'visa.com',
  'JNJ': 'jnj.com',
  'WMT': 'walmart.com',
  'PG': 'pg.com',
  'MA': 'mastercard.com',
  'UNH': 'unitedhealthgroup.com',
  'HD': 'homedepot.com',
  'DIS': 'thewaltdisneycompany.com',
  'BAC': 'bankofamerica.com',
  'ADBE': 'adobe.com',
  'NFLX': 'netflix.com',
  'CRM': 'salesforce.com',
  'PYPL': 'paypal.com',
  'INTC': 'intel.com',
  'CMCSA': 'comcast.com',
  'PEP': 'pepsico.com',
  'COST': 'costco.com',
  'TMO': 'thermofisher.com',
  'AVGO': 'broadcom.com',
  'CSCO': 'cisco.com',
  'ABBV': 'abbvie.com',
  'WFC': 'wellsfargo.com',
  'NKE': 'nike.com',
  'MRK': 'merck.com',
  'TXN': 'ti.com',
  'PM': 'altria.com',
  'RTX': 'rtx.com',
  'HON': 'honeywell.com',
  'QCOM': 'qualcomm.com',
  'AMGN': 'amgen.com',
  'IBM': 'ibm.com',
  'AMAT': 'amat.com',
  'GE': 'ge.com',
  'CAT': 'caterpillar.com',
  'AXP': 'americanexpress.com',
  'GS': 'goldmansachs.com',
  'AMD': 'amd.com',
  'BKNG': 'bookingholdings.com',
  'SBUX': 'starbucks.com',
  'GILD': 'gilead.com',
  'MDT': 'medtronic.com',
  'ISRG': 'intuitivesurgical.com',
  'VRTX': 'vertexpharma.com',
  'ADI': 'analog.com',
  'REGN': 'regeneron.com',
  'LRCX': 'lamresearch.com',
  'PANW': 'paloaltonetworks.com',
  'CDNS': 'cadence.com',
  'SNPS': 'synopsys.com',
  'FTNT': 'fortinet.com',
  'KLAC': 'kla.com',
  'NXPI': 'nxp.com',
  'MCHP': 'microchip.com',
  'ON': 'onsemi.com',
  'MPWR': 'monolithicpower.com',
  'SWKS': 'skyworksinc.com',
  'QRVO': 'qorvo.com',
  'CRWD': 'crowdstrike.com',
  'ZS': 'zscaler.com',
  'NET': 'cloudflare.com',
  'DDOG': 'datadoghq.com',
  'TEAM': 'atlassian.com',
  'NOW': 'servicenow.com',
  'DOCN': 'digitalocean.com',
  'ESTC': 'elastic.co',
  'MDB': 'mongodb.com',
  'OKTA': 'okta.com',
  'SPLK': 'splunk.com',
  'WDAY': 'workday.com',
  'ZM': 'zoom.us',
  'DOCU': 'docusign.com',
  'COIN': 'coinbase.com',
  'HOOD': 'robinhood.com',
  'SOFI': 'sofi.com',
  'UPST': 'upstart.com',
  'AFRM': 'affirm.com',
  'SQ': 'block.xyz',
  'SHOP': 'shopify.com',
  'ETSY': 'etsy.com',
  'TGT': 'target.com',
  'LOW': 'lowes.com',
  'LULU': 'lululemon.com',
  'ULTA': 'ulta.com',
  'TSCO': 'tesco.com',
  'ASML': 'asml.com',
  'TSM': 'tsmc.com',
  'SONY': 'sony.com',
  'TM': 'toyota.com',
  'HMC': 'honda.com',
  'NIO': 'nio.com',
  'XPEV': 'xpeng.com',
  'LI': 'lixiang.com',
  'RIVN': 'rivian.com',
  'LCID': 'lucidmotors.com',
  'F': 'ford.com',
  'GM': 'gm.com',
  'STLA': 'stellantis.com',
  'VWAGY': 'volkswagen.com',
  'BMW': 'bmw.com',
  'MBG': 'mercedes-benz.com',
  'RACE': 'ferrari.com',
  'PFE': 'pfizer.com',
  'MRNA': 'modernatx.com',
  'BNTX': 'biontech.de',
  'LLY': 'lilly.com',
  'NVS': 'novartis.com',
  'RHHBY': 'roche.com',
  'GSK': 'gsk.com',
  'AZN': 'astrazeneca.com',
  'BMY': 'bms.com',
  'BIIB': 'biogen.com',
  'ALNY': 'alnylam.com',
  'IONS': 'ionispharma.com',
  'ARWR': 'arrowheadpharma.com',
  'SGMO': 'sangamo.com',
  'BLUE': 'bluebirdbio.com',
  'FOLD': 'amicus.com',
  'RARE': 'ultragenyx.com',
  'SRPT': 'sarepta.com',
  'DYNA': 'dynavax.com',
  'VYGR': 'voyagertherapeutics.com',
  'BEAM': 'beamtherapeutics.com',
  'VERV': 'vervetx.com',
  'CRSP': 'crispr.com',
  'NTLA': 'intellia.com',
  'EDIT': 'editas.com',
  // Crypto
  'BTC': 'bitcoin.org',
  'ETH': 'ethereum.org',
  'BNB': 'binance.com',
  'ADA': 'cardano.org',
  'SOL': 'solana.com',
  'XRP': 'ripple.com',
  'DOGE': 'dogecoin.com',
  'DOT': 'polkadot.network',
  'MATIC': 'polygon.technology',
  'AVAX': 'avax.network',
  'LINK': 'chain.link',
  'UNI': 'uniswap.org',
  'ATOM': 'cosmos.network',
  'ETC': 'ethereumclassic.org',
  'LTC': 'litecoin.org',
  'BCH': 'bitcoincash.org',
  'XLM': 'stellar.org',
  'ALGO': 'algorand.com',
  'VET': 'vechain.org',
  'FIL': 'filecoin.io',
  'TRX': 'tron.network',
  'EOS': 'eos.io',
  'AAVE': 'aave.com',
  'MKR': 'makerdao.com',
  'COMP': 'compound.finance',
  'YFI': 'yearn.finance',
  'SUSHI': 'sushi.com',
  'SNX': 'synthetix.io',
  'CRV': 'curve.fi',
  '1INCH': '1inch.io',
  'ENJ': 'enjin.io',
  'MANA': 'decentraland.org',
  'SAND': 'sandbox.game',
  'AXS': 'axieinfinity.com',
  'GALA': 'gala.com',
  'THETA': 'thetatoken.org',
  'FLOW': 'flow.com',
  'ICP': 'internetcomputer.org',
  'NEAR': 'near.org',
  'FTM': 'fantom.foundation',
  'HBAR': 'hedera.com',
  'EGLD': 'elrond.com',
  'ZIL': 'zilliqa.com',
  'IOTA': 'iota.org',
  'BAT': 'brave.com',
  'ZEC': 'z.cash',
  'DASH': 'dash.org',
  'XMR': 'getmonero.org',
  'GRT': 'thegraph.com',
  'OCEAN': 'oceanprotocol.com',
  'BAND': 'bandprotocol.com',
  'KNC': 'kyber.network',
  'ZRX': '0x.org',
  'REN': 'renproject.io',
  'CVC': 'civic.com',
  'STORJ': 'storj.io',
  'SKL': 'skale.network',
  'ANKR': 'ankr.com',
  'RLC': 'iex.ec',
  'POLY': 'polymath.network',
  'POWR': 'powerledger.io',
  'FUN': 'funfair.io',
  'KMD': 'komodo.io',
  'LSK': 'lisk.io',
  'WAVES': 'wavesplatform.com',
  'NXT': 'nxt.org',
  'ARDR': 'ardorplatform.org',
  'STEEM': 'steem.io',
  'STRAT': 'stratisplatform.com',
  'PART': 'particl.io',
  'QSP': 'quantstamp.com',
  'BTS': 'bitshares.org',
  'XCP': 'counterparty.io',
  'PIVX': 'pivx.org',
  'NAV': 'navcoin.org',
  'MONA': 'monacoin.org',
  'DCR': 'decred.org',
  'VIA': 'viacoin.org',
  'VTC': 'vertcoin.org',
  'GRS': 'groestlcoin.org',
  'AUR': 'auroracoin.org',
  'EMC2': 'einsteinium.org',
  'VRC': 'vericoin.info',
};

/**
 * Get company logo URL with multiple fallback sources
 * Returns the primary source URL (client-side will handle fallbacks)
 */
export function getCompanyLogoUrl(symbol: string, metadata?: any): string {
  const normalizedSymbol = symbol.toUpperCase().replace(/-USD$/, ''); // Remove -USD suffix for crypto
  
  // Source 1: Polygon.io assets (direct logo URL - works for many tickers)
  return `https://assets.polygon.io/logos/${normalizedSymbol.toLowerCase()}/logo.png`;
}

/**
 * Get all fallback logo URLs for client-side fallback handling
 * Returns array of URLs in order of preference (most reliable first)
 */
export function getCompanyLogoFallbacks(symbol: string, metadata?: any): string[] {
  const normalizedSymbol = symbol.toUpperCase().replace(/-USD$/, '');
  const fallbacks: string[] = [];
  
  // Source 1: Clearbit (most reliable, free, no API key needed)
  const domain = TICKER_DOMAIN_MAP[normalizedSymbol] || getDomainFromMetadata(metadata);
  if (domain) {
    fallbacks.push(`https://logo.clearbit.com/${domain}`);
  }
  
  // Source 2: Generic Clearbit pattern (ticker.com)
  const genericDomain = `${normalizedSymbol.toLowerCase()}.com`;
  if (!fallbacks.includes(`https://logo.clearbit.com/${genericDomain}`)) {
    fallbacks.push(`https://logo.clearbit.com/${genericDomain}`);
  }
  
  // Source 3: Alternative generic pattern (ticker.io)
  fallbacks.push(`https://logo.clearbit.com/${normalizedSymbol.toLowerCase()}.io`);
  
  // Source 4: Another pattern (ticker.co)
  fallbacks.push(`https://logo.clearbit.com/${normalizedSymbol.toLowerCase()}.co`);
  
  // Source 5: Polygon.io assets (may have certificate issues, so lower priority)
  fallbacks.push(`https://assets.polygon.io/logos/${normalizedSymbol.toLowerCase()}/logo.png`);
  
  // Source 6: Logo.dev (free alternative)
  fallbacks.push(`https://logo.dev/${normalizedSymbol.toLowerCase()}?token=${normalizedSymbol.toLowerCase()}`);
  
  // Source 7: Financial Modeling Prep (free tier)
  fallbacks.push(`https://financialmodelingprep.com/image-stock/${normalizedSymbol}.png`);
  
  return fallbacks;
}

/**
 * Extract domain from metadata if available
 */
function getDomainFromMetadata(metadata?: any): string | null {
  if (!metadata) return null;
  
  // Try to extract domain from company name or description
  const name = metadata.name || '';
  const description = metadata.description || '';
  
  // Simple domain extraction (can be enhanced)
  const domainPattern = /([a-z0-9-]+\.(com|org|net|io|co|ai|tech|finance|app|dev))/i;
  const match = (name + ' ' + description).match(domainPattern);
  
  return match ? match[1].toLowerCase() : null;
}

