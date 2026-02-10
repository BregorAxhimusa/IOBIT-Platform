import { create } from 'zustand';
import type { SpotMeta, SpotAssetCtx, SpotBalance, SpotPair, SpotToken } from '@/lib/hyperliquid/types';
import { parseSpotPairName } from '@/lib/utils/spot-helpers';

export interface SpotMarketData {
  pairName: string;     // e.g. "PURR/USDC"
  base: string;         // e.g. "PURR"
  quote: string;        // e.g. "USDC"
  pairIndex: number;
  midPx: string;
  markPx: string;
  prevDayPx: string;
  dayNtlVlm: string;
  change24h: number;
  circulatingSupply: string;
  baseToken: SpotToken | null;
  quoteToken: SpotToken | null;
}

interface SpotState {
  // Data
  spotMeta: SpotMeta | null;
  spotAssetCtxs: SpotAssetCtx[];
  spotBalances: SpotBalance[];
  selectedSpotPair: SpotPair | null;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Actions
  setSpotMeta: (meta: SpotMeta) => void;
  setSpotAssetCtxs: (ctxs: SpotAssetCtx[]) => void;
  setSpotBalances: (balances: SpotBalance[]) => void;
  selectSpotPair: (pair: SpotPair) => void;
  selectSpotPairByName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  getSpotMarkets: () => SpotMarketData[];
  getSpotPairByName: (name: string) => SpotPair | undefined;
  getTokenByIndex: (index: number) => SpotToken | undefined;
  getBalanceForToken: (tokenName: string) => SpotBalance | undefined;
  getSelectedPairCtx: () => SpotAssetCtx | undefined;
}

export const useSpotStore = create<SpotState>((set, get) => ({
  spotMeta: null,
  spotAssetCtxs: [],
  spotBalances: [],
  selectedSpotPair: null,
  isLoading: false,
  error: null,

  setSpotMeta: (spotMeta) => set({ spotMeta }),

  setSpotAssetCtxs: (spotAssetCtxs) => set({ spotAssetCtxs }),

  setSpotBalances: (spotBalances) => set({ spotBalances }),

  selectSpotPair: (pair) => set({ selectedSpotPair: pair }),

  selectSpotPairByName: (name) => {
    const { spotMeta } = get();
    if (!spotMeta) return;
    const pair = spotMeta.universe.find((p) => p.name === name);
    if (pair) set({ selectedSpotPair: pair });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Computed: Build spot market data from meta + ctxs
  getSpotMarkets: () => {
    const { spotMeta, spotAssetCtxs } = get();
    if (!spotMeta || spotAssetCtxs.length === 0) return [];

    return spotMeta.universe.map((pair, index) => {
      const ctx = spotAssetCtxs[index];
      const { base, quote } = parseSpotPairName(pair.name);

      const currentPrice = parseFloat(ctx?.midPx || ctx?.markPx || '0');
      const prevDayPx = parseFloat(ctx?.prevDayPx || '0');
      const change24h = prevDayPx > 0
        ? ((currentPrice - prevDayPx) / prevDayPx) * 100
        : 0;

      const baseToken = spotMeta.tokens.find((t) => t.index === pair.tokens[0]) || null;
      const quoteToken = spotMeta.tokens.find((t) => t.index === pair.tokens[1]) || null;

      return {
        pairName: pair.name,
        base,
        quote,
        pairIndex: pair.index,
        midPx: ctx?.midPx || '0',
        markPx: ctx?.markPx || '0',
        prevDayPx: ctx?.prevDayPx || '0',
        dayNtlVlm: ctx?.dayNtlVlm || '0',
        change24h,
        circulatingSupply: ctx?.circulatingSupply || '0',
        baseToken,
        quoteToken,
      };
    });
  },

  getSpotPairByName: (name) => {
    const { spotMeta } = get();
    return spotMeta?.universe.find((p) => p.name === name);
  },

  getTokenByIndex: (index) => {
    const { spotMeta } = get();
    return spotMeta?.tokens.find((t) => t.index === index);
  },

  getBalanceForToken: (tokenName) => {
    const { spotBalances } = get();
    return spotBalances.find((b) => b.coin === tokenName);
  },

  getSelectedPairCtx: () => {
    const { spotMeta, spotAssetCtxs, selectedSpotPair } = get();
    if (!spotMeta || !selectedSpotPair) return undefined;
    const idx = spotMeta.universe.findIndex((p) => p.index === selectedSpotPair.index);
    return idx >= 0 ? spotAssetCtxs[idx] : undefined;
  },
}));
