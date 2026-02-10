'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signVaultTransfer, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';

interface VaultTransferResult {
  success: boolean;
  error?: string;
}

/**
 * Hook for vault deposit/withdraw operations (requires EIP-712 signing)
 */
export function useVaultDeposit() {
  const network = useNetworkStore((state) => state.network);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = useCallback(
    async (vaultAddress: string, amount: number): Promise<VaultTransferResult> => {
      if (!walletClient || !address || !isConnected) {
        return { success: false, error: 'Wallet not connected' };
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const nonce = generateNonce();

        // Sign the vault transfer
        const signature = await signVaultTransfer(walletClient, {
          vaultAddress,
          isDeposit: true,
          usd: amount,
          nonce,
          network,
        });

        // Send to exchange
        const client = getExchangeClient(network);
        const result = await client.vaultTransfer({
          vaultAddress,
          isDeposit: true,
          usd: amount,
          signature,
          nonce,
        });

        if (!result.success) {
          throw new Error(result.error || 'Deposit failed');
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Deposit failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [walletClient, address, isConnected, network]
  );

  const withdraw = useCallback(
    async (vaultAddress: string, amount: number): Promise<VaultTransferResult> => {
      if (!walletClient || !address || !isConnected) {
        return { success: false, error: 'Wallet not connected' };
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const nonce = generateNonce();

        // Sign the vault transfer
        const signature = await signVaultTransfer(walletClient, {
          vaultAddress,
          isDeposit: false,
          usd: amount,
          nonce,
          network,
        });

        // Send to exchange
        const client = getExchangeClient(network);
        const result = await client.vaultTransfer({
          vaultAddress,
          isDeposit: false,
          usd: amount,
          signature,
          nonce,
        });

        if (!result.success) {
          throw new Error(result.error || 'Withdrawal failed');
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Withdrawal failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [walletClient, address, isConnected, network]
  );

  return {
    deposit,
    withdraw,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
