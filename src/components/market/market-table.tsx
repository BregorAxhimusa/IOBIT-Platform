'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMarketStore } from '@/store/market-store';
import { useSpotStore } from '@/store/spot-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { cn } from '@/lib/utils/cn';
import { formatPercentage, formatCompactNumber } from '@/lib/utils/format';
import { coinMatchesCategory, type CoinCategory } from '@/lib/utils/coin-categories';
import { CategoryFilters } from '@/components/market/category-filters';
import { SparklineChart } from '@/components/market/sparkline-chart';
import { PaginationFooter } from '@/components/ui/pagination';
import { CoinIcon, hasCoinIcon } from '@/components/ui/coin-icon';
import { useMarketCap } from '@/hooks/use-market-cap';

export type MarketTab = 'cryptos' | 'spot' | 'futures' | 'favorites';

interface DisplayRow {
  symbol: string;
  displayName: string;
  type: 'perp' | 'spot';
  price: number;
  prevDayPrice: number;
  change24h: number;
  volume24h: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  marketCap: number;
  href: string;
}

type SortField = 'volume24h' | 'change24h' | 'price' | 'openInterest' | 'marketCap' | 'funding';

function formatTablePrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.001) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}


function StarButton({ symbol }: { symbol: string }) {
  const isFav = useFavoritesStore((s) => s.isFavorite(symbol));
  const toggle = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(symbol); }}
      className={cn(
        "transition-colors",
        isFav ? "text-[#F7931A]" : "text-[#3a3a3f] hover:text-[#6b6b6b]"
      )}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFav ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )}
    </button>
  );
}

interface MarketTableProps {
  activeTab: MarketTab;
  onTabChange: (tab: MarketTab) => void;
  activeCategory: CoinCategory;
  onCategoryChange: (category: CoinCategory) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
}

const TABS: { key: MarketTab; label: string }[] = [
  { key: 'cryptos', label: 'Cryptos' },
  { key: 'spot', label: 'Spot' },
  { key: 'futures', label: 'Futures' },
  { key: 'favorites', label: 'Favorites' },
];

