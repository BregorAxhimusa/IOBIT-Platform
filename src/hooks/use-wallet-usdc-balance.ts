'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { formatUnits } from 'viem';
import { USDC_ARBITRUM_ADDRESS, USDC_TESTNET_ADDRESS } from '@/lib/utils/constants';

// USDC contract addresses (from .env.local via constants)
const USDC_ADDRESSES = {
  mainnet: USDC_ARBITRUM_ADDRESS,
  testnet: USDC_TESTNET_ADDRESS,
} as const;

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook to get USDC balance from connected wallet
 */
export function useWalletUsdcBalance() {
  const { address, isConnected } = useAccount();
  const network = useNetworkStore((state) => state.network);

  const usdcAddress = USDC_ADDRESSES[network];

  const { data: balance, isLoading, refetch } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Format balance from wei (6 decimals for USDC) to readable format
  const formattedBalance = balance ? formatUnits(balance, 6) : '0.00';

  return {
    balance: formattedBalance,
    rawBalance: balance,
    isLoading,
    refetch,
  };
}
