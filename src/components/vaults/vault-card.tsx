'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import type { VaultStatsData } from '@/lib/hyperliquid/types';

interface VaultCardProps {
  vault: VaultStatsData;
}

function formatCurrency(value: number | undefined | null): string {
  const v = Number(value) || 0;
  if (Math.abs(v) >= 1_000_000) {
    return `$${(v / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(v) >= 1_000) {
    return `$${(v / 1_000).toFixed(2)}K`;
  }
  return `$${v.toFixed(2)}`;
}

export function VaultCard({ vault }: VaultCardProps) {
  const isPositivePnl = (vault.allTimePnl ?? 0) >= 0;
  const isPositiveApr = (vault.apr30d ?? 0) >= 0;

  return (
    <Link href={`/vaults/${vault.vaultAddress}`}>
      <div className="bg-[#0f1419] border border-gray-800 p-4 hover:border-gray-600 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-normal text-sm truncate group-hover:text-blue-400 transition-colors">
              {vault.name}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Leader: {formatAddress(vault.leader)}
            </p>
          </div>
          {vault.isClosed && (
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full ml-2 shrink-0">
              Closed
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* TVL */}
          <div>
            <p className="text-gray-500 text-xs">TVL</p>
            <p className="text-white text-sm font-normal">{formatCurrency(vault.tvl)}</p>
          </div>

          {/* APR */}
          <div>
            <p className="text-gray-500 text-xs">30D APR</p>
            <p
              className={cn(
                'text-sm font-normal',
                isPositiveApr ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isPositiveApr ? '+' : ''}{(vault.apr30d ?? 0).toFixed(1)}%
            </p>
          </div>

          {/* All-time PnL */}
          <div>
            <p className="text-gray-500 text-xs">All-time PnL</p>
            <p
              className={cn(
                'text-sm font-normal',
                isPositivePnl ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isPositivePnl ? '+' : ''}{formatCurrency(vault.allTimePnl)}
            </p>
          </div>

          {/* Followers */}
          <div>
            <p className="text-gray-500 text-xs">Followers</p>
            <p className="text-white text-sm font-normal">{(vault.followerCount ?? 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Commission */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Leader Commission</span>
            <span className="text-gray-300">{((vault.leaderCommission ?? 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
