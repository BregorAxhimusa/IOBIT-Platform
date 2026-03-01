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

/**
 * Hook for closing positions on Hyperliquid with real wallet signing
 * Closing a position places a market order in the opposite direction
 */
export function useClosePosition() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();
  const getMarket = useMarketStore((state) => state.getMarket);
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);

  const closePosition = async (symbol: string, side: 'long' | 'short', size: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsClosing(true);
    setClosingSymbol(symbol);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin (remove -USD suffix if present)
      const coin = symbol.replace('-USD', '').replace('/USD', '');

      // Parse size
      let positionSize = parseFloat(size);

      if (isNaN(positionSize) || positionSize <= 0) {
        throw new Error('Invalid position size');
      }

      // Round size to asset's szDecimals
      const market = getMarket(coin);
      if (market?.szDecimals !== undefined) {
        positionSize = roundSize(positionSize, market.szDecimals);
      }

      // To close a position, we place a market order in the opposite direction
      // with reduceOnly = true
      const isBuy = side === 'short'; // If we're short, we buy to close. If we're long, we sell to close.

      // Generate nonce
      const nonce = generateNonce();

      // Get asset index for this coin
      const assetIndex = getAssetIndex(coin);

      // For market orders, use a price within Hyperliquid's 95% limit from reference price
      // All prices must be rounded to 5 significant figures
      const currentPrice = parseFloat(market?.price || '0');
      const limitPrice = roundPrice(isBuy ? currentPrice * 1.5 : currentPrice * 0.5);

      // Prepare market order type - use IOC (Immediate Or Cancel) for market-like execution
      const order_type = { limit: { tif: 'Ioc' } };

      // Sign the order (must include assetIndex and orderType for correct hash)
      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy,
        size: positionSize,
        limitPrice,
        reduceOnly: true,
        nonce,
        network,
        assetIndex,
        orderType: order_type,
        vaultAddress,
      });

      // Place the market order to close the position
      const result = await exchangeClient.placeOrder({
        coin,
        is_buy: isBuy,
        sz: positionSize,
        limit_px: limitPrice,
        order_type,
        reduce_only: true,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        // Invalidate queries to refetch positions and balance immediately
        queryClient.invalidateQueries({ queryKey: ['user-positions'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['account-balance'] });

        toast.success(`Position closed for ${symbol}`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed to close position: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to close position: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsClosing(false);
      setClosingSymbol(null);
    }
  };

  return {
    closePosition,
    isClosing,
    closingSymbol,
  };
}
