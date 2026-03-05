'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { formatAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Pagination } from '@/components/ui/pagination';

const ROWS_PER_PAGE = 20;

interface LeaderboardEntry {
  ethAddress: string;
  displayName: string;
  accountValue: string;
  prize: number;
  rank: number;
  vlm: string;
  pnl: string;
  roi: string;
}

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const network = useNetworkStore((state) => state.network);

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', network],
    queryFn: async () => {
      const client = getInfoClient(network);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await client.getLeaderboard();

      const rows = response?.leaderboardRows ?? (Array.isArray(response) ? response : []);

      return rows.map((entry: { ethAddress: string; displayName?: string; accountValue: string; prize: number; windowPerformances?: [string, { pnl: string; roi: string; vlm: string }][] }, idx: number) => {
        const allTime = entry.windowPerformances?.find((w) => w[0] === 'allTime')?.[1];
        return {
          ethAddress: entry.ethAddress,
          displayName: entry.displayName || '',
          accountValue: entry.accountValue,
          prize: entry.prize ?? 0,
          rank: idx + 1,
          vlm: allTime?.vlm ?? '0',
          pnl: allTime?.pnl ?? '0',
          roi: allTime?.roi ?? '0',
        };
      }) as LeaderboardEntry[];
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white page-enter">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-normal text-white">
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
              const rank = entry.rank;
              const accountValue = parseFloat(entry.accountValue || '0');
              const volume = parseFloat(entry.vlm || '0');
              const pnl = parseFloat(entry.pnl || '0');

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
                    'border p-6',
                    idx === 0 ? 'md:order-2' : idx === 1 ? 'md:order-1' : 'md:order-3',
                    bgColors[idx]
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-normal text-xl',
                        colors[idx]
                      )}
                    >
                      #{rank}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{entry.displayName || formatAddress(entry.ethAddress)}</div>
                      <div className="text-xl font-normal text-[#16DE93]">
                        ${accountValue >= 1_000_000 ? `${(accountValue / 1_000_000).toFixed(1)}M` : `${(accountValue / 1_000).toFixed(1)}K`}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">PnL</span>
                      <span className={pnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'}>
                        {pnl >= 0 ? '+' : ''}${pnl >= 1_000_000 ? `${(pnl / 1_000_000).toFixed(1)}M` : `${(pnl / 1_000).toFixed(1)}K`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume</span>
                      <span className="text-white">${volume >= 1_000_000_000 ? `${(volume / 1_000_000_000).toFixed(1)}B` : `${(volume / 1_000_000).toFixed(1)}M`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-[#0a0a0c] border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-normal text-gray-300">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-normal text-gray-300">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-normal text-gray-300">
                    Account Value
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-normal text-gray-300">
                    PnL
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-normal text-gray-300">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#16DE93] border-t-transparent rounded-full animate-spin" />
                        Loading leaderboard...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#f6465d]">
                      Error loading leaderboard. Please try again later.
                    </td>
                  </tr>
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/iobit/landingpage/nofound.svg"
                          alt="No data"
                          width={48}
                          height={48}
                          className="mb-3 opacity-50"
                        />
                        <span className="text-[#8A8A8E] text-sm">
                          {network === 'testnet'
                            ? 'No leaderboard data available on testnet'
                            : 'No leaderboard data available'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
                  const pageEntries = leaderboard.slice(startIdx, startIdx + ROWS_PER_PAGE);
                  return pageEntries.map((entry) => {
                    const accountValue = parseFloat(entry.accountValue || '0');
                    const volume = parseFloat(entry.vlm || '0');
                    const pnl = parseFloat(entry.pnl || '0');
                    const rank = entry.rank;

                    return (
                      <tr
                        key={`${rank}-${entry.ethAddress}`}
                        className={cn(
                          'hover:bg-gray-800/50 transition-colors',
                          rank <= 3 && 'bg-gradient-to-r from-yellow-900/10 to-transparent'
                        )}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'font-normal',
                              rank <= 3 ? 'text-yellow-400' : 'text-gray-300'
                            )}
                          >
                            #{rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm">
                            {entry.displayName || formatAddress(entry.ethAddress)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-normal text-white">
                            ${accountValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn('font-normal', pnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                            {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-300">
                            ${volume >= 1_000_000_000 ? `${(volume / 1_000_000_000).toFixed(2)}B` : `${(volume / 1_000_000).toFixed(2)}M`}
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
        <div className="mt-6 p-4 bg-[#16DE93]/10 border border-[#16DE93]/20">
          <p className="text-sm text-[#16DE93]">
            <strong>Note:</strong> Leaderboard shows top traders ranked by account value and
            trading volume. Data is updated in real-time from Hyperliquid{' '}
            {network === 'mainnet' ? 'mainnet' : 'testnet'}.
          </p>
        </div>
      </div>
    </div>
  );
}
