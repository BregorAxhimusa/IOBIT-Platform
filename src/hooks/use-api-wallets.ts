'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signApproveAgent, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';
import { useAccountStore } from '@/store/account-store';
import toast from 'react-hot-toast';

/**
 * Hook to fetch and manage API wallets (extra agents)
 */
export function useApiWallets() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const setApiWallets = useAccountStore((state) => state.setApiWallets);
  const [isApproving, setIsApproving] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['api-wallets', address, network],
    queryFn: async () => {
      if (!address) return [];

      const client = getInfoClient(network);
      const agents = await client.getExtraAgents(address);
      return agents;
    },
    enabled: isConnected && !!address,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data) {
      setApiWallets(data);
    }
  }, [data, setApiWallets]);

  const approveAgent = async (agentAddress: string, agentName: string | null) => {
    if (!isConnected || !walletClient) {
      toast.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsApproving(true);

    try {
      const nonce = generateNonce();

      const signature = await signApproveAgent(walletClient, {
        agentAddress,
        agentName,
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.approveAgent({
        agentAddress,
        agentName,
        nonce,
        signature,
      });

      if (result.success) {
        toast.success('API wallet approved');
        refetch();
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to approve agent: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsApproving(false);
    }
  };

  return {
    apiWallets: data || [],
    isLoading,
    error,
    refetch,
    approveAgent,
    isApproving,
  };
}
