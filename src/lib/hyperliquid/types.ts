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

// ===== PORTFOLIO TYPES =====

export interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: 'B' | 'A';
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  feeToken: string;
  tid: number;
  builderFee?: string;
}

export interface FundingPayment {
  time: number;
  coin: string;
  usdc: string;
  szi: string;
  fundingRate: string;
}

export interface LedgerUpdate {
  time: number;
  hash: string;
  delta: {
    type: string;
    usdc: string;
  };
}

export interface PnLData {
  date: string;
  realizedPnl: number;
  fundingPnl: number;
  totalPnl: number;
  cumulativePnl: number;
  trades: number;
  volume: number;
  fees: number;
}

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  totalRealizedPnl: number;
  totalFunding: number;
  totalFees: number;
  netPnl: number;
  totalVolume: number;
  avgTradeSize: number;
}

// ===== VAULT TYPES =====

export interface VaultSummary {
  vaultAddress: string;
  name: string;
  leader: string;
  leaderCommission: number;
  apr: number;
  tvl: string;
  pnl: string;
  followerCount: number;
  description: string;
  portfolioPeriods: VaultPortfolioPeriod[];
  isClosed: boolean;
  maxDistributable: string;
  maxWithdrawable: string;
  relationship?: {
    type: 'leader' | 'follower';
    equity: string;
  };
}

export interface VaultFollower {
  user: string;
  equity: string;
  pnl: string;
  lockedUntil: number;
  vaultEntryTime: number;
}

export interface VaultPortfolioPeriod {
  period: string;
  pnl: string;
  apr: number;
  vlm: string;
}

export interface VaultDetails {
  summary: VaultSummary;
  followers: VaultFollower[];
  portfolio: Array<{
    coin: string;
    szi: string;
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
  }>;
}

export interface UserVaultEquity {
  vaultAddress: string;
  equity: string;
  pnl: string;
  allTimePnl: string;
  lockedUntil: number;
}

export interface VaultStatsData {
  vaultAddress: string;
  name: string;
  leader: string;
  tvl: number;
  apr30d: number;
  allTimePnl: number;
  followerCount: number;
  leaderCommission: number;
  isClosed: boolean;
}

// ===== SUB-ACCOUNT & API WALLET TYPES =====

export interface SubAccount {
  subAccountUser: string;
  name: string;
  master: string;
  clearinghouseState: UserState | null;
}

export interface ApiWallet {
  address: string;
  name: string | null;
  authorizedUntil: number;
  allowedActions: string[];
}

export type UserRole = 'master' | 'subAccount' | 'apiWallet';

export interface TradingContext {
  type: 'master' | 'subaccount';
  address: string;
  label: string;
  vaultAddress?: string;
}

// ===== REFERRAL TYPES =====

export interface ReferralState {
  user: string;
  cumVlm: string;
  cumRewardedFeesSinceReferred: string;
  cumFeesRewardedToReferrer: string;
  timeJoined: number;
}

export interface ReferrerData {
  code: string;
  referralStates: ReferralState[];
}

export interface ReferrerInfo {
  stage: 'ready' | 'needsVolume';
  data: ReferrerData | null;
}

export interface ReferralInfo {
  referredBy: {
    referrer: string;
    code: string;
  } | null;
  cumVlm: string;
  unclaimedRewards: string;
  claimedRewards: string;
  builderRewards: string;
  referrerState: ReferrerInfo | null;
  rewardHistory: {
    time: number;
    amount: string;
    token: string;
  }[];
}

// ===== STAKING TYPES =====

export interface ValidatorSummary {
  validator: string;
  name: string;
  commission: string;
  stake: string;
  recentBlocks: number;
  isJailed: boolean;
  nJailedByStake: number;
}

export interface Delegation {
  validator: string;
  amount: string;
  lockedUntil: number;
}

export interface StakingState {
  delegated: string;
  undelegated: string;
  totalPendingWithdrawal: string;
  nPendingWithdrawals: number;
}

export interface DelegatorHistoryEvent {
  time: number;
  hash: string;
  delta: {
    delegate?: {
      validator: string;
      amount: string;
      isUndelegate: boolean;
    };
    withdrawal?: {
      amount: string;
    };
    deposit?: {
      amount: string;
    };
  };
}

export interface DelegatorReward {
  time: number;
  source: 'delegation' | 'commission';
  totalAmount: string;
}

// ===== USER FEES TYPES =====

export interface UserFeeTier {
  ntlCutoff: string;
  maker: string;
  taker: string;
}

export interface UserFees {
  activeReferralDiscount: string;
  dailyUserVlm: [string, string][];
  feeSchedule: {
    tiers: UserFeeTier[];
  };
  userCrossRate: string;
  userAddRate: string;
}

// Market types
export type MarketType = 'perp' | 'spot';

// Client config
export interface HyperliquidConfig {
  network: Network;
  apiUrl: string;
  wsUrl: string;
}
