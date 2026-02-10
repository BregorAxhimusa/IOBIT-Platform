'use client';

import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import type { VaultFollower } from '@/lib/hyperliquid/types';

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">#</th>
            <th className="text-left py-2 px-3 font-medium">Address</th>
            <th className="text-right py-2 px-3 font-medium">Equity</th>
            <th className="text-right py-2 px-3 font-medium">PnL</th>
            <th className="text-right py-2 px-3 font-medium">Lock Until</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((follower, index) => {
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
                <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                <td className="py-2 px-3 text-white font-mono">
                  {formatAddress(follower.user)}
                </td>
                <td className="py-2 px-3 text-right text-white">
                  {formatCurrency(equity)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span
                    className={cn(
                      'font-medium',
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
    </div>
  );
}