export function MarketTable({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: MarketTableProps) {
  const markets = useMarketStore((s) => s.markets);
  const marketsLoading = useMarketStore((s) => s.isLoading);
  const getSpotMarkets = useSpotStore((s) => s.getSpotMarkets);
  const favorites = useFavoritesStore((s) => s.favorites);
  const { getMarketCap } = useMarketCap();
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Build unified display rows
  const allRows = useMemo<DisplayRow[]>(() => {
    const rows: DisplayRow[] = [];

    // Add perp markets
    markets.forEach((m) => {
      rows.push({
        symbol: m.symbol,
        displayName: m.symbol,
        type: 'perp',
        price: parseFloat(m.price) || 0,
        prevDayPrice: parseFloat(m.prevDayPrice) || 0,
        change24h: m.change24h,
        volume24h: parseFloat(m.volume24h) || 0,
        openInterest: parseFloat(m.openInterest) || 0,
        funding: parseFloat(m.funding) || 0,
        maxLeverage: m.maxLeverage || 50,
        marketCap: getMarketCap(m.symbol),
        href: `/trade/${m.symbol}`,
      });
    });

    // Add spot markets
    const spotMarkets = getSpotMarkets();
    for (const sm of spotMarkets) {
      const price = parseFloat(sm.midPx) || parseFloat(sm.markPx) || 0;
      const supply = parseFloat(sm.circulatingSupply) || 0;
      // Use CoinGecko market cap, fallback to calculated
      const geckoMarketCap = getMarketCap(sm.base);
      const calculatedMarketCap = price * supply;

      rows.push({
        symbol: sm.base,
        displayName: sm.pairName,
        type: 'spot',
        price,
        prevDayPrice: parseFloat(sm.prevDayPx) || 0,
        change24h: sm.change24h,
        volume24h: parseFloat(sm.dayNtlVlm) || 0,
        openInterest: 0,
        funding: 0,
        maxLeverage: 0,
        marketCap: geckoMarketCap || calculatedMarketCap,
        href: `/trade/${sm.base}`,
      });
    }

    return rows;
  }, [markets, getSpotMarkets, getMarketCap]);

  // Filter and sort
  const filteredRows = useMemo(() => {
    let rows = allRows;

    // Tab filter
    if (activeTab === 'futures') rows = rows.filter((r) => r.type === 'perp');
    else if (activeTab === 'spot') rows = rows.filter((r) => r.type === 'spot');
    else if (activeTab === 'favorites') rows = rows.filter((r) => favorites.includes(r.symbol));

    // Category filter
    if (activeCategory !== 'All') {
      rows = rows.filter((r) => coinMatchesCategory(r.symbol, activeCategory));
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter((r) =>
        r.symbol.toLowerCase().includes(term) ||
        r.displayName.toLowerCase().includes(term)
      );
    }

    // Sort - prioritize coins with icons, then by selected field
    rows = [...rows].sort((a, b) => {
      // First priority: coins with icons come first
      const aHasIcon = hasCoinIcon(a.symbol) ? 1 : 0;
      const bHasIcon = hasCoinIcon(b.symbol) ? 1 : 0;
      if (aHasIcon !== bHasIcon) {
        return bHasIcon - aHasIcon; // Icons first
      }

      // Second priority: sort by selected field
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = sortField === 'change24h' ? Math.abs(bVal) - Math.abs(aVal) : (bVal as number) - (aVal as number);
      return sortDir === 'desc' ? cmp : -cmp;
    });

    return rows;
  }, [allRows, activeTab, activeCategory, searchTerm, sortField, sortDir, favorites]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageRows = filteredRows.slice(startIdx, startIdx + rowsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return (
      <svg className="w-3 h-3 ml-1 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
      </svg>
    );
    return (
      <svg className="w-3 h-3 ml-1 text-[#16DE93]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {sortDir === 'desc' ? <path d="M19 9l-7 7-7-7" /> : <path d="M5 15l7-7 7 7" />}
      </svg>
    );
  };

  return (
    <div>
      {/* Tabs + Search Row */}
      <div className="flex flex-row items-center justify-between gap-4 border-y border-[#1a1a1f] px-2 pt-2">
        <div className="flex items-center gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-[1px]',
                activeTab === tab.key
                  ? 'text-[#16DE93] border-[#16DE93]'
                  : 'text-[#6b6b6b] border-transparent hover:text-white'
              )}
            >
              {tab.label}
              {tab.key === 'favorites' && favorites.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({favorites.length})</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search markets..."
            className="bg-[#56565B]/30 rounded-md pl-11 pr-4 py-2.5 text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#16DE93]/30 w-full lg:w-72 transition-all"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="py-2 border-b border-[#1a1a1f]">
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#6b6b6b] text-xs border-b border-[#1a1a1f]">
              <th className="text-left py-4 px-2 font-medium">Market</th>
              <th className="text-right py-4 px-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('price')}>
                <div className="flex items-center justify-end">Oracle Price<SortIcon field="price" /></div>
              </th>
              <th className="text-center py-4 px-2 font-medium hidden lg:table-cell">Charts</th>
              <th className="text-right py-4 px-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('change24h')}>
                <div className="flex items-center justify-end">24h Change<SortIcon field="change24h" /></div>
              </th>
              <th className="text-right py-4 px-2 font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('volume24h')}>
                <div className="flex items-center justify-end">24h Volume<SortIcon field="volume24h" /></div>
              </th>
              <th className="text-right py-4 px-2 font-medium hidden xl:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('marketCap')}>
                <div className="flex items-center justify-end">Market Cap<SortIcon field="marketCap" /></div>
              </th>
              <th className="text-right py-4 px-2 font-medium hidden lg:table-cell">Trades</th>
              <th className="text-right py-4 px-2 font-medium hidden md:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('openInterest')}>
                <div className="flex items-center justify-end">Open Interest<SortIcon field="openInterest" /></div>
              </th>
              <th className="text-right py-4 px-2 font-medium hidden md:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('funding')}>
                <div className="flex items-center justify-end">1h Funding<SortIcon field="funding" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {marketsLoading && allRows.length === 0 ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1a1f]">
                  <td className="py-4 px-2"><div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#1a1a1f] animate-pulse rounded" /><div className="w-8 h-8 rounded-full bg-[#1a1a1f] animate-pulse" /><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded" /></div></td>
                  <td className="py-4 px-2"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2 hidden lg:table-cell"><div className="w-24 h-8 bg-[#1a1a1f] animate-pulse rounded mx-auto" /></td>
                  <td className="py-4 px-2"><div className="w-16 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2"><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2 hidden xl:table-cell"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2 hidden lg:table-cell"><div className="w-16 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2 hidden md:table-cell"><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                  <td className="py-4 px-2 hidden md:table-cell"><div className="w-16 h-4 bg-[#1a1a1f] animate-pulse rounded ml-auto" /></td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1f] flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#6b6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-[#6b6b6b] text-sm">
                      {searchTerm ? 'No markets found' : activeTab === 'favorites' ? 'No favorites yet. Star markets to add them here.' : 'No markets available'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const isPositive = row.change24h >= 0;
                const fundingPercent = row.funding * 100;
                const isFundingPositive = fundingPercent >= 0;

                return (
                  <tr key={`${row.type}-${row.symbol}`} className="border-b border-[#1a1a1f] hover:bg-[#16DE93]/[0.03] transition-colors group">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-3">
                        <StarButton symbol={row.symbol} />
                        <Link href={row.href} className="flex items-center gap-3">
                          <CoinIcon symbol={row.symbol} />
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{row.symbol}</span>
                            {row.type === 'perp' && row.maxLeverage > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7931A]/10 text-[#F7931A] font-medium">
                                {row.maxLeverage}x
                              </span>
                            )}
                            {row.type === 'spot' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#627EEA]/10 text-[#627EEA] font-medium">
                                SPOT
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 text-right">
                      <span className="text-white font-medium">{formatTablePrice(row.price)}</span>
                    </td>
                    <td className="px-2 hidden lg:table-cell">
                      <div className="flex justify-center">
                        <SparklineChart prevPrice={row.prevDayPrice} currentPrice={row.price} />
                      </div>
                    </td>
                    <td className="px-2 text-right">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                        isPositive ? 'bg-[#16DE93]/10 text-[#16DE93]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                      )}>
                        {formatPercentage(row.change24h)}
                      </span>
                    </td>
                    <td className="px-2 text-right text-[#a0a0a5] text-sm">
                      ${formatCompactNumber(row.volume24h)}
                    </td>
                    <td className="px-2 text-right text-[#a0a0a5] text-sm hidden xl:table-cell">
                      {row.marketCap > 0 ? `$${formatCompactNumber(row.marketCap)}` : '--'}
                    </td>
                    <td className="px-2 text-right hidden lg:table-cell">
                      <Link
                        href={row.href}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16DE93]/10 hover:bg-[#16DE93]/20 text-[#16DE93] text-xs font-medium rounded-md transition-colors"
                      >
                        Trade
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </td>
                    <td className="px-2 text-right text-[#a0a0a5] text-sm hidden md:table-cell">
                      {row.openInterest > 0 ? `$${formatCompactNumber(row.openInterest)}` : '--'}
                    </td>
                    <td className={cn(
                      'px-2 text-right text-sm hidden md:table-cell font-medium',
                      row.type === 'perp' ? (isFundingPositive ? 'text-[#16DE93]' : 'text-[#F6465D]') : 'text-[#6b6b6b]'
                    )}>
                      {row.type === 'perp' ? `${isFundingPositive ? '+' : ''}${fundingPercent.toFixed(4)}%` : '--'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - only show when there are items */}
      {filteredRows.length > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          itemsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </div>
  );
}
