'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signApproveAgent, generateNonce } from '@/lib/hyperliquid/signing';
import { sessionAgent } from '@/lib/hyperliquid/session-agent';
import toast from 'react-hot-toast';

/**
 * Hook for managing the Hyperliquid session agent.
 *
 * Hyperliquid L1 actions (orders, cancels, leverage) require EIP-712 signing
 * with chainId 1337. MetaMask rejects this because the wallet is on Arbitrum.
 *
 * This hook manages a local "agent" key that gets approved once via the user's
 * wallet (Arbitrum chainId, MetaMask accepts), then signs all L1 actions locally.
 * This is the same approach used by Hyperliquid's own web app.
 */
export function useSessionAgent() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isApproving, setIsApproving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check agent status on mount and when wallet changes
  useEffect(() => {
    setIsReady(sessionAgent.isReady());
  }, [address, isConnected]);

  /**
   * Approve a new session agent for trading.
   * This prompts ONE MetaMask signature (approveAgent with Arbitrum chainId).
   * After approval, all trading operations sign locally without MetaMask popups.
   */
  const enableTrading = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return false;
    }

    if (sessionAgent.isReady()) {
      setIsReady(true);
      return true;
    }

    setIsApproving(true);

    try {
      // Generate a new agent keypair
      const { address: agentAddress, privateKey } = sessionAgent.generateAndStore();

      const nonce = generateNonce();

      // Sign the agent approval with the user's wallet.
      // This is a "user-signed action" using domain "HyperliquidSignTransaction"
      // with chainId 421614 and primaryType "HyperliquidTransaction:ApproveAgent".
      // agentName is '' in the EIP-712 message (string type requires a value),
      // but OMITTED from the API payload for unnamed agents.
      const signature = await signApproveAgent(walletClient, {
        agentAddress,
        agentName: '',
        nonce,
        network,
      });

      // Send approval to Hyperliquid exchange API
      // Don't pass agentName - unnamed agents omit this field from the payload
      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.approveAgent({
        agentAddress,
        nonce,
        signature,
      });

      console.log('ApproveAgent result:', JSON.stringify(result));

      if (result.success) {
        // Mark agent as approved and persist
        sessionAgent.markApprovedWithKey(privateKey);
        setIsReady(true);
        toast.success('Trading enabled successfully');
        return true;
      } else {
        sessionAgent.clear();
        const errorMsg = result.error || 'Failed to enable trading';
        console.error('ApproveAgent failed:', errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      sessionAgent.clear();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Don't show toast for user rejection
      if (!errorMessage.includes('User rejected') && !errorMessage.includes('user rejected')) {
        toast.error(`Failed to enable trading: ${errorMessage}`);
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [isConnected, address, walletClient, network]);

  /**
   * Disable trading by clearing the session agent
   */
  const disableTrading = useCallback(() => {
    sessionAgent.clear();
    setIsReady(false);
  }, []);

  return {
    isReady,
    isApproving,
    enableTrading,
    disableTrading,
  };
}
