'use client';

import { useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNetworkStore } from '@/store/network-store';

/**
 * Hook to handle user authentication and database sync
 */
export function useUserAuth() {
  const { address, isConnected } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsAuthenticated(false);
      return;
    }

    const authenticateUser = async () => {
      try {
        setIsAuthenticating(true);

        // Create or get user in database
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });

        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error authenticating user:', error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateUser();
  }, [address, isConnected]);

  const syncTrades = async () => {
    if (!address) return;

    try {
      const response = await fetch('/api/trades/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, network }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error syncing trades:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    syncTrades,
  };
}
