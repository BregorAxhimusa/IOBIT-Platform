'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signUsdTransfer, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

/**
 * Hook for transferring USDC between Perps and Spot accounts
 */
export function useTransfer() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isTransferring, setIsTransferring] = useState(false);

  const transfer = async (amount: string, toPerps: boolean) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return { success: false, error: 'Invalid amount' };
    }

    setIsTransferring(true);

    try {
      const exchangeClient = getExchangeClient(network);
      const nonce = generateNonce();

      // Sign the transfer
      const signature = await signUsdTransfer(walletClient, {
        amount: amountNum,
        toPerp: toPerps,
        nonce,
        network,
      });

      // Execute the transfer
      const result = await exchangeClient.usdTransfer({
        amount: amountNum,
        toPerp: toPerps,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Successfully transferred $${amountNum} ${toPerps ? 'to Perps' : 'to Spot'}`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Transfer failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to transfer: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transfer,
    isTransferring,
  };
}
