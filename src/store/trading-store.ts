import { create } from 'zustand';

export type OrderType = 'market' | 'limit' | 'stop-market' | 'stop-limit';
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

  // Stop order specific
  triggerPrice: string;
  stopOrderType: 'stop-market' | 'stop-limit';

  // Actions
  setOrderType: (type: OrderType) => void;
  setOrderSide: (side: OrderSide) => void;
  setPrice: (price: string) => void;
  setSize: (size: string) => void;
  setLeverage: (leverage: number) => void;
  setReduceOnly: (reduceOnly: boolean) => void;
  setPostOnly: (postOnly: boolean) => void;
  setTriggerPrice: (price: string) => void;
  setStopOrderType: (type: 'stop-market' | 'stop-limit') => void;
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
  triggerPrice: '',
  stopOrderType: 'stop-market' as 'stop-market' | 'stop-limit',
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
  setTriggerPrice: (triggerPrice) => set({ triggerPrice }),
  setStopOrderType: (stopOrderType) => set({ stopOrderType }),

  resetForm: () => set(initialState),
}));
