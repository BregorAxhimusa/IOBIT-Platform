'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatAddress } from '@/lib/utils/format';
import type { TransactionEntry } from './types';

interface TransactionsTableProps {
  data: TransactionEntry[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  showBlockColumn?: boolean;
}

export function TransactionsTable({
  data,
  isLoading,
  error,
  emptyMessage = 'No transactions found',
  showBlockColumn = true,
}: TransactionsTableProps) {
  const router = useRouter();

  const handleRowClick = (hash: string) => {
    router.push(`/explorer/transaction?hash=${hash}`);
  };

  const handleBlockClick = (e: React.MouseEvent, block: number) => {
    e.stopPropagation();
    router.push(`/explorer/block?block=${block}`);
  };

  const handleUserClick = (e: React.MouseEvent, user: string) => {
    e.stopPropagation();
    router.push(`/leaderboard/address?address=${user}`);
  };

  return (
    <div className="overflow-x-auto scrollbar-dark">
      <table className="w-full min-w-[600px] text-xs md:text-sm">
        <thead>
          <tr className="text-[#8A8A8E] text-[10px] md:text-xs border-b border-[#1a1a1f]">
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Hash</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Action</th>
            {showBlockColumn && (
              <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Block</th>
            )}
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Time</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">User</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-[#1a1a1f]">
                <td className="py-3 px-3 md:px-4"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                {showBlockColumn && (
                  <td className="py-3 px-3 md:px-4"><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                )}
                <td className="py-3 px-3 md:px-4"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={showBlockColumn ? 5 : 4} className="py-12 md:py-16 text-center text-[#f6465d] text-xs md:text-sm">
                Error loading transactions. Please try again later.
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={showBlockColumn ? 5 : 4} className="py-12 md:py-16 text-center">
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
            data.map((tx) => (
              <tr
                key={tx.hash}
                onClick={() => handleRowClick(tx.hash)}
                className="border-b border-[#1a1a1f] last:border-b-0 hover:bg-[#16DE93]/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-3 px-3 md:px-4">
                  <span className="text-[#16DE93]">{formatAddress(tx.hash)}</span>
                </td>
                <td className="py-3 px-3 md:px-4 text-white">{tx.action}</td>
                {showBlockColumn && (
                  <td className="py-3 px-3 md:px-4">
                    <button
                      onClick={(e) => handleBlockClick(e, tx.block)}
                      className="text-[#16DE93] font-medium hover:underline"
                    >
                      {tx.block}
                    </button>
                  </td>
                )}
                <td className="py-3 px-3 md:px-4 text-white">{tx.time}</td>
                <td className="py-3 px-3 md:px-4">
                  <button
                    onClick={(e) => handleUserClick(e, tx.user)}
                    className="text-[#16DE93] hover:underline"
                  >
                    {formatAddress(tx.user)}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
