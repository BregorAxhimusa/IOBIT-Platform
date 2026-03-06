'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { formatPercentage } from '@/lib/utils/format';
import type { MarketMover } from '@/hooks/use-market-page-data';

interface InfoPanelsProps {
  topEarners: MarketMover[];
  biggestMovers: MarketMover[];
  isLoading: boolean;
}

function formatPanelPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function CoinIcon({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    BTC: 'bg-orange-500',
    ETH: 'bg-blue-500',
    SOL: 'bg-purple-500',
    DOGE: 'bg-yellow-500',
    XRP: 'bg-gray-400',
    BNB: 'bg-yellow-400',
    ADA: 'bg-blue-400',
    AVAX: 'bg-red-500',
    DOT: 'bg-pink-500',
    LINK: 'bg-blue-600',
    UNI: 'bg-pink-400',
    MATIC: 'bg-purple-400',
    ARB: 'bg-blue-300',
    OP: 'bg-red-400',
  };

  const bg = colors[symbol] || 'bg-[#16DE93]';

  return (
    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0', bg)}>
      {symbol.slice(0, 2)}
    </div>
  );
}

function MoverRow({ mover }: { mover: MarketMover }) {
  const isPositive = mover.change24h >= 0;

  return (
    <Link
      href={`/trade/${mover.symbol}`}
      className="flex items-center justify-between py-2 px-3 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <CoinIcon symbol={mover.symbol} />
        <span className="text-white text-sm font-normal">{mover.symbol}</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-[#0a0a0a] text-yellow-400 border border-gray-700">
          {mover.maxLeverage}x
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">{formatPanelPrice(mover.price)}</span>
        <span className={cn('text-xs', isPositive ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
          {formatPercentage(mover.change24h)}
        </span>
      </div>
    </Link>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-800 animate-pulse" />
            <div className="w-12 h-4 bg-gray-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-4 bg-gray-800 animate-pulse" />
            <div className="w-14 h-4 bg-gray-800 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoPanels({ topEarners, biggestMovers, isLoading }: InfoPanelsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Top Earners / High Volume */}
      <div className="bg-[#0a0a0c] border border-[#2a2a2f]">
        <div className="px-4 py-3 border-b border-[#2a2a2f] flex items-center gap-2">
          <h3 className="text-white text-sm font-normal">Earned by Stakers</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-lg text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
            NEW
          </span>
        </div>
        {isLoading ? <PanelSkeleton /> : (
          <div className="divide-y divide-gray-800/50">
            {topEarners.map((m) => <MoverRow key={m.symbol} mover={m} />)}
          </div>
        )}
      </div>

      {/* Biggest Movers */}
      <div className="bg-[#0a0a0c] border border-[#2a2a2f]">
        <div className="px-4 py-3 border-b border-[#2a2a2f] flex items-center gap-2">
          <h3 className="text-white text-sm font-normal">Biggest Movers</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-lg text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
            24h
          </span>
        </div>
        {isLoading ? <PanelSkeleton /> : (
          <div className="divide-y divide-gray-800/50">
            {biggestMovers.map((m) => <MoverRow key={m.symbol} mover={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
