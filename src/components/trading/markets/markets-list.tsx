'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMarketStore } from '@/store/market-store';
import { cn } from '@/lib/utils/cn';

interface MarketsListProps {
  currentSymbol?: string;
}

export function MarketsList({ currentSymbol }: MarketsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Perps' | 'Spot'>('All');
  const markets = useMarketStore((state) => state.markets);

  // Convert Map to array and filter/sort
  const filteredMarkets = useMemo(() => {
    let filtered = Array.from(markets.values());

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((market) =>
        market.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by volume (high to low)
    filtered.sort((a, b) => {
      const volA = parseFloat(a.volume24h || '0');
      const volB = parseFloat(b.volume24h || '0');
      return volB - volA;
    });

    return filtered;
  }, [markets, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Search */}
      <div className="p-2 border-b border-gray-800/50">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 bg-[#1a1a1a] border border-gray-700/50 rounded text-white text-xs placeholder-gray-600 focus:outline-none focus:border-gray-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-800/50 text-[11px]">
        {(['All', 'Perps', 'Spot'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'flex-1 px-2 py-1.5 font-medium transition-colors',
              activeFilter === filter
                ? 'text-white bg-[#1a1a1a]'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-1 px-2 py-1 text-[10px] text-gray-600 border-b border-gray-800/50 font-medium bg-[#0a0a0a]">
        <div className="col-span-4">Symbol</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-2 text-right">24h%</div>
        <div className="col-span-3 text-right">Volume</div>
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
        {filteredMarkets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            No markets found
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const price = parseFloat(market.price || '0');
            const change24h = market.change24h || 0;
            const volume = parseFloat(market.volume24h || '0');
            const isActive = market.symbol === currentSymbol;

            return (
              <Link
                key={market.symbol}
                href={`/trade/${market.symbol}`}
                className={cn(
                  'grid grid-cols-12 gap-1 px-2 py-1 border-b border-gray-800/30 hover:bg-[#1a1a1a] transition-colors text-[10px]',
                  isActive && 'bg-[#1a1a1a] border-l-2 border-l-blue-500'
                )}
              >
                {/* Symbol */}
                <div className="col-span-4 font-medium text-gray-200 truncate flex items-center">
                  {market.symbol}
                  <span className="text-gray-700 text-[9px] ml-0.5">-USD</span>
                </div>

                {/* Price */}
                <div className="col-span-3 text-right text-gray-400 font-mono text-[10px] flex items-center justify-end">
                  {price > 0
                    ? price.toLocaleString(undefined, {
                        minimumFractionDigits: price < 1 ? 4 : price < 100 ? 3 : 2,
                        maximumFractionDigits: price < 1 ? 4 : price < 100 ? 3 : 2,
                      })
                    : '--'}
                </div>

                {/* 24h Change */}
                <div
                  className={cn(
                    'col-span-2 text-right font-medium flex items-center justify-end',
                    change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {change24h !== 0 ? (
                    <>
                      {change24h >= 0 ? '+' : ''}
                      {change24h.toFixed(2)}%
                    </>
                  ) : (
                    <span className="text-gray-600">--</span>
                  )}
                </div>

                {/* Volume */}
                <div className="col-span-3 text-right text-gray-500 text-[10px] flex items-center justify-end">
                  {volume > 0
                    ? volume >= 1000000000
                      ? `${(volume / 1000000000).toFixed(2)}B`
                      : volume >= 1000000
                      ? `${(volume / 1000000).toFixed(1)}M`
                      : volume >= 1000
                      ? `${(volume / 1000).toFixed(0)}K`
                      : volume.toFixed(0)
                    : '--'}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
