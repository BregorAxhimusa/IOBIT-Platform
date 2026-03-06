'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';

export interface LeaderboardEntry {
  ethAddress: string;
  displayName: string;
  accountValue: string;
  prize: number;
  rank: number;
  vlm: string;
  pnl: string;
  roi: string;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
}

export function LeaderboardTable({
  data,
  isLoading,
  error,
  emptyMessage = 'No leaderboard data available',
}: LeaderboardTableProps) {
  const router = useRouter();

  const handleRowClick = (address: string) => {
    router.push(`/leaderboard/address?address=${address}`);
  };

  const formatValue = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    }
    if (value >= 1_000) {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPnl = (pnl: number): string => {
    const prefix = pnl >= 0 ? '+' : '';
    if (Math.abs(pnl) >= 1_000_000_000) {
      return `${prefix}$${(Math.abs(pnl) / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
    }
    if (Math.abs(pnl) >= 1_000_000) {
      return `${prefix}$${(Math.abs(pnl) / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
    }
    return `${prefix}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatRoi = (roi: number): string => {
    const prefix = roi >= 0 ? '+' : '';
    return `${prefix}${roi.toFixed(2)}%`;
  };

  return (
    <div className="overflow-x-auto scrollbar-dark">
      <table className="w-full min-w-[360px] text-xs md:text-sm">
        <thead>
          <tr className="text-[#6b6b6b] text-[10px] md:text-xs border-b border-[#1a1a1f]">
            <th className="text-left py-3 md:py-4 px-2 font-medium whitespace-nowrap">Rank</th>
            <th className="text-left py-3 md:py-4 px-2 font-medium whitespace-nowrap">Trader</th>
            <th className="text-right py-3 md:py-4 px-2 font-medium whitespace-nowrap">Account Value</th>
            <th className="text-right py-3 md:py-4 px-2 font-medium whitespace-nowrap hidden sm:table-cell">PNL (30d)</th>
            <th className="text-right py-3 md:py-4 px-2 font-medium whitespace-nowrap hidden lg:table-cell">ROI (30d)</th>
            <th className="text-right py-3 md:py-4 px-2 font-medium whitespace-nowrap hidden md:table-cell">Volume (30d)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-[#1a1a1f]">
                <td className="py-2 px-2"><div className="w-6 md:w-8 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-2 px-2"><div className="flex items-center gap-2 md:gap-3"><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1a1a1f] animate-pulse" /><div className="w-16 md:w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></div></td>
                <td className="py-2 px-2"><div className="w-16 md:w-28 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                <td className="py-2 px-2 hidden sm:table-cell"><div className="w-16 md:w-24 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                <td className="py-2 px-2 hidden lg:table-cell"><div className="w-12 md:w-16 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                <td className="py-2 px-2 hidden md:table-cell"><div className="w-20 md:w-28 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={6} className="py-12 md:py-16 text-center text-[#f6465d] text-xs md:text-sm">
                Error loading leaderboard. Please try again later.
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 md:py-16 text-center">
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <Image
                    src="/iobit/landingpage/nofound.svg"
                    alt="No data"
                    width={40}
                    height={40}
                    className="opacity-50 md:w-12 md:h-12"
                  />
                  <p className="text-[#8A8A8E] text-xs md:text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((entry) => {
              const accountValue = parseFloat(entry.accountValue || '0');
              const pnl = parseFloat(entry.pnl || '0');
              const roi = parseFloat(entry.roi || '0') * 100;
              const volume = parseFloat(entry.vlm || '0');

              return (
                <tr
                  key={`${entry.rank}-${entry.ethAddress}`}
                  onClick={() => handleRowClick(entry.ethAddress)}
                  className="border-b border-[#1a1a1f] last:border-b-0 hover:bg-[#16DE93]/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-2 px-2">
                    <span
                      className={cn(
                        'text-xs md:text-sm font-medium',
                        entry.rank <= 3 ? 'text-[#16DE93]' : 'text-white'
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1a1a1f] flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 text-[#6b6b6b]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-white text-xs md:text-sm truncate max-w-[80px] sm:max-w-none">
                        {entry.displayName || formatAddress(entry.ethAddress)}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
                      {formatValue(accountValue)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right hidden sm:table-cell">
                    <span
                      className={cn(
                        'text-xs md:text-sm font-medium whitespace-nowrap',
                        pnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                      )}
                    >
                      {formatPnl(pnl)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right hidden lg:table-cell">
                    <span
                      className={cn(
                        'text-xs md:text-sm font-medium whitespace-nowrap',
                        roi >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                      )}
                    >
                      {formatRoi(roi)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right hidden md:table-cell">
                    <span className="text-[#a0a0a5] text-xs md:text-sm whitespace-nowrap">{formatValue(volume)}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
