'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useSpotStore } from '@/store/spot-store';
import { getSpotCoinName } from '@/lib/utils/spot-helpers';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

export interface PlaceSpotOrderParams {
  pairName: string;       // e.g. "PURR/USDC"
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price?: string;         // Required for limit
  size: string;           // Base token amount
  timeInForce?: 'GTC' | 'IOC' | 'ALO';
  postOnly?: boolean;
}

/**
 * Hook for placing spot orders on Hyperliquid
 * Spot orders use coin format "@{pairIndex}" and have no leverage/margin
 */
export function usePlaceSpotOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const spotMeta = useSpotStore((state) => state.spotMeta);
  const { vaultAddress } = useTradingContext();
  const [isPlacing, setIsPlacing] = useState(false);

  const placeSpotOrder = async (params: PlaceSpotOrderParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    if (!spotMeta) {
      toast.error('Spot market data not loaded');
      return { success: false, error: 'Spot meta not available' };
    }

    setIsPlacing(true);

    try {
      const exchangeClient = getExchangeClient(network);

      // Find the spot pair
      const pairIdx = spotMeta.universe.findIndex((p) => p.name === params.pairName);
      if (pairIdx === -1) {
        throw new Error(`Unknown spot pair: ${params.pairName}`);
      }

      const pair = spotMeta.universe[pairIdx];
      const coin = getSpotCoinName(pair.index);

      const size = parseFloat(params.size);
      const limitPrice = params.price ? parseFloat(params.price) : 0;

      if (isNaN(size) || size <= 0) {
        throw new Error('Invalid order size');
      }

      if (params.orderType === 'limit' && (isNaN(limitPrice) || limitPrice <= 0)) {
        throw new Error('Invalid limit price');
      }

      const nonce = generateNonce();

      // For market orders, use extreme price for immediate execution
      const orderPrice = params.orderType === 'market'
        ? (params.side === 'buy' ? 999999999 : 0.0001)
        : limitPrice;

      // Sign the order (spot orders use the same signing as perps)
      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy: params.side === 'buy',
        size,
        limitPrice: orderPrice,
        reduceOnly: false, // Spot orders are never reduce-only
        nonce,
        network,
      });

      // TIF for spot orders
      const tifValue = params.orderType === 'market'
        ? 'Ioc'
        : params.postOnly
          ? 'Alo'
          : params.timeInForce
            ? params.timeInForce.charAt(0) + params.timeInForce.slice(1).toLowerCase()
            : 'Gtc';

      const order_type = { limit: { tif: tifValue } };

      // Place order - spot uses coin name format, not asset index
      const result = await exchangeClient.placeOrder({
        coin,
        is_buy: params.side === 'buy',
        sz: size,
        limit_px: orderPrice,
        order_type,
        reduce_only: false,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        const baseToken = params.pairName.split('/')[0];
        toast.success(`Spot ${params.side.toUpperCase()} ${baseToken} order placed`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Spot order failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to place spot order: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeSpotOrder,
    isPlacing,
  };
}
