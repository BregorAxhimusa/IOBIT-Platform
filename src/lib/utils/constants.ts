// Hyperliquid API Endpoints (from .env.local)
export const HYPERLIQUID_MAINNET_API = process.env.NEXT_PUBLIC_HYPERLIQUID_MAINNET_API || 'https://api.hyperliquid.xyz';
export const HYPERLIQUID_TESTNET_API = process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET_API || 'https://api.hyperliquid-testnet.xyz';

export const HYPERLIQUID_MAINNET_WS = process.env.NEXT_PUBLIC_HYPERLIQUID_MAINNET_WS || 'wss://api.hyperliquid.xyz/ws';
export const HYPERLIQUID_TESTNET_WS = process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET_WS || 'wss://api.hyperliquid-testnet.xyz/ws';

// Network types
export type Network = 'mainnet' | 'testnet';

// Trading constants
export const MIN_ORDER_SIZE = 0.0001;
export const MAX_LEVERAGE = 50;
export const DEFAULT_LEVERAGE = 1;

// Order types
export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type TimeInForce = 'GTC' | 'IOC' | 'ALO';

// Timeframes for charts
export const CHART_TIMEFRAMES = [
  { label: '1m', value: '1', seconds: 60 },
  { label: '5m', value: '5', seconds: 300 },
  { label: '15m', value: '15', seconds: 900 },
  { label: '1h', value: '60', seconds: 3600 },
  { label: '4h', value: '240', seconds: 14400 },
  { label: '1D', value: '1440', seconds: 86400 },
] as const;

// Popular trading pairs
export const DEFAULT_TRADING_PAIRS = [
  'BTC',
  'ETH',
  'SOL',
  'ARB',
  'OP',
  'MATIC',
  'AVAX',
  'DOGE',
  'PEPE',
  'WIF',
];

// Spot Trading
export const SPOT_QUOTE_TOKEN = 'USDC';
export const SPOT_ASSET_INDEX_OFFSET = 10000;

// UI
export const NAVBAR_HEIGHT = 64;
export const MARKET_INFO_HEIGHT = 48;
export const BOTTOM_PANEL_MIN_HEIGHT = 200;

// Hyperliquid Stats Data API (from .env.local)
export const HYPERLIQUID_STATS_API = process.env.NEXT_PUBLIC_HYPERLIQUID_STATS_API || 'https://stats-data.hyperliquid.xyz';

// Hyperliquid Bridge Contract Addresses (Arbitrum) (from .env.local)
export const HYPERLIQUID_BRIDGE_ADDRESS = (process.env.NEXT_PUBLIC_HYPERLIQUID_BRIDGE_ADDRESS || '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7') as `0x${string}`;
export const USDC_ARBITRUM_ADDRESS = (process.env.NEXT_PUBLIC_USDC_MAINNET_ADDRESS || '0xaf88d065e77c8cC2239327C5EDb3A432268e5831') as `0x${string}`;
export const USDC_TESTNET_ADDRESS = (process.env.NEXT_PUBLIC_USDC_TESTNET_ADDRESS || '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d') as `0x${string}`;
