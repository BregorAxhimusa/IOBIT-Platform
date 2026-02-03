'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signWithdraw, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

/**
 * Hook for withdrawing USDC from Hyperliquid
 */
export function useWithdraw() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const withdraw = async (amount: string, destination?: string) => {
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

    // Use connected wallet address as destination if not specified
    const destinationAddress = destination || address;

    setIsWithdrawing(true);

    try {
      const exchangeClient = getExchangeClient(network);
      const nonce = generateNonce();

      // Sign the withdrawal
      const signature = await signWithdraw(walletClient, {
        amount: amountNum,
        destination: destinationAddress,
        nonce,
        network,
      });

      // Execute the withdrawal
      const result = await exchangeClient.withdraw({
        amount: amountNum,
        destination: destinationAddress,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`Withdrawal of $${amountNum} initiated. Should arrive within 5 minutes.`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Withdrawal failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to withdraw: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    withdraw,
    isWithdrawing,
  };
}
