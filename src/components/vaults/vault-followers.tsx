'use client';

import { useState } from 'react';
import Image from 'next/image';
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
      <div className="flex flex-col items-center justify-center h-32">
        <Image
          src="/iobit/landingpage/nofound.svg"
          alt="No followers"
          width={40}
          height={40}
          className="mb-2 opacity-50"
        />
        <span className="text-[#8A8A8E] text-sm">No followers yet</span>
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
          <tr className="text-white border-b border-[#2a2a2f]">
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
                className="border-b border-[#2a2a2f]/50 hover:bg-[#0a0a0a]/50 transition-colors"
              >
                <td className="py-2 px-3 text-[#68686f]">{startIdx + index + 1}</td>
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
                      pnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                    )}
                  >
                    {pnl >= 0 ? '+' : ''}
                    {formatCurrency(pnl)}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-white">{lockDate}</td>
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
