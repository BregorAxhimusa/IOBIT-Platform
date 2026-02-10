'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signSubAccountTransfer, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

/**
 * Hook for transferring USDC between master and sub-account
 */
export function useSubAccountTransfer() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isTransferring, setIsTransferring] = useState(false);

  const transfer = async (
    subAccountUser: string,
    isDeposit: boolean,
    amount: number
  ) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return { success: false, error: 'Invalid amount' };
    }

    setIsTransferring(true);

    try {
      const nonce = generateNonce();

      const signature = await signSubAccountTransfer(walletClient, {
        subAccountUser,
        isDeposit,
        usd: amount,
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.subAccountTransfer({
        subAccountUser,
        isDeposit,
        usd: amount,
        signature,
        nonce,
      });

      if (result.success) {
        const direction = isDeposit ? 'to' : 'from';
        toast.success(`Transferred $${amount.toFixed(2)} ${direction} sub-account`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Transfer failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Transfer failed: ${errorMessage}`);
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
