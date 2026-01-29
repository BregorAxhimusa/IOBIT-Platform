'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export interface PlaceOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price?: string;
  size: string;
  leverage?: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
}

/**
 * Hook for placing orders on Hyperliquid with real wallet signing
 */
export function usePlaceOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isPlacing, setIsPlacing] = useState(false);

  const placeOrder = async (params: PlaceOrderParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsPlacing(true);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin (remove -USD suffix if present)
      const coin = params.symbol.replace('-USD', '').replace('/USD', '');

      // Parse size and price
      const size = parseFloat(params.size);
      const limitPrice = params.price ? parseFloat(params.price) : 0;

      if (isNaN(size) || size <= 0) {
        throw new Error('Invalid order size');
      }

      if (params.orderType === 'limit' && (isNaN(limitPrice) || limitPrice <= 0)) {
        throw new Error('Invalid limit price');
      }

      // Generate nonce
      const nonce = generateNonce();

      // Sign the order
      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy: params.side === 'buy',
        size,
        limitPrice: params.orderType === 'market' ? 0 : limitPrice,
        reduceOnly: params.reduceOnly || false,
        nonce,
      });

      // Prepare order type
      const order_type = params.orderType === 'market'
        ? { trigger: { triggerPx: limitPrice, isMarket: true, tpsl: 'tp' } }
        : { limit: { tif: params.postOnly ? 'Alo' : 'Gtc' } };

      // Place the order
      const result = await exchangeClient.placeOrder({
        coin,
        is_buy: params.side === 'buy',
        sz: size,
        limit_px: limitPrice,
        order_type,
        reduce_only: params.reduceOnly || false,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`${params.side.toUpperCase()} order placed successfully`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Order failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to place order: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeOrder,
    isPlacing,
  };
}
