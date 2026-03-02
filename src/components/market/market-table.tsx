'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMarketStore } from '@/store/market-store';
import { useSpotStore } from '@/store/spot-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { cn } from '@/lib/utils/cn';
import { formatPercentage, formatCompactNumber } from '@/lib/utils/format';
import { coinMatchesCategory, type CoinCategory } from '@/lib/utils/coin-categories';
import { Pagination } from '@/components/ui/pagination';
import { CategoryFilters } from '@/components/market/category-filters';
import { SparklineChart } from '@/components/market/sparkline-chart';

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

const COIN_COLORS: Record<string, string> = {
  BTC: 'bg-orange-500', ETH: 'bg-blue-500', SOL: 'bg-purple-500',
  DOGE: 'bg-yellow-500', XRP: 'bg-gray-400', BNB: 'bg-yellow-400',
  ADA: 'bg-blue-400', AVAX: 'bg-red-500', DOT: 'bg-pink-500',
  LINK: 'bg-blue-600', UNI: 'bg-pink-400', ARB: 'bg-blue-300',
  OP: 'bg-red-400', MATIC: 'bg-purple-400', PEPE: 'bg-green-500',
  SHIB: 'bg-orange-400', NEAR: 'bg-teal-500', SUI: 'bg-sky-400',
  APT: 'bg-emerald-500', SEI: 'bg-red-300', TIA: 'bg-violet-500',
  INJ: 'bg-blue-400', ATOM: 'bg-indigo-500', LTC: 'bg-gray-300',
};

function CoinIcon({ symbol }: { symbol: string }) {
  const bg = COIN_COLORS[symbol] || 'bg-teal-600';
  return (
    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0', bg)}>
      {symbol.slice(0, 2)}
    </div>
  );
}

