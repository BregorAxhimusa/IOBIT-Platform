'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { cn } from '@/lib/utils/cn';
import { Pagination } from '@/components/ui/pagination';

const ROWS_PER_PAGE = 20;

interface LeaderboardEntry {
  accountValue: string;
  prize: string;
  rank?: number;
  vlm: string;
  windowStart?: number;
}

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const network = useNetworkStore((state) => state.network);

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', network],
    queryFn: async () => {
      const client = getInfoClient(network);
      const response = await client.getLeaderboard();

      // Hyperliquid API returns array of leaderboard entries
      if (Array.isArray(response)) {
        return response as LeaderboardEntry[];
      }

      return [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white page-enter">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            Leaderboard
          </h1>
          <p className="text-gray-400">
            Top traders on Hyperliquid {network === 'testnet' ? 'Testnet' : 'Mainnet'}
          </p>
        </div>

        {/* Top 3 Podium */}
        {!isLoading && !error && leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {leaderboard.slice(0, 3).map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const accountValue = parseFloat(entry.accountValue || '0');
              const volume = parseFloat(entry.vlm || '0');
              const prize = parseFloat(entry.prize || '0');

              const colors = [
                'from-yellow-500 to-yellow-600',
                'from-gray-400 to-gray-500',
                'from-orange-600 to-orange-700',
              ];
              const bgColors = [
                'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30',
                'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30',
                'bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-600/30',
              ];

              return (
                <div
                  key={rank}
                  className={cn(
                    'border rounded-lg p-6',
                    idx === 0 ? 'md:order-2' : idx === 1 ? 'md:order-1' : 'md:order-3',
                    bgColors[idx]
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl',
                        colors[idx]
                      )}
                    >
                      #{rank}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Account Value</div>
                      <div className="text-xl font-bold text-green-400">
                        ${(accountValue / 1000).toFixed(1)}K
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume</span>
                      <span className="text-white">${(volume / 1000000).toFixed(1)}M</span>
                    </div>
                    {prize > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prize</span>
                        <span className="text-green-400 font-semibold">
                          ${prize.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-[#0f1419] border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Account Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Volume
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Prize
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading leaderboard...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-red-400">
                      Error loading leaderboard. Please try again later.
                    </td>
                  </tr>
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {network === 'testnet'
                        ? 'No leaderboard data available on testnet'
                        : 'No leaderboard data available'}
                    </td>
                  </tr>
                ) : (() => {
                  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
                  const pageEntries = leaderboard.slice(startIdx, startIdx + ROWS_PER_PAGE);
                  return pageEntries.map((entry, index) => {
                    const accountValue = parseFloat(entry.accountValue || '0');
                    const volume = parseFloat(entry.vlm || '0');
                    const prize = parseFloat(entry.prize || '0');
                    const rank = entry.rank || startIdx + index + 1;

                    // Medal emoji for top 3
                    const getMedal = (rank: number) => {
                      if (rank === 1) return '🥇';
                      if (rank === 2) return '🥈';
                      if (rank === 3) return '🥉';
                      return null;
                    };

                    return (
                      <tr
                        key={`${rank}-${entry.accountValue}`}
                        className={cn(
                          'hover:bg-gray-800/50 transition-colors',
                          rank <= 3 && 'bg-gradient-to-r from-yellow-900/10 to-transparent'
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getMedal(rank) && (
                              <span className="text-xl">{getMedal(rank)}</span>
                            )}
                            <span
                              className={cn(
                                'font-semibold',
                                rank <= 3 ? 'text-yellow-400' : 'text-gray-300'
                              )}
                            >
                              #{rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            ${accountValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-300">
                            ${(volume / 1000000).toFixed(2)}M
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={cn(
                              'font-medium',
                              prize > 0 ? 'text-green-400' : 'text-gray-500'
                            )}
                          >
                            {prize > 0
                              ? `$${prize.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : '--'}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && !error && leaderboard && leaderboard.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(leaderboard.length / ROWS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalItems={leaderboard.length}
            itemLabel="traders"
          />
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
          <p className="text-sm text-teal-300">
            <strong>Note:</strong> Leaderboard shows top traders ranked by account value and
            trading volume. Data is updated in real-time from Hyperliquid{' '}
            {network === 'mainnet' ? 'mainnet' : 'testnet'}.
          </p>
        </div>
      </div>
    </div>
  );
}
