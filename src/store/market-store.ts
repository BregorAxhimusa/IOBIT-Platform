import { create } from 'zustand';

export interface MarketData {
  symbol: string;
  price: string;
  markPrice: string;
  prevDayPrice: string;
  change24h: number; // percentage
  volume24h: string;
  funding: string;
  openInterest: string;
  high24h?: string;
  low24h?: string;
  lastUpdate: number;
}

interface MarketState {
  // Current symbol being viewed
  currentSymbol: string;

  // All markets data (symbol -> data)
  markets: Map<string, MarketData>;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSymbol: (symbol: string) => void;
  updateMarket: (symbol: string, data: Partial<MarketData>) => void;
  updateMarkets: (updates: [string, Partial<MarketData>][]) => void;
  setMarkets: (markets: Map<string, MarketData>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getCurrentMarket: () => MarketData | undefined;
  getMarket: (symbol: string) => MarketData | undefined;
  getAllMarkets: () => MarketData[];
  getMarketsByVolume: () => MarketData[];
}

/**
 * Market Store
 * Menaxhon market data për të gjitha trading pairs
 */
export const useMarketStore = create<MarketState>((set, get) => ({
  currentSymbol: 'BTC',
  markets: new Map(),
  isLoading: false,
  error: null,

  setCurrentSymbol: (symbol) => {
    set({ currentSymbol: symbol.toUpperCase() });
  },

  updateMarket: (symbol, data) => {
    set((state) => {
      const markets = new Map(state.markets);
      const existing = markets.get(symbol) || {
        symbol,
        price: '0',
        markPrice: '0',
        prevDayPrice: '0',
        change24h: 0,
        volume24h: '0',
        funding: '0',
        openInterest: '0',
        lastUpdate: Date.now(),
      };

      markets.set(symbol, {
        ...existing,
        ...data,
        lastUpdate: Date.now(),
      });

      return { markets };
    });
  },

  updateMarkets: (updates) => {
    set((state) => {
      const markets = new Map(state.markets);

      updates.forEach(([symbol, data]) => {
        const existing = markets.get(symbol) || {
          symbol,
          price: '0',
          markPrice: '0',
          prevDayPrice: '0',
          change24h: 0,
          volume24h: '0',
          funding: '0',
          openInterest: '0',
          lastUpdate: Date.now(),
        };

        markets.set(symbol, {
          ...existing,
          ...data,
          lastUpdate: Date.now(),
        });
      });

      return { markets };
    });
  },

  setMarkets: (markets) => {
    set({ markets: new Map(markets) });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  // Selectors
  getCurrentMarket: () => {
    const { currentSymbol, markets } = get();
    return markets.get(currentSymbol);
  },

  getMarket: (symbol) => {
    return get().markets.get(symbol);
  },

  getAllMarkets: () => {
    return Array.from(get().markets.values());
  },

  getMarketsByVolume: () => {
    const markets = Array.from(get().markets.values());
    return markets.sort((a, b) => {
      const volA = parseFloat(a.volume24h) || 0;
      const volB = parseFloat(b.volume24h) || 0;
      return volB - volA;
    });
  },
}));
