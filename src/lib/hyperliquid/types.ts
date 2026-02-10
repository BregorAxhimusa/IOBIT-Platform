import type { Network } from '../utils/constants';

// Market data types
export interface Market {
  name: string;
  szDecimals: number;
}

export interface AllMids {
  [symbol: string]: string; // symbol -> mid price
}

export interface MarketSummary {
  coin: string;
  markPx: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  funding: string;
  openInterest: string;
}

export interface L2BookData {
  coin: string;
  time: number;
  levels: Array<{
    px: string;
    sz: string;
    n: number;
  }>;
}

export interface L2Book {
  coin: string;
  levels: [
    Array<{ px: string; sz: string; n: number }>, // bids
    Array<{ px: string; sz: string; n: number }>  // asks
  ];
  time: number;
}

export interface Trade {
  coin: string;
  side: string;
  px: string;
  sz: string;
  time: number;
  hash: string;
}

export interface CandleSnapshot {
  t: number;    // timestamp
  T: number;    // close time
  s: string;    // symbol
  i: string;    // interval
  o: string;    // open
  c: string;    // close
  h: string;    // high
  l: string;    // low
  v: string;    // volume
  n: number;    // number of trades
}

export interface UserState {
  assetPositions: Array<{
    position: {
      coin: string;
      szi: string;
      leverage: {
        type: string;
        value: number;
      };
      entryPx: string;
      positionValue: string;
      unrealizedPnl: string;
      returnOnEquity: string;
      liquidationPx: string | null;
    };
    type: string;
  }>;
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  withdrawable: string;
}

export interface OrderResponse {
  status: 'ok' | 'err';
  response: {
    type: 'order';
    data?: {
      statuses: Array<
        | { resting: { oid: number } }
        | { filled: { totalSz: string; avgPx: string; oid: number } }
        | { error: string }
      >;
    };
  };
}

// WebSocket message types
export interface WSSubscription {
  method: 'subscribe' | 'unsubscribe';
  subscription: {
    type: 'allMids' | 'l2Book' | 'trades' | 'candle' | 'userEvents';
    coin?: string;
    interval?: string;
    user?: string;
  };
}

export interface WSMessage {
  channel: string;
  data: unknown;
}

// ===== SPOT TYPES =====

export interface SpotToken {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
}

export interface SpotPair {
  name: string;
  tokens: [number, number]; // [baseTokenIndex, quoteTokenIndex]
  index: number;
  isCanonical: boolean;
}

export interface SpotMeta {
  universe: SpotPair[];
  tokens: SpotToken[];
}

export interface SpotBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
}

export interface SpotClearinghouseState {
  balances: SpotBalance[];
}

export interface SpotAssetCtx {
  dayNtlVlm: string;
  markPx: string;
  midPx: string;
  prevDayPx: string;
  circulatingSupply: string;
}

// Market types
export type MarketType = 'perp' | 'spot';

// Client config
export interface HyperliquidConfig {
  network: Network;
  apiUrl: string;
  wsUrl: string;
}
