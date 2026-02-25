'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { Pagination } from '@/components/ui/pagination';
import type { VaultFollower } from '@/lib/hyperliquid/types';

const ROWS_PER_PAGE = 15;

interface VaultFollowersProps {
  followers: VaultFollower[];
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function VaultFollowers({ followers }: VaultFollowersProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (followers.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No followers yet
      </div>
    );
  }

  // Sort by equity descending
  const sorted = [...followers].sort(
    (a, b) => parseFloat(b.equity) - parseFloat(a.equity)
  );

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const pageFollowers = sorted.slice(startIdx, startIdx + ROWS_PER_PAGE);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-normal">#</th>
            <th className="text-left py-2 px-3 font-normal">Address</th>
            <th className="text-right py-2 px-3 font-normal">Equity</th>
            <th className="text-right py-2 px-3 font-normal">PnL</th>
            <th className="text-right py-2 px-3 font-normal">Lock Until</th>
          </tr>
        </thead>
        <tbody>
          {pageFollowers.map((follower, index) => {
            const equity = parseFloat(follower.equity);
            const pnl = parseFloat(follower.pnl);
            const lockDate = follower.lockedUntil
              ? new Date(follower.lockedUntil).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-';

            return (
              <tr
                key={follower.user}
                className="border-b border-gray-800/50 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-2 px-3 text-gray-500">{startIdx + index + 1}</td>
                <td className="py-2 px-3 text-white">
                  {formatAddress(follower.user)}
                </td>
                <td className="py-2 px-3 text-right text-white">
                  {formatCurrency(equity)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={cn(
                      'font-normal',
                      pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {pnl >= 0 ? '+' : ''}
                    {formatCurrency(pnl)}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-gray-400">{lockDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={sorted.length}
        itemLabel="followers"
      />
    </div>
  );
}
