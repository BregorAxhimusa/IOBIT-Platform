'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signStakingDeposit, signStakingWithdraw, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export function useStakingTransfer() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const [isTransferring, setIsTransferring] = useState(false);

  const depositToStaking = async (amount: string) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return { success: false };
    }

    setIsTransferring(true);
    try {
      const nonce = generateNonce();
      const signature = await signStakingDeposit(walletClient, {
        amount,
        nonce,
        network,
      });

      const client = getExchangeClient(network);
      const result = await client.stakingDeposit({ amount, signature, nonce });

      if (result.success) {
        toast.success(`Transferred ${amount} HYPE to staking`);
        queryClient.invalidateQueries({ queryKey: ['staking-state', address] });
        queryClient.invalidateQueries({ queryKey: ['spot-balance'] });
        return { success: true };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      toast.error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false };
    } finally {
      setIsTransferring(false);
    }
  };

  const withdrawFromStaking = async (amount: string) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return { success: false };
    }

    setIsTransferring(true);
    try {
      const nonce = generateNonce();
      const signature = await signStakingWithdraw(walletClient, {
        amount,
        nonce,
        network,
      });

      const client = getExchangeClient(network);
      const result = await client.stakingWithdraw({ amount, signature, nonce });

      if (result.success) {
        toast.success(`Withdrawing ${amount} HYPE (7-day queue)`);
        queryClient.invalidateQueries({ queryKey: ['staking-state', address] });
        return { success: true };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      toast.error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false };
    } finally {
      setIsTransferring(false);
    }
  };

  return { depositToStaking, withdrawFromStaking, isTransferring };
}
