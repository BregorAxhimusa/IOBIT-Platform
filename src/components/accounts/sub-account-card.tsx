'use client';

import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import type { SubAccount } from '@/lib/hyperliquid/types';

interface SubAccountCardProps {
  subAccount: SubAccount;
  onTransfer: (subAccount: SubAccount) => void;
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

export function SubAccountCard({ subAccount, onTransfer }: SubAccountCardProps) {
  const accountValue = subAccount.clearinghouseState
    ? parseFloat(subAccount.clearinghouseState.marginSummary.accountValue)
    : 0;

  const totalPnl = subAccount.clearinghouseState
    ? subAccount.clearinghouseState.assetPositions.reduce(
        (sum, pos) => sum + parseFloat(pos.position.unrealizedPnl || '0'),
        0
      )
    : 0;

  const positionCount = subAccount.clearinghouseState
    ? subAccount.clearinghouseState.assetPositions.filter(
        (p) => parseFloat(p.position.szi) !== 0
      ).length
    : 0;

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-normal text-sm">
            {subAccount.name || 'Unnamed'}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {formatAddress(subAccount.subAccountUser)}
          </p>
        </div>
        <button
          onClick={() => onTransfer(subAccount)}
          className="px-3 py-1.5 text-xs bg-[#1a2028] text-gray-300 hover:text-white rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Transfer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-gray-400 text-[10px] mb-0.5">Account Value</p>
          <p className="text-white text-xs font-normal">{formatCurrency(accountValue)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] mb-0.5">Unrealized PnL</p>
          <p
            className={cn(
              'text-xs font-normal',
              totalPnl >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {totalPnl >= 0 ? '+' : ''}
            {formatCurrency(totalPnl)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] mb-0.5">Positions</p>
          <p className="text-white text-xs font-normal">{positionCount}</p>
        </div>
      </div>
    </div>
  );
}
