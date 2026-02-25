'use client';

import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { HYPERLIQUID_BRIDGE_ADDRESS, USDC_ARBITRUM_ADDRESS } from '@/lib/utils/constants';

// USDC has 6 decimals
const USDC_DECIMALS = 6;

// Minimum deposit amount (Hyperliquid requirement)
const MIN_DEPOSIT_USDC = 5;

// ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

/**
 * Hook for depositing USDC from Arbitrum to Hyperliquid
 *
 * How it works:
 * - Simply transfer USDC to the Hyperliquid bridge contract
 * - The bridge automatically credits your Hyperliquid account
 * - Minimum deposit: 5 USDC (amounts below this are LOST!)
 */
export function useDeposit() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = async (amount: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    if (!publicClient) {
      toast.error('Public client not available');
      return { success: false, error: 'Public client not available' };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return { success: false, error: 'Invalid amount' };
    }

    // Check minimum deposit
    if (amountNum < MIN_DEPOSIT_USDC) {
      toast.error(`Minimum deposit is ${MIN_DEPOSIT_USDC} USDC. Amounts below this will be LOST!`);
      return { success: false, error: `Minimum deposit is ${MIN_DEPOSIT_USDC} USDC` };
    }

    setIsDepositing(true);

    try {
      const amountWei = parseUnits(amount, USDC_DECIMALS);

      // Deposit by transferring USDC directly to bridge contract
      toast.loading('Depositing to Hyperliquid...', { id: 'deposit' });

      const depositHash = await walletClient.writeContract({
        address: USDC_ARBITRUM_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [HYPERLIQUID_BRIDGE_ADDRESS, amountWei],
      });

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash: depositHash });

      toast.success(`Successfully deposited ${amountNum} USDC to Hyperliquid!`, { id: 'deposit' });
      return { success: true, hash: depositHash };

    } catch (error) {
      console.error('Deposit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle user rejection
      if (errorMessage.includes('User rejected') || errorMessage.includes('denied')) {
        toast.error('Transaction cancelled', { id: 'deposit' });
        return { success: false, error: 'User cancelled' };
      }

      toast.error(`Deposit failed: ${errorMessage}`, { id: 'deposit' });
      return { success: false, error: errorMessage };
    } finally {
      setIsDepositing(false);
    }
  };

  return {
    deposit,
    isDepositing,
    minDeposit: MIN_DEPOSIT_USDC,
  };
}
