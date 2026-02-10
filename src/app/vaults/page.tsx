'use client';

import { useState } from 'react';
import { useVaults } from '@/hooks/use-vaults';
import { useUserVaults } from '@/hooks/use-user-vaults';
import { useVaultStore } from '@/store/vault-store';
import { VaultCard } from '@/components/vaults/vault-card';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import Link from 'next/link';

type Tab = 'all' | 'my';
type SortField = 'tvl' | 'apr' | 'pnl' | 'followers' | 'name';

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'tvl', label: 'TVL' },
  { value: 'apr', label: 'APR' },
  { value: 'pnl', label: 'PnL' },
  { value: 'followers', label: 'Followers' },
  { value: 'name', label: 'Name' },
];

export default function VaultsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const { isLoading } = useVaults();
  const { equities, isLoading: isLoadingUser } = useUserVaults();

  const searchQuery = useVaultStore((state) => state.searchQuery);
  const setSearchQuery = useVaultStore((state) => state.setSearchQuery);
  const sortField = useVaultStore((state) => state.sortField);
  const setSortField = useVaultStore((state) => state.setSortField);
  const sortDirection = useVaultStore((state) => state.sortDirection);
  const setSortDirection = useVaultStore((state) => state.setSortDirection);
  const showClosedVaults = useVaultStore((state) => state.showClosedVaults);
  const toggleShowClosed = useVaultStore((state) => state.toggleShowClosed);
  const getFilteredVaults = useVaultStore((state) => state.getFilteredVaults);

  const filteredVaults = getFilteredVaults();

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white page-enter">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Vaults</h1>
          <p className="text-gray-400 text-sm">
            Deposit into vaults managed by top traders. Earn returns based on their performance.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-[#1a2028] rounded-lg p-1">
            <button
              onClick={() => setTab('all')}
              className={cn(
                'px-4 py-2 text-sm rounded-md transition-colors',
                tab === 'all'
                  ? 'bg-[#14b8a6] text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              All Vaults
            </button>
            <button
              onClick={() => setTab('my')}
              className={cn(
                'px-4 py-2 text-sm rounded-md transition-colors',
                tab === 'my'
                  ? 'bg-[#14b8a6] text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              My Vaults {equities.length > 0 && `(${equities.length})`}
            </button>
          </div>
        </div>

        {tab === 'all' ? (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vaults..."
                  className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Sort by:</span>
                <div className="flex bg-[#1a2028] rounded-lg p-0.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (sortField === opt.value) {
                          setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortField(opt.value);
                          setSortDirection('desc');
                        }
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md transition-colors',
                        sortField === opt.value
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      {opt.label}
                      {sortField === opt.value && (
                        <span className="ml-1">{sortDirection === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Closed Toggle */}
              <button
                onClick={toggleShowClosed}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                  showClosedVaults
                    ? 'border-gray-600 text-white bg-gray-800'
                    : 'border-gray-700 text-gray-400 hover:text-white'
                )}
              >
                {showClosedVaults ? 'Hide Closed' : 'Show Closed'}
              </button>
            </div>

            {/* Vaults Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-8 bg-gray-700 rounded" />
                      <div className="h-8 bg-gray-700 rounded" />
                      <div className="h-8 bg-gray-700 rounded" />
                      <div className="h-8 bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVaults.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                {searchQuery ? 'No vaults match your search' : 'No vaults available'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVaults.map((vault) => (
                  <VaultCard key={vault.vaultAddress} vault={vault} />
                ))}
              </div>
            )}

            {/* Count */}
            {!isLoading && filteredVaults.length > 0 && (
              <div className="mt-4 text-center text-gray-500 text-xs">
                Showing {filteredVaults.length} vault{filteredVaults.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        ) : (
          /* My Vaults Tab */
          <div>
            {isLoadingUser ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : equities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <p className="text-sm mb-2">You haven&apos;t deposited into any vaults yet</p>
                <button
                  onClick={() => setTab('all')}
                  className="text-[#14b8a6] text-sm hover:underline"
                >
                  Browse all vaults
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {equities.map((eq) => {
                  const equity = parseFloat(eq.equity);
                  const pnl = parseFloat(eq.pnl);
                  const isLocked = eq.lockedUntil ? Date.now() < eq.lockedUntil : false;

                  return (
                    <Link
                      key={eq.vaultAddress}
                      href={`/vaults/${eq.vaultAddress}`}
                      className="block"
                    >
                      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-mono text-sm">
                              {formatAddress(eq.vaultAddress)}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-gray-400 text-xs">
                                Equity: <span className="text-white">{formatCurrency(equity)}</span>
                              </span>
                              <span className="text-xs">
                                PnL:{' '}
                                <span
                                  className={cn(
                                    'font-medium',
                                    pnl >= 0 ? 'text-green-400' : 'text-red-400'
                                  )}
                                >
                                  {pnl >= 0 ? '+' : ''}
                                  {formatCurrency(pnl)}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLocked && (
                              <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded">
                                Locked
                              </span>
                            )}
                            <span className="text-gray-400 text-sm">&rarr;</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
