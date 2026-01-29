import { create } from 'zustand';

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice?: string;
  leverage: number;
  unrealizedPnl: string;
  unrealizedPnlPercent: string;
  margin: string;
}

interface PositionsState {
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  updatePosition: (symbol: string, update: Partial<Position>) => void;
  getPosition: (symbol: string) => Position | undefined;
  getTotalUnrealizedPnl: () => number;
  clear: () => void;
}

export const usePositionsStore = create<PositionsState>((set, get) => ({
  positions: [],

  setPositions: (positions) => set({ positions }),

  updatePosition: (symbol, update) =>
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.symbol === symbol ? { ...pos, ...update } : pos
      ),
    })),

  getPosition: (symbol) => {
    return get().positions.find((pos) => pos.symbol === symbol);
  },

  getTotalUnrealizedPnl: () => {
    return get().positions.reduce((total, pos) => {
      return total + parseFloat(pos.unrealizedPnl || '0');
    }, 0);
  },

  clear: () => set({ positions: [] }),
}));
