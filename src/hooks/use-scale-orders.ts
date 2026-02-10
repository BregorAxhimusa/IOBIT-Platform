'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

export interface ScaleOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  basePrice: string;
  totalSize: string;
  orderCount: number;
  priceRangePercent: number;
  distribution: 'equal' | 'weighted';
  reduceOnly?: boolean;
}

/**
 * Hook for placing scale orders (multiple orders at different price levels)
 */
export function useScaleOrders() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();
  const [isPlacing, setIsPlacing] = useState(false);

  const placeScaleOrders = async (params: ScaleOrderParams) => {
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
      const coin = params.symbol.replace('-USD', '').replace('/USD', '');

      const basePrice = parseFloat(params.basePrice);
      const totalSize = parseFloat(params.totalSize);
      const orderCount = params.orderCount;

      if (isNaN(basePrice) || basePrice <= 0) {
        throw new Error('Invalid base price');
      }

      if (isNaN(totalSize) || totalSize <= 0) {
        throw new Error('Invalid total size');
      }

      if (orderCount < 2 || orderCount > 10) {
        throw new Error('Order count must be between 2 and 10');
      }

      // Calculate price range
      const rangeAmount = basePrice * (params.priceRangePercent / 100);
      const priceStep = rangeAmount / (orderCount - 1);

      // Calculate sizes based on distribution
      const sizes: number[] = [];
      if (params.distribution === 'equal') {
        const sizePerOrder = totalSize / orderCount;
        for (let i = 0; i < orderCount; i++) {
          sizes.push(sizePerOrder);
        }
      } else {
        // Weighted: more size at better prices
        const weights = Array.from({ length: orderCount }, (_, i) => orderCount - i);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        for (const weight of weights) {
          sizes.push((totalSize * weight) / totalWeight);
        }
      }

      // Generate nonce (will be used for all orders in the batch)
      const nonce = generateNonce();

      // Sign one order as representative (Hyperliquid accepts batch with single signature)
      const firstPrice = params.side === 'buy'
        ? basePrice - rangeAmount
        : basePrice;

      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy: params.side === 'buy',
        size: sizes[0],
        limitPrice: firstPrice,
        reduceOnly: params.reduceOnly || false,
        nonce,
        network,
      });

      // Create orders array
      const orders = [];
      for (let i = 0; i < orderCount; i++) {
        const price = params.side === 'buy'
          ? basePrice - rangeAmount + (priceStep * i)  // For buy: lower prices first
          : basePrice + (priceStep * i);                // For sell: higher prices first

        orders.push({
          coin,
          is_buy: params.side === 'buy',
          sz: sizes[i],
          limit_px: price,
          order_type: { limit: { tif: 'Gtc' } },
          reduce_only: params.reduceOnly || false,
        });
      }

      // Place all orders
      const result = await exchangeClient.placeMultipleOrders(orders, signature, nonce, vaultAddress);

      if (result.success) {
        toast.success(`Placed ${orderCount} ${params.side.toUpperCase()} scale orders`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Scale orders failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to place scale orders: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeScaleOrders,
    isPlacing,
  };
}
