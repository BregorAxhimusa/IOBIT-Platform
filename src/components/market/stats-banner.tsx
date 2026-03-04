'use client';

import { formatCompactNumber } from '@/lib/utils/format';
import { useMarketStore } from '@/store/market-store';
import { CoinIcon } from '@/components/ui/coin-icon';
import { cn } from '@/lib/utils/cn';
import type { GlobalStats } from '@/hooks/use-market-page-data';

interface StatsBannerProps {
  stats: GlobalStats;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  badge,
  isLoading,
}: {
  label: string;
  value: string;
  badge?: string;
  isLoading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-1">
        <span className="text-[#6b6b6b] text-sm">{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16DE93]/10 text-[#16DE93]">
            {badge}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-6 bg-[#1a1a1f] animate-pulse rounded w-20" />
      ) : (
        <p className="text-white text-lg font-semibold">{value}</p>
      )}
    </div>
  );
}

interface TopCoin {
  symbol: string;
  leverage: number;
  price: number;
  change: number;
}

function TopCoinRow({ coin, showLeverage = true }: { coin: TopCoin; showLeverage?: boolean }) {
  const isPositive = coin.change >= 0;
  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-4">
        <CoinIcon symbol={coin.symbol} size="sm" />
        <span className="text-white text-sm font-medium">{coin.symbol}</span>
        {showLeverage && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7931A]/10 text-[#F7931A]">
            {coin.leverage}x
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white text-sm">${formatCompactNumber(coin.price)}</span>
        <span className={cn(
          'text-sm',
          isPositive ? 'text-[#16DE93]' : 'text-[#F6465D]'
        )}>
          {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function BiggestMoverRow({ coin }: { coin: TopCoin }) {
  const isPositive = coin.change >= 0;
  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-4">
        <CoinIcon symbol={coin.symbol} size="sm" />
        <span className="text-white text-sm font-medium">{coin.symbol}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7931A]/10 text-[#F7931A]">
          {coin.leverage}x
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#6b6b6b] text-sm">${formatCompactNumber(coin.price)}</span>
        <span className={cn(
          'text-sm font-medium',
          isPositive ? 'text-[#16DE93]' : 'text-[#F6465D]'
        )}>
          {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function StatsBanner({ stats, isLoading }: StatsBannerProps) {
  const markets = useMarketStore((s) => s.markets);
  const allMarkets = Array.from(markets.values());

  // Get top coins by volume for "Earned by Stakers" section
  const topByVolume: TopCoin[] = allMarkets
    .sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h))
    .slice(0, 3)
    .map(m => ({
      symbol: m.symbol,
      leverage: m.maxLeverage || 10,
      price: parseFloat(m.price) || 0,
      change: m.change24h || 0,
    }));

  // Get biggest movers (highest absolute change)
  const biggestMovers: TopCoin[] = allMarkets
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 3)
    .map(m => ({
      symbol: m.symbol,
      leverage: m.maxLeverage || 100,
      price: parseFloat(m.price) || 0,
      change: m.change24h || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3">
      {/* Left: Stats Grid */}
      <div className="lg:border-r border-[#1a1a1f] p-4 flex items-center w-full">
        <div className="grid grid-cols-2 gap-8 w-full">
          <StatCard
            label="Trading Volume"
            badge="24h"
            value={`$${formatCompactNumber(stats.volume24h)}`}
            isLoading={isLoading}
          />
          <StatCard
            label="Earned by Stakers"
            badge="24h"
            value="$0"
            isLoading={isLoading}
          />
          <StatCard
            label="Open Interest"
            badge="Current"
            value={`$${formatCompactNumber(stats.openInterest)}`}
            isLoading={isLoading}
          />
          <StatCard
            label="All Time Volume"
            value="$0"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Middle: Earned by Stakers */}
      <div className="py-2 px-0 w-full border-y border-[#1a1a1f] lg:border-y-0">
        <div className="flex items-center gap-4 mb-0 pb-3 px-2 border-b border-[#1a1a1f]">
          <span className="text-white text-sm font-medium">Earned by Stakers</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16DE93] text-black font-medium">
            NEW
          </span>
        </div>
        <div className="divide-y divide-[#1a1a1f]">
          {isLoading || topByVolume.length === 0 ? (
            <>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
            </>
          ) : (
            topByVolume.map((coin) => (
              <TopCoinRow key={coin.symbol} coin={coin} />
            ))
          )}
        </div>
      </div>

      {/* Right: Biggest Movers */}
      <div className="lg:border-l border-[#1a1a1f] py-2 px-0 w-full">
        <div className="flex items-center gap-4 mb-0 pb-3 px-2 border-b border-[#1a1a1f]">
          <span className="text-white text-sm font-medium">Biggest Movers</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16DE93]/10 text-[#16DE93]">
            24h
          </span>
        </div>
        <div className="divide-y divide-[#1a1a1f]">
          {isLoading || biggestMovers.length === 0 ? (
            <>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
              <div className="py-2"><div className="h-6 bg-[#1a1a1f] animate-pulse rounded" /></div>
            </>
          ) : (
            biggestMovers.map((coin) => (
              <BiggestMoverRow key={coin.symbol} coin={coin} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
