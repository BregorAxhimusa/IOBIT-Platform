'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient, getAssetIndex } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce, roundSize, roundPrice } from '@/lib/hyperliquid/signing';
import { useTradingContext } from '@/hooks/use-trading-context';
import { useMarketStore } from '@/store/market-store';
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
  timeInForce?: 'GTC' | 'IOC' | 'ALO';
}

/**
 * Hook for placing orders on Hyperliquid with real wallet signing
 */
export function usePlaceOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();
  const getMarket = useMarketStore((state) => state.getMarket);
  const queryClient = useQueryClient();
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
      let size = parseFloat(params.size);
      const limitPrice = params.price ? parseFloat(params.price) : 0;

      if (isNaN(size) || size <= 0) {
        throw new Error('Invalid order size');
      }

      // Round size to asset's szDecimals (Hyperliquid rejects sizes with too many decimals)
      const market = getMarket(coin);
      if (market?.szDecimals !== undefined) {
        size = roundSize(size, market.szDecimals);
      }

      if (params.orderType === 'limit' && (isNaN(limitPrice) || limitPrice <= 0)) {
        throw new Error('Invalid limit price');
      }

      // Hyperliquid minimum order value is $10
      const currentPrice = parseFloat(market?.price || '0');
      const priceForCheck = params.orderType === 'market' ? currentPrice : limitPrice;
      const orderValue = size * priceForCheck;
      if (orderValue < 10) {
        throw new Error(`Minimum order value is $10. Current: $${orderValue.toFixed(2)}`);
      }

      // Generate nonce
      const nonce = generateNonce();

      // Get asset index for this coin
      const assetIndex = getAssetIndex(coin);
      const orderPrice = roundPrice(
        params.orderType === 'market'
          ? (params.side === 'buy' ? currentPrice * 1.5 : currentPrice * 0.5)
          : limitPrice
      );

      // Prepare order type
      // Market orders use IOC (Immediate Or Cancel), limit orders use configured TIF
      // Convert TIF from all caps to capitalized format (GTC -> Gtc, IOC -> Ioc, ALO -> Alo)
      const tifValue = params.orderType === 'market'
        ? 'Ioc'  // Market orders always use IOC
        : params.postOnly
          ? 'Alo'
          : params.timeInForce
            ? params.timeInForce.charAt(0) + params.timeInForce.slice(1).toLowerCase()
            : 'Gtc';

      const order_type = { limit: { tif: tifValue } };

      // Sign the order (must include assetIndex and orderType for correct hash)
      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy: params.side === 'buy',
        size,
        limitPrice: orderPrice,
        reduceOnly: params.reduceOnly || false,
        nonce,
        network,
        assetIndex,
        orderType: order_type,
        vaultAddress,
      });

      // Place the order
      const result = await exchangeClient.placeOrder({
        coin,
        is_buy: params.side === 'buy',
        sz: size,
        limit_px: orderPrice,
        order_type,
        reduce_only: params.reduceOnly || false,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        // Invalidate queries to refetch positions and orders immediately
        queryClient.invalidateQueries({ queryKey: ['user-positions'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['account-balance'] });

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
