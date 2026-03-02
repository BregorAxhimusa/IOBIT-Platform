import { HYPERLIQUID_MAINNET_API, HYPERLIQUID_TESTNET_API, HYPERLIQUID_STATS_API, type Network } from '../utils/constants';
import type { AllMids, L2Book, UserState, CandleSnapshot, SpotMeta, SpotClearinghouseState, SpotAssetCtx, UserFill, FundingPayment, LedgerUpdate, VaultDetails, UserVaultEquity, VaultStatsData, SubAccount, ApiWallet, ReferralInfo, ValidatorSummary, Delegation, StakingState, DelegatorHistoryEvent, DelegatorReward, UserFees } from './types';

/**
 * Hyperliquid Info Client (Read-Only)
 * For fetching market data, order books, user positions, etc.
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
   * Get current network (mainnet or testnet)
   */
  getNetwork(): Network {
    return this.network;
  }

  /**
   * Get all mid prices for all markets
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
   * Get order book for a specific symbol
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
   * Get metadata for all assets
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
   * Get metadata and asset contexts
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
   * Get user state (positions, balances, margin)
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
   * Get candle data (OHLCV) for charting
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
   * Get funding rate for a symbol
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
   * Get open orders for a user
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
   * Get user fills (trade history)
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
   * Get historical orders (order history) for a user
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
   * Get TWAP slice fills for user (to track TWAP progress)
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
   * Get metadata for all spot assets
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
   * Get user's spot balance (token balances)
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
   * Get spot meta + price context
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

  // ===== PORTFOLIO ENDPOINTS =====

  /**
   * Get user fills with time range (max 500 per request, paginate with startTime)
   */
  async getUserFillsByTime(
    address: string,
    startTime: number,
    endTime?: number
  ): Promise<UserFill[]> {
    try {
      const response = await this.post<UserFill[]>('/info', {
        type: 'userFillsByTime',
        user: address,
        startTime,
        ...(endTime && { endTime }),
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching user fills by time for ${address}:`, error);
      return [];
    }
  }

  /**
   * Get funding payments for user (max 500 per request)
   */
  async getUserFunding(
    address: string,
    startTime: number,
    endTime?: number
  ): Promise<FundingPayment[]> {
    try {
      const response = await this.post<FundingPayment[]>('/info', {
        type: 'userFunding',
        user: address,
        startTime,
        ...(endTime && { endTime }),
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching user funding for ${address}:`, error);
      return [];
    }
  }

  /**
   * Get non-funding ledger updates (deposits, withdrawals, transfers)
   */
  async getUserNonFundingLedgerUpdates(
    address: string,
    startTime: number,
    endTime?: number
  ): Promise<LedgerUpdate[]> {
    try {
      const response = await this.post<LedgerUpdate[]>('/info', {
        type: 'userNonFundingLedgerUpdates',
        user: address,
        startTime,
        ...(endTime && { endTime }),
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching ledger updates for ${address}:`, error);
      return [];
    }
  }

  // ===== VAULT ENDPOINTS =====

  /**
   * Get vault summaries (may return [] if no data available)
   */
  async getVaultSummaries(): Promise<unknown[]> {
    try {
      const response = await this.post<unknown[]>('/info', {
        type: 'vaultSummaries',
      });
      return response || [];
    } catch (error) {
      console.error('Error fetching vault summaries:', error);
      return [];
    }
  }

  /**
   * Get details of a specific vault
   */
  async getVaultDetails(vaultAddress: string, user?: string): Promise<VaultDetails | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any = await this.post('/info', {
        type: 'vaultDetails',
        vaultAddress,
        ...(user && { user }),
      });
      if (!raw) return null;

      // Extract TVL and PnL from the allTime portfolio period
      const allTimePeriod = raw.portfolio?.find((p: [string, unknown]) => p[0] === 'allTime');
      const periodData = allTimePeriod?.[1] as { accountValueHistory?: [number, string][]; pnlHistory?: [number, string][]; vlm?: string } | undefined;
      const latestAccountValue = periodData?.accountValueHistory?.at(-1)?.[1] ?? '0';
      const latestPnl = periodData?.pnlHistory?.at(-1)?.[1] ?? '0';

      // Build portfolioPeriods from period data
      const portfolioPeriods = (raw.portfolio ?? [])
        .filter((p: [string, unknown]) => ['day', 'week', 'month', 'allTime'].includes(p[0]))
        .map((p: [string, { pnlHistory?: [number, string][]; vlm?: string }]) => {
          const pnlEntries = p[1]?.pnlHistory ?? [];
          const lastPnl = pnlEntries.at(-1)?.[1] ?? '0';
          return {
            period: p[0],
            pnl: lastPnl,
            vlm: p[1]?.vlm?.toString() ?? '0',
            apr: 0,
          };
        });

      // Map followers
      const followers = (raw.followers ?? []).map((f: { user: string; vaultEquity: string; pnl: string; lockupUntil?: number; vaultEntryTime?: number }) => ({
        user: f.user,
        equity: f.vaultEquity ?? '0',
        pnl: f.pnl ?? '0',
        lockedUntil: f.lockupUntil ?? 0,
        vaultEntryTime: f.vaultEntryTime ?? 0,
      }));

      // Fetch actual positions from clearinghouse
      let positions: VaultDetails['portfolio'] = [];
      try {
        const state = await this.getUserState(vaultAddress);
        if (state?.assetPositions) {
          positions = state.assetPositions
            .filter((ap) => parseFloat(ap.position.szi) !== 0)
            .map((ap) => ({
              coin: ap.position.coin,
              szi: ap.position.szi,
              entryPx: ap.position.entryPx ?? '0',
              positionValue: ap.position.positionValue,
              unrealizedPnl: ap.position.unrealizedPnl,
            }));
        }
      } catch {
        // Positions fetch is optional
      }

      return {
        summary: {
          vaultAddress: raw.vaultAddress,
          name: raw.name ?? '',
          leader: raw.leader ?? '',
          leaderCommission: raw.leaderCommission ?? 0,
          apr: raw.apr ?? 0,
          tvl: latestAccountValue,
          pnl: latestPnl,
          followerCount: followers.length,
          description: raw.description ?? '',
          portfolioPeriods,
          isClosed: raw.isClosed ?? false,
          maxDistributable: raw.maxDistributable ?? '0',
          maxWithdrawable: raw.maxWithdrawable ?? '0',
          ...(raw.relationship && { relationship: raw.relationship }),
        },
        followers,
        portfolio: positions,
      };
    } catch (error) {
      console.error(`Error fetching vault details for ${vaultAddress}:`, error);
      return null;
    }
  }

  /**
   * Get user's equity in vaults
   */
  async getUserVaultEquities(user: string): Promise<UserVaultEquity[]> {
    try {
      const response = await this.post<UserVaultEquity[]>('/info', {
        type: 'userVaultEquities',
        user,
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching user vault equities for ${user}:`, error);
      return [];
    }
  }

  /**
   * Get vaults list from stats-data endpoint (fallback)
   */
  async getVaultsList(): Promise<VaultStatsData[]> {
    try {
      const networkStr = this.network === 'mainnet' ? 'Mainnet' : 'Testnet';
      const response = await fetch(`${HYPERLIQUID_STATS_API}/${networkStr}/vaults`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const raw: {
        apr: number;
        pnls: [string, string[]][];
        summary: {
          name: string;
          vaultAddress: string;
          leader: string;
          tvl: string;
          isClosed: boolean;
        };
      }[] = await response.json();

      return raw.map((v) => {
        const allTimePnls = v.pnls.find((p) => p[0] === 'allTime')?.[1] ?? [];
        const lastPnl = allTimePnls.length > 0 ? parseFloat(allTimePnls[allTimePnls.length - 1]) || 0 : 0;

        return {
          vaultAddress: v.summary.vaultAddress,
          name: v.summary.name,
          leader: v.summary.leader,
          tvl: parseFloat(v.summary.tvl) || 0,
          apr30d: v.apr || 0,
          allTimePnl: lastPnl,
          followerCount: 0,
          leaderCommission: 0,
          isClosed: v.summary.isClosed || false,
        };
      });
    } catch (error) {
      console.error('Error fetching vaults list from stats-data:', error);
      return [];
    }
  }

  // ===== SUB-ACCOUNT & API WALLET ENDPOINTS =====

  /**
   * Get sub-accounts for a user (master wallet)
   */
  async getSubAccounts(user: string): Promise<SubAccount[]> {
    try {
      const response = await this.post<SubAccount[]>('/info', {
        type: 'subAccounts',
        user,
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching sub-accounts for ${user}:`, error);
      return [];
    }
  }

  /**
   * Get extra agents (API wallets) for a user
   */
  async getExtraAgents(user: string): Promise<ApiWallet[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.post<any>('/info', {
        type: 'extraAgents',
        user,
      });
      // API may return array directly or wrapped in { extraAgents: [...] }
      if (Array.isArray(response)) return response;
      if (response?.extraAgents && Array.isArray(response.extraAgents)) return response.extraAgents;
      return [];
    } catch (error) {
      console.error(`Error fetching extra agents for ${user}:`, error);
      return [];
    }
  }

  /**
   * Get user role (master, subAccount, apiWallet)
   */
  async getUserRole(user: string): Promise<{ role: string; master?: string } | null> {
    try {
      const response = await this.post<{ role: string; master?: string }>('/info', {
        type: 'userRole',
        user,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching user role for ${user}:`, error);
      return null;
    }
  }

  // ===== REFERRAL ENDPOINTS =====

  async getReferralInfo(user: string): Promise<ReferralInfo | null> {
    try {
      const response = await this.post<ReferralInfo>('/info', {
        type: 'referral',
        user,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching referral info for ${user}:`, error);
      return null;
    }
  }

  // ===== STAKING ENDPOINTS =====

  async getValidatorSummaries(): Promise<ValidatorSummary[]> {
    try {
      const response = await this.post<ValidatorSummary[]>('/info', {
        type: 'validatorSummaries',
      });
      return response || [];
    } catch (error) {
      console.error('Error fetching validator summaries:', error);
      return [];
    }
  }

  async getDelegations(user: string): Promise<Delegation[]> {
    try {
      const response = await this.post<Delegation[]>('/info', {
        type: 'delegations',
        user,
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching delegations for ${user}:`, error);
      return [];
    }
  }

  async getStakingState(user: string): Promise<StakingState | null> {
    try {
      const response = await this.post<StakingState>('/info', {
        type: 'delegatorSummary',
        user,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching staking state for ${user}:`, error);
      return null;
    }
  }

  async getDelegatorHistory(user: string): Promise<DelegatorHistoryEvent[]> {
    try {
      const response = await this.post<DelegatorHistoryEvent[]>('/info', {
        type: 'delegatorHistory',
        user,
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching delegator history for ${user}:`, error);
      return [];
    }
  }

  async getDelegatorRewards(user: string): Promise<DelegatorReward[]> {
    try {
      const response = await this.post<DelegatorReward[]>('/info', {
        type: 'delegatorRewards',
        user,
      });
      return response || [];
    } catch (error) {
      console.error(`Error fetching delegator rewards for ${user}:`, error);
      return [];
    }
  }

  // ===== USER FEES ENDPOINT =====

  async getUserFees(user: string): Promise<UserFees | null> {
    try {
      const response = await this.post<UserFees>('/info', {
        type: 'userFees',
        user,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching user fees for ${user}:`, error);
      return null;
    }
  }

  /**
   * Get leaderboard data from stats-data endpoint
   */
  async getLeaderboard() {
    try {
      const networkStr = this.network === 'mainnet' ? 'Mainnet' : 'Testnet';
      const response = await fetch(`${HYPERLIQUID_STATS_API}/${networkStr}/leaderboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
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
