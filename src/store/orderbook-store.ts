import { create } from 'zustand';

export interface OrderBookLevel {
  price: string;
  size: string;
}

export interface OrderBookData {
  coin: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

interface OrderBookState {
  orderBooks: Record<string, OrderBookData>;
  setOrderBook: (coin: string, data: OrderBookData) => void;
  getOrderBook: (coin: string) => OrderBookData | undefined;
  getSpread: (coin: string) => number | null;
  getBestBid: (coin: string) => OrderBookLevel | undefined;
  getBestAsk: (coin: string) => OrderBookLevel | undefined;
  clear: () => void;
}

export const useOrderBookStore = create<OrderBookState>((set, get) => ({
  orderBooks: {},

  setOrderBook: (coin, data) =>
    set((state) => ({
      orderBooks: {
        ...state.orderBooks,
        [coin]: data,
      },
    })),

  getOrderBook: (coin) => {
    return get().orderBooks[coin];
  },

  getSpread: (coin) => {
    const book = get().orderBooks[coin];
    if (!book || book.bids.length === 0 || book.asks.length === 0) {
      return null;
    }

    const bestBid = parseFloat(book.bids[0].price);
    const bestAsk = parseFloat(book.asks[0].price);
    return bestAsk - bestBid;
  },

  getBestBid: (coin) => {
    const book = get().orderBooks[coin];
    return book?.bids[0];
  },

  getBestAsk: (coin) => {
    const book = get().orderBooks[coin];
    return book?.asks[0];
  },

  clear: () => set({ orderBooks: {} }),
}));
