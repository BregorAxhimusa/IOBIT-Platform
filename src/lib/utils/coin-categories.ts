export type CoinCategory =
  | 'All'
  | 'Recently Listed'
  | 'Meme'
  | 'Layer 1'
  | 'Layer 2'
  | 'RWA'
  | 'Gaming'
  | 'DeFi'
  | 'NFT'
  | 'Launchpad'
  | 'SOL Ecosystem'
  | 'ETH Ecosystem'
  | 'BNB Ecosystem'
  | 'BTC Ecosystem'
  | '0 Fees';

export const ALL_CATEGORIES: CoinCategory[] = [
  'All',
  'Recently Listed',
  'Meme',
  'Layer 1',
  'Layer 2',
  'RWA',
  'Gaming',
  'DeFi',
  'NFT',
  'Launchpad',
  'SOL Ecosystem',
  'ETH Ecosystem',
  'BNB Ecosystem',
  'BTC Ecosystem',
  '0 Fees',
];

const COIN_CATEGORIES: Record<string, CoinCategory[]> = {
  // Layer 1
  BTC: ['Layer 1', 'BTC Ecosystem'],
  ETH: ['Layer 1', 'ETH Ecosystem'],
  SOL: ['Layer 1', 'SOL Ecosystem'],
  AVAX: ['Layer 1'],
  BNB: ['Layer 1', 'BNB Ecosystem'],
  ADA: ['Layer 1'],
  DOT: ['Layer 1'],
  ATOM: ['Layer 1'],
  NEAR: ['Layer 1'],
  SUI: ['Layer 1'],
  APT: ['Layer 1'],
  SEI: ['Layer 1'],
  TIA: ['Layer 1'],
  INJ: ['Layer 1'],
  FTM: ['Layer 1'],
  TON: ['Layer 1'],
  TRX: ['Layer 1'],
  HYPE: ['Layer 1'],
  XRP: ['Layer 1'],
  LTC: ['Layer 1', 'BTC Ecosystem'],

  // Layer 2
  ARB: ['Layer 2', 'ETH Ecosystem'],
  OP: ['Layer 2', 'ETH Ecosystem'],
  MATIC: ['Layer 2', 'ETH Ecosystem'],
  STRK: ['Layer 2', 'ETH Ecosystem'],
  ZK: ['Layer 2', 'ETH Ecosystem'],
  MANTA: ['Layer 2', 'ETH Ecosystem'],
  BLAST: ['Layer 2', 'ETH Ecosystem'],
  BASE: ['Layer 2', 'ETH Ecosystem'],
  METIS: ['Layer 2', 'ETH Ecosystem'],
  IMX: ['Layer 2', 'ETH Ecosystem', 'Gaming'],
  MNT: ['Layer 2', 'ETH Ecosystem'],

  // Meme
  DOGE: ['Meme'],
  SHIB: ['Meme', 'ETH Ecosystem'],
  PEPE: ['Meme', 'ETH Ecosystem'],
  FLOKI: ['Meme', 'ETH Ecosystem'],
  WIF: ['Meme', 'SOL Ecosystem'],
  BONK: ['Meme', 'SOL Ecosystem'],
  MEME: ['Meme'],
  NEIRO: ['Meme'],
  POPCAT: ['Meme', 'SOL Ecosystem'],
  MEW: ['Meme', 'SOL Ecosystem'],
  MYRO: ['Meme', 'SOL Ecosystem'],
  BRETT: ['Meme'],
  SPX6900: ['Meme'],
  MOG: ['Meme', 'ETH Ecosystem'],
  TURBO: ['Meme', 'ETH Ecosystem'],
  TRUMP: ['Meme', 'SOL Ecosystem'],
  FARTCOIN: ['Meme', 'SOL Ecosystem'],
  AI16Z: ['Meme', 'SOL Ecosystem'],

  // DeFi
  LINK: ['DeFi', 'ETH Ecosystem'],
  UNI: ['DeFi', 'ETH Ecosystem'],
  AAVE: ['DeFi', 'ETH Ecosystem'],
  MKR: ['DeFi', 'ETH Ecosystem'],
  SNX: ['DeFi', 'ETH Ecosystem'],
  CRV: ['DeFi', 'ETH Ecosystem'],
  COMP: ['DeFi', 'ETH Ecosystem'],
  SUSHI: ['DeFi', 'ETH Ecosystem'],
  YFI: ['DeFi', 'ETH Ecosystem'],
  DYDX: ['DeFi', 'ETH Ecosystem'],
  GMX: ['DeFi'],
  JUP: ['DeFi', 'SOL Ecosystem'],
  RAY: ['DeFi', 'SOL Ecosystem'],
  ORCA: ['DeFi', 'SOL Ecosystem'],
  PENDLE: ['DeFi', 'ETH Ecosystem'],
  ENA: ['DeFi', 'ETH Ecosystem'],
  CAKE: ['DeFi', 'BNB Ecosystem'],
  RUNE: ['DeFi'],
  '1INCH': ['DeFi', 'ETH Ecosystem'],
  LDO: ['DeFi', 'ETH Ecosystem'],
  FXS: ['DeFi', 'ETH Ecosystem'],
  ETHFI: ['DeFi', 'ETH Ecosystem'],

  // Gaming / NFT
  AXS: ['Gaming', 'NFT', 'ETH Ecosystem'],
  SAND: ['Gaming', 'NFT', 'ETH Ecosystem'],
  MANA: ['Gaming', 'NFT', 'ETH Ecosystem'],
  GALA: ['Gaming', 'ETH Ecosystem'],
  ILV: ['Gaming', 'ETH Ecosystem'],
  RONIN: ['Gaming', 'ETH Ecosystem'],
  PIXEL: ['Gaming'],
  PORTAL: ['Gaming'],
  APE: ['NFT', 'ETH Ecosystem'],
  BLUR: ['NFT', 'ETH Ecosystem'],

  // RWA
  ONDO: ['RWA', 'ETH Ecosystem'],
  RWA: ['RWA'],
  POLYX: ['RWA'],

  // BNB Ecosystem
  XVS: ['DeFi', 'BNB Ecosystem'],
  ALPACA: ['DeFi', 'BNB Ecosystem'],

  // BTC Ecosystem
  STX: ['BTC Ecosystem', 'Layer 2'],
  ORDI: ['BTC Ecosystem'],
  SATS: ['BTC Ecosystem'],

  // SOL Ecosystem
  PYTH: ['SOL Ecosystem', 'DeFi'],
  JITO: ['SOL Ecosystem', 'DeFi'],
  W: ['SOL Ecosystem'],
  RENDER: ['SOL Ecosystem'],
  HNT: ['SOL Ecosystem'],

  // Launchpad
  BNB_LAUNCHPAD: ['Launchpad', 'BNB Ecosystem'],
};

export function getCoinCategories(symbol: string): CoinCategory[] {
  return COIN_CATEGORIES[symbol.toUpperCase()] || [];
}

export function coinMatchesCategory(symbol: string, category: CoinCategory): boolean {
  if (category === 'All') return true;
  if (category === '0 Fees') return false; // No coins match this currently
  if (category === 'Recently Listed') return false; // Would need API data for this
  return getCoinCategories(symbol).includes(category);
}
