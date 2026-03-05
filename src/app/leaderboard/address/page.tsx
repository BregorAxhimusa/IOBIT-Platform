'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { formatAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { PaginationFooter } from '@/components/ui/pagination';

interface TraderStats {
  accountValue: string;
  pnl: string;
  roi: string;
  volume: string;
}

interface FillEntry {
  coin: string;
  px: string;
  sz: string;
  side: string;
  time: number;
  hash: string;
  fee: string;
  startPosition: string;
  closedPnl: string;
  oid: number;
  crossed: boolean;
}

export default function TraderDetailsPage() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address') || '';
  const network = useNetworkStore((state) => state.network);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch trader's user state for stats
  const { data: statsData } = useQuery({
    queryKey: ['trader-stats', address, network],
    queryFn: async () => {
      if (!address) return null;
      const client = getInfoClient(network);
      const state = await client.getUserState(address);
      if (!state) return null;

      // Calculate total PnL from positions
      let totalPnl = 0;
      state.assetPositions?.forEach((pos: { position: { unrealizedPnl?: string } }) => {
        totalPnl += parseFloat(pos.position?.unrealizedPnl || '0');
      });

      return {
        accountValue: state.crossMarginSummary?.accountValue || '0',
        pnl: totalPnl.toString(),
        roi: '0',
        volume: '0',
      } as TraderStats;
    },
    enabled: !!address,
    staleTime: 30000,
  });

  // Fetch trader's fills (transactions)
  const { data: fillsData, isLoading: fillsLoading, error: fillsError } = useQuery({
    queryKey: ['trader-fills', address, network],
    queryFn: async () => {
      if (!address) return [];
      const client = getInfoClient(network);
      const fills = await client.getUserFills(address);
      return (fills || []) as FillEntry[];
    },
    enabled: !!address,
    staleTime: 30000,
  });

  // Paginate fills
  const paginatedFills = useMemo(() => {
    if (!fillsData) return [];
    const startIdx = (currentPage - 1) * rowsPerPage;
    return fillsData.slice(startIdx, startIdx + rowsPerPage);
  }, [fillsData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil((fillsData?.length || 0) / rowsPerPage);

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const formatValue = (value: number): string => {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHash = (hash: string): string => {
    if (!hash) return '-';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="bg-[#0a0a0c] text-white page-enter min-h-screen">
      {/* Breadcrumb Header */}
      <div className="w-full">
        <div className="px-3 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <Link
              href="/leaderboard"
              className="text-[#56565B] hover:text-white transition-colors uppercase tracking-wider"
            >
              Leaderboard
            </Link>
            <span className="text-[#56565B]">/</span>
            <span className="text-[#16DE93] uppercase tracking-wider">Trader Details</span>
          </div>
        </div>
      </div>

      {/* Trader Info Header */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-light text-white font-mono">
                {formatAddress(address, 8)}
              </h1>
              <p className="text-[#56565B] text-xs md:text-sm mt-1 font-mono truncate">{address}</p>
            </div>

            {/* Quick Stats */}
            {statsData && (
              <div className="flex gap-6 md:gap-6">
                <div>
                  <p className="text-[#56565B] text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1">Account Value</p>
                  <p className="text-white text-base md:text-xl font-medium">
                    {formatValue(parseFloat(statsData.accountValue || '0'))}
                  </p>
                </div>
                <div>
                  <p className="text-[#56565B] text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1">PnL</p>
                  <p
                    className={cn(
                      'text-base md:text-xl font-medium',
                      parseFloat(statsData.pnl) >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                    )}
                  >
                    {formatValue(parseFloat(statsData.pnl || '0'))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table Header */}
      <div className="flex items-center justify-between border-b border-[#1a1a1f] px-2 md:px-2 py-0">
        <h2 className="text-sm md:text-lg font-medium text-white px-1 md:px-2">Recent Transactions</h2>
        <div className="border-l border-r border-[#1a1a1f] px-2 md:px-4">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2.5 md:py-3 text-[#56565B] hover:text-white transition-colors text-xs md:text-sm"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Leaderboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-dark">
          <table className="w-full min-w-[400px] text-xs md:text-sm">
            <thead>
              <tr className="text-[#6b6b6b] text-[10px] md:text-xs border-b border-[#1a1a1f]">
                <th className="text-left py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap">Hash</th>
                <th className="text-left py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap">Action</th>
                <th className="text-left py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap">Coin</th>
                <th className="text-right py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap hidden sm:table-cell">Size</th>
                <th className="text-right py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap hidden sm:table-cell">Price</th>
                <th className="text-right py-3 md:py-4 px-2 md:px-2 font-medium whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody>
              {fillsLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1a1a1f]">
                    <td className="py-2 px-2"><div className="w-16 md:w-20 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                    <td className="py-2 px-2"><div className="w-10 md:w-12 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                    <td className="py-2 px-2"><div className="w-10 md:w-12 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                    <td className="py-2 px-2 hidden sm:table-cell"><div className="w-14 md:w-16 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                    <td className="py-2 px-2 hidden sm:table-cell"><div className="w-16 md:w-20 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                    <td className="py-2 px-2"><div className="w-16 md:w-24 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : fillsError ? (
                <tr>
                  <td colSpan={6} className="py-12 md:py-16 text-center text-[#f6465d] text-xs md:text-sm">
                    Error loading transactions. Please try again later.
                  </td>
                </tr>
              ) : !paginatedFills || paginatedFills.length === 0 ? (
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
                      <p className="text-[#8A8A8E] text-xs md:text-sm">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedFills.map((fill, idx) => (
                  <tr
                    key={`${fill.hash}-${fill.oid}-${idx}`}
                    className="border-b border-[#1a1a1f] last:border-b-0 hover:bg-[#16DE93]/[0.03] transition-colors"
                  >
                    <td className="py-2 px-2">
                      <span className="text-white text-xs md:text-sm font-mono">
                        {formatHash(fill.hash)}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-medium uppercase',
                          fill.side === 'B'
                            ? 'bg-[#16DE93]/10 text-[#16DE93]'
                            : 'bg-[#f6465d]/10 text-[#f6465d]'
                        )}
                      >
                        {fill.side === 'B' ? 'Buy' : 'Sell'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-white text-xs md:text-sm">{fill.coin}</span>
                    </td>
                    <td className="py-2 px-2 text-right hidden sm:table-cell">
                      <span className="text-white text-xs md:text-sm">{parseFloat(fill.sz).toFixed(4)}</span>
                    </td>
                    <td className="py-2 px-2 text-right hidden sm:table-cell">
                      <span className="text-white text-xs md:text-sm">
                        ${parseFloat(fill.px).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-[#6b6b6b] text-xs md:text-sm whitespace-nowrap">{formatTime(fill.time)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      {!fillsLoading && !fillsError && fillsData && fillsData.length > 0 && (
        <div className="w-full border-t border-[#1a1a1f]">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={fillsData.length}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowOptions={[10, 20, 50]}
            className="px-3 md:px-6 lg:px-8"
          />
        </div>
      )}
    </div>
  );
}
