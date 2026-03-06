'use client';

import Image from 'next/image';
import type { FundingPayment } from '@/lib/hyperliquid/types';
import { cn } from '@/lib/utils/cn';

interface FundingHistoryProps {
  funding: FundingPayment[];
  isLoading: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FundingHistory({ funding, isLoading }: FundingHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-700 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (funding.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Image
          src="/iobit/landingpage/nofound.svg"
          alt="No funding"
          width={48}
          height={48}
          className="mb-3 opacity-50"
        />
        <p className="text-[#8A8A8E] text-sm">No funding payments found</p>
      </div>
    );
  }

  // Sort by time descending (most recent first)
  const sortedFunding = [...funding].sort((a, b) => b.time - a.time);

  // Calculate total funding
  const totalFunding = funding.reduce((sum, f) => sum + parseFloat(f.usdc), 0);

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-white text-xs">
          {funding.length} payment{funding.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-white text-xs">Total:</span>
          <span className={cn('text-xs font-normal', totalFunding >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
            {totalFunding >= 0 ? '+' : ''}${totalFunding.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-[#68686f] border-b border-[#2a2a2f]">
        <span>Time</span>
        <span>Coin</span>
        <span className="text-right">Payment</span>
        <span className="text-right">Position</span>
        <span className="text-right">Rate</span>
      </div>

      {/* Table Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {sortedFunding.map((payment, index) => {
          const usdc = parseFloat(payment.usdc);
          const isPositive = usdc >= 0;

          return (
            <div
              key={`${payment.time}-${payment.coin}-${index}`}
              className="grid grid-cols-5 gap-2 px-3 py-2 text-xs border-b border-[#2a2a2f]/50 hover:bg-[#0a0a0a]/50"
            >
              <span className="text-white">{formatTime(payment.time)}</span>
              <span className="text-white font-normal">{payment.coin}</span>
              <span className={cn('text-right', isPositive ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                {isPositive ? '+' : ''}${usdc.toFixed(4)}
              </span>
              <span className="text-right text-white">
                {parseFloat(payment.szi).toFixed(4)}
              </span>
              <span className="text-right text-white">
                {(parseFloat(payment.fundingRate) * 100).toFixed(4)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
