import { create } from 'zustand';

export interface Order {
  id: string;
  oid: number; // Hyperliquid order ID
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  price: string;
  size: string;
  filledSize: string;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  timestamp: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
}

interface OrdersState {
  openOrders: Order[];
  orderHistory: Order[];

  setOpenOrders: (orders: Order[]) => void;
  addOpenOrder: (order: Order) => void;
  updateOrder: (id: string, update: Partial<Order>) => void;
  removeOrder: (id: string) => void;

  addToHistory: (order: Order) => void;
  setOrderHistory: (orders: Order[]) => void;

  getOrder: (id: string) => Order | undefined;
  getOpenOrdersBySymbol: (symbol: string) => Order[];

  clear: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  openOrders: [],
  orderHistory: [],

  setOpenOrders: (openOrders) => set({ openOrders }),

  addOpenOrder: (order) =>
    set((state) => ({
      openOrders: [...state.openOrders, order],
    })),

  updateOrder: (id, update) =>
    set((state) => ({
      openOrders: state.openOrders.map((order) =>
        order.id === id ? { ...order, ...update } : order
      ),
    })),

  removeOrder: (id) =>
    set((state) => {
      const order = state.openOrders.find((o) => o.id === id);
      if (order) {
        return {
          openOrders: state.openOrders.filter((o) => o.id !== id),
          orderHistory: [order, ...state.orderHistory],
        };
      }
      return state;
    }),

  addToHistory: (order) =>
    set((state) => ({
      orderHistory: [order, ...state.orderHistory],
    })),

  setOrderHistory: (orderHistory) => set({ orderHistory }),

  getOrder: (id) => {
    const open = get().openOrders.find((o) => o.id === id);
    if (open) return open;
    return get().orderHistory.find((o) => o.id === id);
  },

  getOpenOrdersBySymbol: (symbol) => {
    return get().openOrders.filter((o) => o.symbol === symbol);
  },

  clear: () => set({ openOrders: [], orderHistory: [] }),
}));
