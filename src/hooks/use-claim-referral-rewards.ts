'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signClaimReferralRewards, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export function useClaimReferralRewards() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimRewards = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsClaiming(true);

    try {
      const nonce = generateNonce();

      const signature = await signClaimReferralRewards(walletClient, {
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.claimReferralRewards({
        signature,
        nonce,
      });

      if (result.success) {
        toast.success('Referral rewards claimed! Check your spot balance.');
        queryClient.invalidateQueries({ queryKey: ['referral-info'] });
        queryClient.invalidateQueries({ queryKey: ['spot-balance'] });
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to claim rewards: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsClaiming(false);
    }
  };

  return { claimRewards, isClaiming };
}