function StarButton({ symbol }: { symbol: string }) {
  const isFav = useFavoritesStore((s) => s.isFavorite(symbol));
  const toggle = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(symbol); }}
      className="text-gray-600 hover:text-yellow-400 transition-colors"
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFav ? (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
        marketCap: 0,
        href: `/trade/${m.symbol}`,
      });
    });

    // Add spot markets
    const spotMarkets = getSpotMarkets();
    for (const sm of spotMarkets) {
      const price = parseFloat(sm.midPx) || parseFloat(sm.markPx) || 0;
      const supply = parseFloat(sm.circulatingSupply) || 0;

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
        marketCap: price * supply,
        href: `/trade/${sm.base}`,
      });
    }

    return rows;
  }, [markets, getSpotMarkets]);

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

    // Sort
    rows = [...rows].sort((a, b) => {
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
    if (sortField !== field) return null;
    return (
      <span className="ml-0.5 text-teal-400">
        {sortDir === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  return (
    <div className="bg-[#0f1419] border border-gray-800">
      {/* Tabs + Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'px-4 py-2 text-sm font-normal transition-colors',
                activeTab === tab.key
                  ? 'text-white border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Coin"
            className="bg-[#1a2028] border border-gray-700 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 py-3 border-b border-gray-800">
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-800">
              <th className="text-left py-3 px-4 font-normal w-8" />
              <th className="text-left py-3 px-2 font-normal">Market</th>
              <th className="text-right py-3 px-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                Oracle Price<SortIcon field="price" />
              </th>
              <th className="text-center py-3 px-2 font-normal hidden lg:table-cell">Charts</th>
              <th className="text-right py-3 px-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('change24h')}>
                24h Change<SortIcon field="change24h" />
              </th>
              <th className="text-right py-3 px-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('volume24h')}>
                24h Volume<SortIcon field="volume24h" />
              </th>
              <th className="text-right py-3 px-2 font-normal hidden xl:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('marketCap')}>
                Market Cap<SortIcon field="marketCap" />
              </th>
              <th className="text-right py-3 px-2 font-normal hidden xl:table-cell">Trades</th>
              <th className="text-right py-3 px-2 font-normal hidden md:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('openInterest')}>
                Open Interest<SortIcon field="openInterest" />
              </th>
              <th className="text-right py-3 px-4 font-normal hidden md:table-cell cursor-pointer hover:text-white" onClick={() => handleSort('funding')}>
                1h Funding<SortIcon field="funding" />
              </th>
            </tr>
          </thead>
          <tbody>
            {marketsLoading && allRows.length === 0 ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <tr key={i} className="border-b border-gray-800/30">
                  <td className="py-3 px-4"><div className="w-4 h-4 bg-gray-800 animate-pulse" /></td>
                  <td className="py-3 px-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse" /><div className="w-16 h-4 bg-gray-800 animate-pulse" /></div></td>
                  <td className="py-3 px-2"><div className="w-20 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-2 hidden lg:table-cell"><div className="w-20 h-6 bg-gray-800 animate-pulse mx-auto" /></td>
                  <td className="py-3 px-2"><div className="w-14 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-2"><div className="w-20 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-2 hidden xl:table-cell"><div className="w-20 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-2 hidden xl:table-cell"><div className="w-8 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-2 hidden md:table-cell"><div className="w-20 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                  <td className="py-3 px-4 hidden md:table-cell"><div className="w-14 h-4 bg-gray-800 animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No markets found' : activeTab === 'favorites' ? 'No favorites yet' : 'No markets available'}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const isPositive = row.change24h >= 0;
                const fundingPercent = row.funding * 100;
                const isFundingPositive = fundingPercent >= 0;

                return (
                  <tr key={`${row.type}-${row.symbol}`} className="border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-4">
                      <StarButton symbol={row.symbol} />
                    </td>
                    <td className="py-3 px-2">
                      <Link href={row.href} className="flex items-center gap-2">
                        <CoinIcon symbol={row.symbol} />
                        <span className="text-white text-sm font-normal">{row.symbol}</span>
                        {row.type === 'perp' && row.maxLeverage > 0 && (
                          <span className="text-[10px] px-1 py-0.5 bg-[#1a2028] text-yellow-400 border border-gray-700">
                            {row.maxLeverage}x
                          </span>
                        )}
                        {row.type === 'spot' && (
                          <span className="text-[10px] px-1 py-0.5 bg-[#1a2028] text-gray-400 border border-gray-700">
                            SPOT
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-right text-white text-sm">
                      {formatTablePrice(row.price)}
                    </td>
                    <td className="py-3 px-2 hidden lg:table-cell">
                      <div className="flex justify-center">
                        <SparklineChart prevPrice={row.prevDayPrice} currentPrice={row.price} />
                      </div>
                    </td>
                    <td className={cn('py-3 px-2 text-right text-sm', isPositive ? 'text-green-400' : 'text-red-400')}>
                      {formatPercentage(row.change24h)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300 text-sm">
                      ${formatCompactNumber(row.volume24h)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300 text-sm hidden xl:table-cell">
                      {row.marketCap > 0 ? `$${formatCompactNumber(row.marketCap)}` : '--'}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-500 text-sm hidden xl:table-cell">
                      0
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300 text-sm hidden md:table-cell">
                      {row.openInterest > 0 ? `$${formatCompactNumber(row.openInterest)}` : '--'}
                    </td>
                    <td className={cn(
                      'py-3 px-4 text-right text-sm hidden md:table-cell',
                      row.type === 'perp' ? (isFundingPositive ? 'text-green-400' : 'text-red-400') : 'text-gray-500'
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

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
        <span className="text-gray-500 text-xs">
          Showing {filteredRows.length > 0 ? startIdx + 1 : 0}-{Math.min(startIdx + rowsPerPage, filteredRows.length)} out of {filteredRows.length}
        </span>
        <div className="flex items-center gap-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-[#1a2028] border border-gray-700 text-xs text-white px-2 py-1.5 focus:outline-none focus:border-gray-500 cursor-pointer"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>Show {n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
