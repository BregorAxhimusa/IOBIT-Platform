import { HYPERLIQUID_MAINNET_API, HYPERLIQUID_TESTNET_API, type Network } from '../utils/constants';
import type { AllMids, L2Book, UserState, CandleSnapshot, SpotMeta, SpotClearinghouseState, SpotAssetCtx } from './types';

/**
 * Hyperliquid Info Client (Read-Only)
 * Për të marrë market data, order books, user positions, etj.
 */
export class HyperliquidInfoClient {
  private baseUrl: string;
  private network: Network;

  constructor(network: Network = 'mainnet') {
    this.network = network;
    this.baseUrl = network === 'mainnet' ? HYPERLIQUID_MAINNET_API : HYPERLIQUID_TESTNET_API;
  }

  /**
   * Generic POST request to Hyperliquid API
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Merr rrjetin aktual (mainnet ose testnet)
   */
  getNetwork(): Network {
    return this.network;
  }

  /**
   * Merr të gjitha mid prices për të gjitha markets
   */
  async getAllMids(): Promise<AllMids> {
    try {
      const response = await this.post<{ mids: AllMids }>('/info', {
        type: 'allMids',
      });
      return response.mids || {};
    } catch (error) {
      console.error('Error fetching all mids:', error);
      return {};
    }
  }

  /**
   * Merr order book për një symbol të caktuar
   */
  async getL2Book(coin: string): Promise<L2Book | null> {
    try {
      const response = await this.post<L2Book>('/info', {
        type: 'l2Book',
        coin,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching L2 book for ${coin}:`, error);
      return null;
    }
  }

  /**
   * Merr metadata për të gjitha assets
   */
  async getMeta() {
    try {
      const response = await this.post('/info', {
        type: 'meta',
      });
      return response;
    } catch (error) {
      console.error('Error fetching meta:', error);
      throw error;
    }
  }

  /**
   * Merr metadata dhe asset contexts
   * Returns: [meta, assetCtxs] array
   */
  async getMetaAndAssetCtxs() {
    try {
      const response = await this.post<[
        { universe: { name: string; szDecimals: number; maxLeverage: number }[] },
        {
          markPx: string;
          midPx: string;
          prevDayPx: string;
          dayNtlVlm: string;
          funding: string;
          openInterest: string;
        }[]
      ]>('/info', {
        type: 'metaAndAssetCtxs',
      });
      return response;
    } catch (error) {
      console.error('Error fetching metaAndAssetCtxs:', error);
      throw error;
    }
  }

  /**
   * Merr user state (positions, balances, margin)
   */
  async getUserState(address: string): Promise<UserState | null> {
    try {
      const response = await this.post<UserState>('/info', {
        type: 'clearinghouseState',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching user state for ${address}:`, error);
      return null;
    }
  }

  /**
   * Merr candle data (OHLCV) për charting
   */
  async getCandleSnapshot(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number
  ): Promise<CandleSnapshot[]> {
    try {
      const response = await this.post<CandleSnapshot[]>('/info', {
        type: 'candleSnapshot',
        req: {
          coin,
          interval,
          startTime,
          endTime,
        },
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching candles for ${coin}:`, error);
      return [];
    }
  }

  /**
   * Merr funding rate për një symbol
   */
  async getFundingHistory(coin: string, startTime?: number, endTime?: number) {
    try {
      const response = await this.post('/info', {
        type: 'fundingHistory',
        coin,
        startTime,
        endTime,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching funding history for ${coin}:`, error);
      return [];
    }
  }

  /**
   * Merr open orders për një user
   */
  async getOpenOrders(address: string) {
    try {
      const response = await this.post('/info', {
        type: 'frontendOpenOrders',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching open orders for ${address}:`, error);
      return [];
    }
  }

  /**
   * Merr user fills (trade history)
   */
  async getUserFills(address: string) {
    try {
      const response = await this.post('/info', {
        type: 'userFills',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching user fills for ${address}:`, error);
      return [];
    }
  }

  /**
   * Merr historical orders (order history) për një user
   */
  async getHistoricalOrders(address: string) {
    try {
      const response = await this.post('/info', {
        type: 'historicalOrders',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching historical orders for ${address}:`, error);
      return [];
    }
  }

  /**
   * Merr TWAP slice fills per user (to track TWAP progress)
   */
  async getUserTwapSliceFills(address: string) {
    try {
      const response = await this.post('/info', {
        type: 'userTwapSliceFills',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching TWAP slice fills for ${address}:`, error);
      return [];
    }
  }

  // ===== SPOT ENDPOINTS =====

  /**
   * Merr metadata për të gjitha spot asset-et
   */
  async getSpotMeta(): Promise<SpotMeta | null> {
    try {
      const response = await this.post<SpotMeta>('/info', {
        type: 'spotMeta',
      });
      return response;
    } catch (error) {
      console.error('Error fetching spot meta:', error);
      return null;
    }
  }

  /**
   * Merr bilancin spot të userit (token balances)
   */
  async getSpotClearinghouseState(address: string): Promise<SpotClearinghouseState | null> {
    try {
      const response = await this.post<SpotClearinghouseState>('/info', {
        type: 'spotClearinghouseState',
        user: address,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching spot clearinghouse state for ${address}:`, error);
      return null;
    }
  }

  /**
   * Merr spot meta + kontekstin e çmimeve
   */
  async getSpotMetaAndAssetCtxs(): Promise<[SpotMeta, SpotAssetCtx[]] | null> {
    try {
      const response = await this.post<[SpotMeta, SpotAssetCtx[]]>('/info', {
        type: 'spotMetaAndAssetCtxs',
      });
      return response;
    } catch (error) {
      console.error('Error fetching spot meta and asset ctxs:', error);
      return null;
    }
  }

  /**
   * Merr leaderboard data
   */
  async getLeaderboard() {
    try {
      const response = await this.post('/info', {
        type: 'leaderboard',
      });
      return response;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}

// Export singleton instance
let infoClient: HyperliquidInfoClient | null = null;

export function getInfoClient(network: Network = 'mainnet'): HyperliquidInfoClient {
  if (!infoClient || infoClient.getNetwork() !== network) {
    infoClient = new HyperliquidInfoClient(network);
  }
  return infoClient;
}
