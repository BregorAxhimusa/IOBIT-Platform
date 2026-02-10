'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signCreateReferrerCode, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export function useCreateReferralCode() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createCode = async (code: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    const upperCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9]{3,20}$/.test(upperCode)) {
      toast.error('Code must be 3-20 alphanumeric characters');
      return { success: false, error: 'Invalid code format' };
    }

    setIsCreating(true);

    try {
      const nonce = generateNonce();

      const signature = await signCreateReferrerCode(walletClient, {
        code: upperCode,
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.createReferrerCode({
        code: upperCode,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Referral code "${upperCode}" created!`);
        queryClient.invalidateQueries({ queryKey: ['referral-info'] });
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create code: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  return { createCode, isCreating };
}
