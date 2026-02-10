'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { useOrdersStore } from '@/store/orders-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signCancelOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

/**
 * Hook for canceling orders on Hyperliquid with real wallet signing
 */
export function useCancelOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const removeOrder = useOrdersStore((state) => state.removeOrder);
  const { vaultAddress } = useTradingContext();
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  const cancelOrder = async (orderId: string, symbol: string, oid: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsCanceling(true);
    setCancelingOrderId(orderId);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin (remove -USD suffix if present)
      const coin = symbol.replace('-USD', '').replace('/USD', '');

      // Generate nonce
      const nonce = generateNonce();

      // Sign the cancel request
      const signature = await signCancelOrder(walletClient, {
        coin,
        oid,
        nonce,
      });

      // Cancel the order
      const result = await exchangeClient.cancelOrder({
        coin,
        oid,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        // Remove from local store
        removeOrder(orderId);
        toast.success('Order canceled successfully');
        return { success: true, data: result.data };
      } else {
        toast.error(`Cancel failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to cancel order: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsCanceling(false);
      setCancelingOrderId(null);
    }
  };

  const cancelAllOrders = async (symbol: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsCanceling(true);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin
      const coin = symbol.replace('-USD', '').replace('/USD', '');

      // Generate nonce
      const nonce = generateNonce();

      // For cancel all, we use a special signature (simplified approach)
      // In real implementation, this would require proper EIP-712 signing
      const signature = await signCancelOrder(walletClient, {
        coin,
        oid: 0, // 0 represents cancel all
        nonce,
      });

      // Cancel all orders
      const result = await exchangeClient.cancelAllOrders({
        coin,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success('All orders canceled successfully');
        return { success: true, data: result.data };
      } else {
        toast.error(`Cancel all failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to cancel all orders: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsCanceling(false);
    }
  };

  return {
    cancelOrder,
    cancelAllOrders,
    isCanceling,
    cancelingOrderId,
  };
}
