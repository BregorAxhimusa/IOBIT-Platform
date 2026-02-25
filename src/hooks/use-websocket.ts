'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getWebSocketClient } from '@/lib/hyperliquid/websocket-client';
import { useNetworkStore } from '@/store/network-store';

/**
 * Hook for WebSocket connection management
 */
export function useWebSocket() {
  const network = useNetworkStore((state) => state.network);
  const wsClientRef = useRef(getWebSocketClient(network));
  const subscriptionsRef = useRef<string[]>([]);

  // Update client when network changes
  useEffect(() => {
    wsClientRef.current = getWebSocketClient(network);

    // Connect to WebSocket
    wsClientRef.current.connect().catch((error) => {
      console.error('Failed to connect to WebSocket:', error);
    });

    return () => {
      // Clean up subscriptions on unmount
      subscriptionsRef.current.forEach((id) => {
        wsClientRef.current.unsubscribe(id);
      });
      subscriptionsRef.current = [];
    };
  }, [network]);

  const subscribeToAllMids = useCallback((callback: (data: unknown) => void) => {
    const id = wsClientRef.current.subscribeToAllMids(callback);
    subscriptionsRef.current.push(id);
    return id;
  }, []);

  const subscribeToL2Book = useCallback((coin: string, callback: (data: unknown) => void) => {
    const id = wsClientRef.current.subscribeToL2Book(coin, callback);
    subscriptionsRef.current.push(id);
    return id;
  }, []);

  const subscribeToTrades = useCallback((coin: string, callback: (data: unknown) => void) => {
    const id = wsClientRef.current.subscribeToTrades(coin, callback);
    subscriptionsRef.current.push(id);
    return id;
  }, []);

  const subscribeToCandle = useCallback((coin: string, interval: string, callback: (data: unknown) => void) => {
    const id = wsClientRef.current.subscribeToCandle(coin, interval, callback);
    subscriptionsRef.current.push(id);
    return id;
  }, []);

  const unsubscribe = useCallback((id: string) => {
    wsClientRef.current.unsubscribe(id);
    subscriptionsRef.current = subscriptionsRef.current.filter((subId) => subId !== id);
  }, []);

  const isConnected = wsClientRef.current.isConnected();

  return {
    subscribeToAllMids,
    subscribeToL2Book,
    subscribeToTrades,
    subscribeToCandle,
    unsubscribe,
    isConnected,
  };
}
