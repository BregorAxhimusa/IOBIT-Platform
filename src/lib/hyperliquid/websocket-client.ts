import { HYPERLIQUID_MAINNET_WS, HYPERLIQUID_TESTNET_WS, type Network } from '../utils/constants';
import type { WSSubscription, WSMessage } from './types';

type SubscriptionCallback = (data: unknown) => void;

interface Subscription {
  id: string;
  channel: string;
  callback: SubscriptionCallback;
  type: string;
  coin?: string;
  interval?: string;
}

/**
 * Hyperliquid WebSocket Client
 * Manages WebSocket connections and subscriptions for real-time data
 */
export class HyperliquidWebSocketClient {
  private ws: WebSocket | null = null;
  private network: Network;
  private wsUrl: string;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageQueue: WSSubscription[] = [];

  constructor(network: Network = 'mainnet') {
    this.network = network;
    this.wsUrl = network === 'mainnet' ? HYPERLIQUID_MAINNET_WS : HYPERLIQUID_TESTNET_WS;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            if (this.ws?.readyState === WebSocket.OPEN) {
              resolve();
            } else {
              reject(new Error('Connection failed'));
            }
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Send queued messages
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg) this.send(msg);
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.handleReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;

      setTimeout(() => {
        this.connect().then(() => {
          // Resubscribe to all channels
          this.subscriptions.forEach((sub) => {
            const [type, coin] = sub.channel.split(':');
            this.subscribeInternal(type, coin);
          });
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string) {
    try {
      const message: WSMessage = JSON.parse(data);

      // Find matching subscription and call callback
      this.subscriptions.forEach((sub) => {
        // Match channel exactly or by prefix for complex channels
        const channelMatch =
          message.channel === sub.channel ||
          (sub.channel.includes(':') && message.channel === sub.channel.split(':')[0]);

        if (channelMatch) {
          sub.callback(message.data);
        }
      });
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Send message to WebSocket
   */
  private send(message: WSSubscription) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      this.connect();
    }
  }

  /**
   * Internal subscribe method
   */
  private subscribeInternal(type: string, coin: string | undefined) {
    const subscription: WSSubscription = {
      method: 'subscribe',
      subscription: {
        type: type as WSSubscription['subscription']['type'],
        ...(coin && { coin }),
      },
    };

    this.send(subscription);
  }

  /**
   * Subscribe to all mids (all market prices)
   */
  subscribeToAllMids(callback: SubscriptionCallback): string {
    const channel = 'allMids';
    const id = `${channel}:${Date.now()}`;

    this.subscriptions.set(id, { id, channel, callback, type: 'allMids' });
    this.subscribeInternal('allMids', undefined);

    return id;
  }

  /**
   * Subscribe to L2 order book for a specific coin
   */
  subscribeToL2Book(coin: string, callback: SubscriptionCallback): string {
    const channel = `l2Book:${coin}`;
    const id = `${channel}:${Date.now()}`;

    this.subscriptions.set(id, { id, channel, callback, type: 'l2Book', coin });
    this.subscribeInternal('l2Book', coin);

    return id;
  }

  /**
   * Subscribe to trades for a specific coin
   */
  subscribeToTrades(coin: string, callback: SubscriptionCallback): string {
    const channel = `trades:${coin}`;
    const id = `${channel}:${Date.now()}`;

    this.subscriptions.set(id, { id, channel, callback, type: 'trades', coin });
    this.subscribeInternal('trades', coin);

    return id;
  }

  /**
   * Subscribe to candles for a specific coin and interval
   */
  subscribeToCandle(coin: string, interval: string, callback: SubscriptionCallback): string {
    const channel = `candle:${coin}:${interval}`;
    const id = `${channel}:${Date.now()}`;

    this.subscriptions.set(id, { id, channel, callback, type: 'candle', coin, interval });

    const subscription: WSSubscription = {
      method: 'subscribe',
      subscription: {
        type: 'candle',
        coin,
        interval,
      },
    };

    this.send(subscription);

    return id;
  }

  /**
   * Unsubscribe from a subscription
   */
  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Send unsubscribe message to server
      const unsubscribeMsg: WSSubscription = {
        method: 'unsubscribe',
        subscription: {
          type: subscription.type as WSSubscription['subscription']['type'],
          ...(subscription.coin && { coin: subscription.coin }),
          ...(subscription.interval && { interval: subscription.interval }),
        },
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(unsubscribeMsg));
      }

      // Remove from local subscriptions
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.clear();
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    this.unsubscribeAll();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
let wsClient: HyperliquidWebSocketClient | null = null;

export function getWebSocketClient(network: Network = 'mainnet'): HyperliquidWebSocketClient {
  if (!wsClient || wsClient['network'] !== network) {
    if (wsClient) {
      wsClient.disconnect();
    }
    wsClient = new HyperliquidWebSocketClient(network);
  }
  return wsClient;
}
