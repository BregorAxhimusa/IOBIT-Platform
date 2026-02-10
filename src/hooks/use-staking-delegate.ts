'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signTokenDelegate, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export function useStakingDelegate() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const [isDelegating, setIsDelegating] = useState(false);

  const delegate = async (validator: string, amount: string) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return { success: false };
    }

    setIsDelegating(true);
    try {
      const nonce = generateNonce();
      const signature = await signTokenDelegate(walletClient, {
        validator,
        amount,
        isUndelegate: false,
        nonce,
        network,
      });

      const client = getExchangeClient(network);
      const result = await client.tokenDelegate({
        validator,
        amount,
        isUndelegate: false,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Delegated ${amount} HYPE`);
        queryClient.invalidateQueries({ queryKey: ['staking-state', address] });
        queryClient.invalidateQueries({ queryKey: ['delegations', address] });
        return { success: true };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      toast.error(`Delegation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false };
    } finally {
      setIsDelegating(false);
    }
  };

  const undelegate = async (validator: string, amount: string) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return { success: false };
    }

    setIsDelegating(true);
    try {
      const nonce = generateNonce();
      const signature = await signTokenDelegate(walletClient, {
        validator,
        amount,
        isUndelegate: true,
        nonce,
        network,
      });

      const client = getExchangeClient(network);
      const result = await client.tokenDelegate({
        validator,
        amount,
        isUndelegate: true,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Undelegated ${amount} HYPE`);
        queryClient.invalidateQueries({ queryKey: ['staking-state', address] });
        queryClient.invalidateQueries({ queryKey: ['delegations', address] });
        return { success: true };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      toast.error(`Undelegation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false };
    } finally {
      setIsDelegating(false);
    }
  };

  return { delegate, undelegate, isDelegating };
}
