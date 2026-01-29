import { create } from 'zustand';

export interface Trade {
  price: string;
  size: string;
  side: 'buy' | 'sell';
  time: number;
}

interface TradesState {
  trades: Record<string, Trade[]>;
  maxTradesPerSymbol: number;
  addTrade: (coin: string, trade: Trade) => void;
  addTrades: (coin: string, trades: Trade[]) => void;
  getTrades: (coin: string) => Trade[];
  clear: () => void;
}

export const useTradesStore = create<TradesState>((set, get) => ({
  trades: {},
  maxTradesPerSymbol: 50, // Keep last 50 trades per symbol

  addTrade: (coin, trade) =>
    set((state) => {
      const existing = state.trades[coin] || [];
      const updated = [trade, ...existing].slice(0, state.maxTradesPerSymbol);
      return {
        trades: {
          ...state.trades,
          [coin]: updated,
        },
      };
    }),

  addTrades: (coin, trades) =>
    set((state) => {
      const existing = state.trades[coin] || [];
      const updated = [...trades, ...existing].slice(0, state.maxTradesPerSymbol);
      return {
        trades: {
          ...state.trades,
          [coin]: updated,
        },
      };
    }),

  getTrades: (coin) => {
    return get().trades[coin] || [];
  },

  clear: () => set({ trades: {} }),
}));
