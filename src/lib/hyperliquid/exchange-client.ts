import { HYPERLIQUID_MAINNET_API, HYPERLIQUID_TESTNET_API, type Network } from '../utils/constants';

/**
 * Map coin names to Hyperliquid asset indices
 */
const ASSET_INDEX_MAP: Record<string, number> = {
  'BTC': 0,
  'ETH': 1,
  'SOL': 2,
  'ARB': 3,
  'AVAX': 4,
  'BCH': 5,
  'BNB': 6,
  'DOGE': 7,
  'LTC': 8,
  'MATIC': 9,
  'OP': 10,
  'XRP': 11,
};

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
   * Get asset index from coin name
   */
  private getAssetIndex(coin: string): number {
    const index = ASSET_INDEX_MAP[coin];
    if (index === undefined) {
      throw new Error(`Unknown coin: ${coin}`);
    }
    return index;
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
      // Format order data with shortened field names as required by Hyperliquid API
      const orderData = {
        a: this.getAssetIndex(params.coin), // asset index (0=BTC, 1=ETH, etc.)
        b: params.is_buy,                    // is_buy
        p: params.limit_px.toString(),       // limit price as string
        s: params.sz.toString(),             // size as string
        r: params.reduce_only,               // reduce_only
        t: params.order_type,                // order_type
      };

      const payload = {
        action: {
          type: 'order',
          orders: [orderData],
          grouping: 'na',
        },
        nonce: params.nonce,
        signature: params.signature,
      };

      const response = await this.post('/exchange', payload);
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

  /**
   * Transfer USDC between Perps and Spot accounts (requires EIP-712 signature)
   */
  async usdTransfer(params: {
    amount: number;
    toPerp: boolean;
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
          type: 'usdClassTransfer',
          signatureChainId: this.network === 'mainnet' ? '0xa4b1' : '0x66eee', // Arbitrum mainnet or testnet
          hyperliquidChain: this.network === 'mainnet' ? 'Mainnet' : 'Testnet',
          amount: params.amount.toString(),
          toPerp: params.toPerp,
          nonce: params.nonce,
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error transferring USD:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Withdraw USDC from Hyperliquid (requires EIP-712 signature)
   */
  async withdraw(params: {
    amount: number;
    destination: string;
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
          type: 'withdraw3',
          signatureChainId: this.network === 'mainnet' ? '0xa4b1' : '0x66eee', // Arbitrum mainnet or testnet
          hyperliquidChain: this.network === 'mainnet' ? 'Mainnet' : 'Testnet',
          destination: params.destination,
          amount: params.amount.toString(),
          time: params.nonce,
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error withdrawing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Place a TWAP order (requires EIP-712 signature)
   */
  async placeTwapOrder(params: {
    coin: string;
    is_buy: boolean;
    sz: number;
    duration_minutes: number;
    random_timing: boolean;
    reduce_only: boolean;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    nonce: number;
  }) {
    try {
      const assetId = this.getAssetIndex(params.coin);

      const response = await this.post('/exchange', {
        action: {
          type: 'twapOrder',
          twap: {
            a: assetId,
            b: params.is_buy,
            s: params.sz.toString(),
            r: params.reduce_only,
            m: params.duration_minutes,
            t: params.random_timing,
          },
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error placing TWAP order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a TWAP order (requires EIP-712 signature)
   */
  async cancelTwapOrder(params: {
    coin: string;
    twapId: number;
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
          type: 'twapCancel',
          a: this.getAssetIndex(params.coin),
          t: params.twapId,
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error canceling TWAP order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Place multiple orders at once (for Scale orders)
   */
  async placeMultipleOrders(orders: Array<{
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: { limit?: { tif: string } };
    reduce_only: boolean;
  }>, signature: { r: string; s: string; v: number }, nonce: number) {
    try {
      // Format each order with shortened field names as required by Hyperliquid API
      const formattedOrders = orders.map(order => ({
        a: this.getAssetIndex(order.coin),  // asset index
        b: order.is_buy,                     // is_buy
        p: order.limit_px.toString(),        // limit price as string
        s: order.sz.toString(),              // size as string
        r: order.reduce_only,                // reduce_only
        t: order.order_type,                 // order_type
      }));

      const payload = {
        action: {
          type: 'order',
          orders: formattedOrders,
          grouping: 'na',
        },
        nonce: nonce,
        signature: signature,
      };

      const response = await this.post('/exchange', payload);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error placing multiple orders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update leverage for an asset (requires EIP-712 signature)
   */
  async updateLeverage(params: {
    coin: string;
    isCross: boolean;
    leverage: number;
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
          type: 'updateLeverage',
          asset: this.getAssetIndex(params.coin),
          isCross: params.isCross,
          leverage: params.leverage,
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating leverage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update isolated margin for a position (requires EIP-712 signature)
   */
  async updateIsolatedMargin(params: {
    coin: string;
    isBuy: boolean;
    ntli: number;
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
          type: 'updateIsolatedMargin',
          asset: this.getAssetIndex(params.coin),
          isBuy: params.isBuy,
          ntli: params.ntli,
        },
        nonce: params.nonce,
        signature: params.signature,
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating isolated margin:', error);
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
