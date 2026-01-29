import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Network } from '@/lib/utils/constants';
import { HYPERLIQUID_MAINNET_API, HYPERLIQUID_TESTNET_API, HYPERLIQUID_MAINNET_WS, HYPERLIQUID_TESTNET_WS } from '@/lib/utils/constants';

interface NetworkState {
  network: Network;
  apiUrl: string;
  wsUrl: string;
  isMainnet: boolean;
  isTestnet: boolean;

  // Actions
  setNetwork: (network: Network) => void;
  switchNetwork: () => void;
}

/**
 * Network Store
 * Menaxhon network selection (mainnet/testnet)
 */
export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      network: 'mainnet', // Default to mainnet
      apiUrl: HYPERLIQUID_MAINNET_API,
      wsUrl: HYPERLIQUID_MAINNET_WS,
      isMainnet: true,
      isTestnet: false,

      setNetwork: (network) => {
        const apiUrl = network === 'mainnet' ? HYPERLIQUID_MAINNET_API : HYPERLIQUID_TESTNET_API;
        const wsUrl = network === 'mainnet' ? HYPERLIQUID_MAINNET_WS : HYPERLIQUID_TESTNET_WS;

        set({
          network,
          apiUrl,
          wsUrl,
          isMainnet: network === 'mainnet',
          isTestnet: network === 'testnet',
        });
      },

      switchNetwork: () => {
        const currentNetwork = get().network;
        const newNetwork: Network = currentNetwork === 'mainnet' ? 'testnet' : 'mainnet';
        get().setNetwork(newNetwork);
      },
    }),
    {
      name: 'iobit-network', // localStorage key
    }
  )
);
