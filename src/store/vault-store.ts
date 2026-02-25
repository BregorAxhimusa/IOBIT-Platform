import { create } from 'zustand';
import type { VaultSummary, VaultDetails, UserVaultEquity, VaultStatsData } from '@/lib/hyperliquid/types';

type SortField = 'tvl' | 'apr' | 'pnl' | 'followers' | 'name';
type SortDirection = 'asc' | 'desc';

interface VaultState {
  // Data
  vaults: VaultSummary[];
  vaultStats: VaultStatsData[];
  selectedVault: VaultDetails | null;
  userVaultEquities: UserVaultEquity[];

  // UI State
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  showClosedVaults: boolean;

  // Loading
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;

  // Actions
  setVaults: (vaults: VaultSummary[]) => void;
  setVaultStats: (stats: VaultStatsData[]) => void;
  setSelectedVault: (vault: VaultDetails | null) => void;
  setUserVaultEquities: (equities: UserVaultEquity[]) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleShowClosed: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingDetails: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getFilteredVaults: () => VaultStatsData[];
  getUserVaultEquity: (vaultAddress: string) => UserVaultEquity | undefined;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: [],
  vaultStats: [],
  selectedVault: null,
  userVaultEquities: [],
  searchQuery: '',
  sortField: 'tvl',
  sortDirection: 'desc',
  showClosedVaults: false,
  isLoading: false,
  isLoadingDetails: false,
  error: null,

  setVaults: (vaults) => set({ vaults }),
  setVaultStats: (vaultStats) => set({ vaultStats }),
  setSelectedVault: (selectedVault) => set({ selectedVault }),
  setUserVaultEquities: (userVaultEquities) => set({ userVaultEquities }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortField: (sortField) => set({ sortField }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
  toggleShowClosed: () => set((state) => ({ showClosedVaults: !state.showClosedVaults })),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingDetails: (isLoadingDetails) => set({ isLoadingDetails }),
  setError: (error) => set({ error }),

  getFilteredVaults: () => {
    const { vaultStats, searchQuery, sortField, sortDirection, showClosedVaults } = get();

    let filtered = [...vaultStats];

    // Filter closed vaults
    if (!showClosedVaults) {
      filtered = filtered.filter((v) => !v.isClosed);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.name ?? '').toLowerCase().includes(q) ||
          (v.leader ?? '').toLowerCase().includes(q) ||
          (v.vaultAddress ?? '').toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'tvl':
          cmp = (a.tvl ?? 0) - (b.tvl ?? 0);
          break;
        case 'apr':
          cmp = (a.apr30d ?? 0) - (b.apr30d ?? 0);
          break;
        case 'pnl':
          cmp = (a.allTimePnl ?? 0) - (b.allTimePnl ?? 0);
          break;
        case 'followers':
          cmp = (a.followerCount ?? 0) - (b.followerCount ?? 0);
          break;
        case 'name':
          cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });

    return filtered;
  },

  getUserVaultEquity: (vaultAddress) => {
    const { userVaultEquities } = get();
    return userVaultEquities.find((e) => e.vaultAddress === vaultAddress);
  },
}));
