'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signSetReferrer, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export function useSetReferrer() {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const [isSetting, setIsSetting] = useState(false);

  const setReferrer = async (code: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    const upperCode = code.toUpperCase().trim();
    if (!upperCode) {
      toast.error('Referral code is required');
      return { success: false, error: 'Code is required' };
    }

    setIsSetting(true);

    try {
      const nonce = generateNonce();

      const signature = await signSetReferrer(walletClient, {
        code: upperCode,
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.setReferrer({
        code: upperCode,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Referral code "${upperCode}" applied!`);
        queryClient.invalidateQueries({ queryKey: ['referral-info'] });
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to set referrer: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSetting(false);
    }
  };

  return { setReferrer, isSetting };
}
