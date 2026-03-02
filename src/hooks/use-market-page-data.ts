'use client';

import { useMemo } from 'react';
import { useMarketStore, type MarketData } from '@/store/market-store';

export interface GlobalStats {
  volume24h: number;
  openInterest: number;
}

export interface MarketMover {
  symbol: string;
  price: number;
  change24h: number;
  maxLeverage: number;
}

export function useMarketPageData() {
  const markets = useMarketStore((s) => s.markets);
  const isLoading = useMarketStore((s) => s.isLoading);

  const allMarkets = useMemo(() => Array.from(markets.values()), [markets]);

  const globalStats = useMemo<GlobalStats>(() => {
    let volume24h = 0;
    let openInterest = 0;

    for (const m of allMarkets) {
      volume24h += parseFloat(m.volume24h) || 0;
      openInterest += parseFloat(m.openInterest) || 0;
    }

    return { volume24h, openInterest };
  }, [allMarkets]);

  const topEarners = useMemo<MarketMover[]>(() => {
    return [...allMarkets]
      .sort((a, b) => (parseFloat(b.volume24h) || 0) - (parseFloat(a.volume24h) || 0))
      .slice(0, 3)
      .map(toMover);
  }, [allMarkets]);

  const biggestMovers = useMemo<MarketMover[]>(() => {
    return [...allMarkets]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 3)
      .map(toMover);
  }, [allMarkets]);

  return { globalStats, topEarners, biggestMovers, isLoading };
}

function toMover(m: MarketData): MarketMover {
  return {
    symbol: m.symbol,
    price: parseFloat(m.price) || 0,
    change24h: m.change24h,
    maxLeverage: m.maxLeverage || 50,
  };
}
