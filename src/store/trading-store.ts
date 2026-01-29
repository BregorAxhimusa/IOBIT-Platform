import { create } from 'zustand';

export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';

interface TradingState {
  // Order form state
  orderType: OrderType;
  orderSide: OrderSide;
  price: string;
  size: string;
  leverage: number;
  reduceOnly: boolean;
  postOnly: boolean;

  // Actions
  setOrderType: (type: OrderType) => void;
  setOrderSide: (side: OrderSide) => void;
  setPrice: (price: string) => void;
  setSize: (size: string) => void;
  setLeverage: (leverage: number) => void;
  setReduceOnly: (reduceOnly: boolean) => void;
  setPostOnly: (postOnly: boolean) => void;
  resetForm: () => void;
}

const initialState = {
  orderType: 'market' as OrderType,
  orderSide: 'buy' as OrderSide,
  price: '',
  size: '',
  leverage: 1,
  reduceOnly: false,
  postOnly: false,
};

export const useTradingStore = create<TradingState>((set) => ({
  ...initialState,

  setOrderType: (orderType) => set({ orderType }),
  setOrderSide: (orderSide) => set({ orderSide }),
  setPrice: (price) => set({ price }),
  setSize: (size) => set({ size }),
  setLeverage: (leverage) => set({ leverage }),
  setReduceOnly: (reduceOnly) => set({ reduceOnly }),
  setPostOnly: (postOnly) => set({ postOnly }),

  resetForm: () => set(initialState),
}));
