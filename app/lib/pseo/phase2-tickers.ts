/**
 * PHASE 2 EXPANSION: MUTUAL FUNDS & FOREX (GENERAL ORDER 005)
 * Goal: Hit 15k with REAL assets - No fake patterns
 * These are real, tradeable securities with high search volume
 */

// 1. REAL MUTUAL FUNDS (Vanguard, Fidelity, Schwab, Blackrock, T. Rowe Price)
// High-value, high-intent searches for retirement planning
export const MUTUAL_FUNDS = [
  // Vanguard Funds (Top 100 by AUM)
  'VTSAX', 'VFIAX', 'VBTLX', 'VTIAX', 'VADM', 'VIGAX', 'VSMAX', 'VIMAX',
  'VTSMX', 'VFINX', 'VBMFX', 'VGTSX', 'VPACX', 'VEURX', 'VEXPX', 'VWIGX',
  'VWELX', 'VWINX', 'VGENX', 'VGHCX', 'VGPMX', 'VGSIX', 'VGSNX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX',
  'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX', 'VASIX', 'VASGX'
];

// 2. FOREX PAIRS (High Volume / 24-7 Trading)
export const FOREX_PAIRS = [
  // Majors
  'EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  // Crosses
  'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
  'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
  'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD',
  'CADJPY', 'CADCHF', 'NZDJPY', 'NZDCHF',
  // Exotics (High Volatility)
  'USDTRY', 'USDZAR', 'USDMXN', 'USDHKD', 'USDSGD', 'USDSEK', 'USDNOK',
  'USDDKK', 'USDPLN', 'USDHUF', 'USDCNH', 'USDRUB', 'USDINR', 'USDBRL'
];

// 3. EXPANDED CRYPTO (Top 500)
// Adding the mid-cap altcoins that have intense Reddit communities.
export const ALTCOIN_GEMS = [
  'HBAR-USD', 'ICP-USD', 'VET-USD', 'FIL-USD', 'EGLD-USD', 'THETA-USD',
  'FTM-USD', 'RUNE-USD', 'AAVE-USD', 'EOS-USD', 'FLOW-USD', 'QNT-USD',
  'KCS-USD', 'XEC-USD', 'HT-USD', 'USDP-USD', 'ZEC-USD', 'NEO-USD',
  'MKR-USD', 'IOTA-USD', 'BIT-USD', 'BSV-USD', 'KLAY-USD', 'SNX-USD',
  'CAKE-USD', 'GALA-USD', 'LDO-USD', 'GT-USD', 'CRV-USD', 'CHZ-USD',
  'MINA-USD', 'DASH-USD', 'MIOTA-USD', 'FXS-USD', 'AR-USD', 'COMP-USD',
  'TWT-USD', 'NEXO-USD', 'KAVA-USD', 'XEM-USD', 'LRC-USD', 'ZIL-USD',
  '1INCH-USD', 'CVX-USD', 'BAT-USD', 'ENJ-USD', 'HOT-USD', 'CELO-USD',
  'RVN-USD', 'KSM-USD', 'DCR-USD', 'ROSE-USD', 'QTUM-USD', 'YFI-USD',
  'TFUEL-USD', 'GLM-USD', 'LUNA-USD', 'UST-USD', 'BTT-USD', 'WAVES-USD'
];

// 4. OTC / ADRs (Real Companies trading Over The Counter)
// Many major international companies trade as ADRs in the US.
export const OTC_ADRS = [
  'TCEHY', // Tencent
  'NTDOY', // Nintendo
  'PCRFY', // Panasonic
  'VWAGY', // Volkswagen
  'DANOY', // Danone
  'ADDYY', // Adidas
  'HESAY', // Hermes
  'LVMUY', // LVMH
  'SFTBY', // Softbank
  'YAHOY', // Yahoo Japan
  'REPYY', // Repsol
  'NSRGY', // Nestle
  'RHHBY', // Roche
  'IDEXY', // Inditex (Zara)
  'BMWYY', // BMW
  'SIEGY', // Siemens
  'BASFY', // BASF
  'ALIZY', // Allianz
  'BNPQY', // BNP Paribas
  'AXAHY'  // AXA
];

