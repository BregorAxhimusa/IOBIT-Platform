'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signCreateSubAccount, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

/**
 * Hook for creating a sub-account on Hyperliquid
 */
export function useCreateSubAccount() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isCreating, setIsCreating] = useState(false);

  const createSubAccount = async (name: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    if (!name.trim()) {
      toast.error('Sub-account name is required');
      return { success: false, error: 'Name is required' };
    }

    setIsCreating(true);

    try {
      const nonce = generateNonce();

      const signature = await signCreateSubAccount(walletClient, {
        name: name.trim(),
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.createSubAccount({
        name: name.trim(),
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Sub-account "${name}" created`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create sub-account: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createSubAccount,
    isCreating,
  };
}
