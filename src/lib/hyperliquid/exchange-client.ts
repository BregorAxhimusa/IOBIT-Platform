import { HYPERLIQUID_MAINNET_API, HYPERLIQUID_TESTNET_API, type Network } from '../utils/constants';

/**
 * Hyperliquid Exchange Client (Wallet Required)
 * Për të vendosur orders, cancel orders, etj.
 */
export class HyperliquidExchangeClient {
  private baseUrl: string;
  private network: Network;

  constructor(network: Network = 'mainnet') {
    this.network = network;
    this.baseUrl = network === 'mainnet' ? HYPERLIQUID_MAINNET_API : HYPERLIQUID_TESTNET_API;
  }

  /**
   * Generic POST request to Hyperliquid Exchange API
   */
  private async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Place an order (requires EIP-712 signature)
   */
  async placeOrder(params: {
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: { limit?: { tif: string }; trigger?: { triggerPx: number; isMarket: boolean; tpsl: string } };
    reduce_only: boolean;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    nonce: number;
  }) {
    try {
      const response = await this.post('/exchange', {
        action: {
          type: 'order',
          orders: [params],
          grouping: 'na',
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error placing order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel an order (requires EIP-712 signature)
   */
  async cancelOrder(params: {
    coin: string;
    oid: number;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    nonce: number;
  }) {
    try {
      const response = await this.post('/exchange', {
        action: {
          type: 'cancel',
          cancels: [
            {
              a: params.coin,
              o: params.oid,
            },
          ],
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error canceling order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel all orders for a coin (requires EIP-712 signature)
   */
  async cancelAllOrders(params: {
    coin: string;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    nonce: number;
  }) {
    try {
      const response = await this.post('/exchange', {
        action: {
          type: 'cancelByCloid',
          cancels: [
            {
              asset: params.coin,
              cloid: null, // null cancels all
            },
          ],
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error canceling all orders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Modify an order (requires EIP-712 signature)
   */
  async modifyOrder(params: {
    oid: number;
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: { limit?: { tif: string } };
    reduce_only: boolean;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    nonce: number;
  }) {
    try {
      const response = await this.post('/exchange', {
        action: {
          type: 'modify',
          oid: params.oid,
          order: {
            a: params.coin,
            b: params.is_buy,
            p: params.limit_px.toString(),
            s: params.sz.toString(),
            r: params.reduce_only,
            t: params.order_type,
          },
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error modifying order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
let exchangeClient: HyperliquidExchangeClient | null = null;

export function getExchangeClient(network: Network = 'mainnet'): HyperliquidExchangeClient {
  if (!exchangeClient || exchangeClient['network'] !== network) {
    exchangeClient = new HyperliquidExchangeClient(network);
  }
  return exchangeClient;
}
