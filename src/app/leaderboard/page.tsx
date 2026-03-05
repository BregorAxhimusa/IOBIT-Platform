'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import {
  LeaderboardTable,
  LeaderboardSearch,
  DateFilter,
  type LeaderboardEntry,
  type DateFilterValue,
} from '@/components/leaderboard';
import { PaginationFooter } from '@/components/ui/pagination';

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('30d');
  const network = useNetworkStore((state) => state.network);

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', network],
    queryFn: async () => {
      const client = getInfoClient(network);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await client.getLeaderboard();

      const rows = response?.leaderboardRows ?? (Array.isArray(response) ? response : []);

      return rows.map((entry: {
        ethAddress: string;
        displayName?: string;
        accountValue: string;
        prize: number;
        windowPerformances?: [string, { pnl: string; roi: string; vlm: string }][]
      }, idx: number) => {
        // Get performance data based on date filter
        const getWindowKey = (filter: DateFilterValue): string => {
          switch (filter) {
            case '7d': return 'day';
            case '30d': return 'month';
            case '90d': return 'allTime';
            case 'all': return 'allTime';
            default: return 'allTime';
          }
        };

        const windowKey = getWindowKey(dateFilter);
        const performance = entry.windowPerformances?.find((w) => w[0] === windowKey)?.[1] ||
          entry.windowPerformances?.find((w) => w[0] === 'allTime')?.[1];

        return {
          ethAddress: entry.ethAddress,
          displayName: entry.displayName || '',
          accountValue: entry.accountValue,
          prize: entry.prize ?? 0,
          rank: idx + 1,
          vlm: performance?.vlm ?? '0',
          pnl: performance?.pnl ?? '0',
          roi: performance?.roi ?? '0',
        };
      }) as LeaderboardEntry[];
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!leaderboard) return [];
    if (!searchQuery.trim()) return leaderboard;

    const query = searchQuery.toLowerCase();
    return leaderboard.filter(
      (entry) =>
        entry.ethAddress.toLowerCase().includes(query) ||
        entry.displayName.toLowerCase().includes(query)
    );
  }, [leaderboard, searchQuery]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0a0a0c] text-white page-enter min-h-screen">
      {/* Header Section */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="px-3 md:px-6 lg:px-8 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-8">
            <h1 className="text-2xl sm:text-4xl md:text-4xl text-center font-normal text-white md:text-left lg:text-[60px]">
              Leaderboard
            </h1>
            <p className="text-[#56565B] text-xs md:text-base max-w-md text-center md:text-left">
              Discover the top traders ranked by performance and volume. The leaderboard showcases the best in the market during the selected timeframe.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex items-center justify-between border-b border-[#1a1a1f] px-2 py-0">
        <LeaderboardSearch
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-[250px] sm:w-80"
        />
        <div className="border-l border-r border-[#1a1a1f] px-2 md:px-4 flex-shrink-0">
          <DateFilter value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden">
        <LeaderboardTable
          data={paginatedData}
          isLoading={isLoading}
          error={error as Error | null}
          emptyMessage={
            searchQuery
              ? 'No traders found matching your search'
              : network === 'testnet'
              ? 'No leaderboard data available on testnet'
              : 'No leaderboard data available'
          }
        />
      </div>

      {/* Pagination Section */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="w-full border-t border-[#1a1a1f]">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
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
