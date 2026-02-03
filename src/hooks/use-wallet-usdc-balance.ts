'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { formatUnits } from 'viem';

// USDC contract addresses
const USDC_ADDRESSES = {
  mainnet: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum One
  testnet: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia (example)
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
