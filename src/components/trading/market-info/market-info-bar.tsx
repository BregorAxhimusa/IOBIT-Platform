'use client';

import Image from 'next/image';
import { useSymbolData } from '@/hooks/use-market-data';
import { cn } from '@/lib/utils/cn';
import {
  formatCompactNumber,
  formatPercentage,
  formatPrice,
} from '@/lib/utils/format';
import { useFavoritesStore } from '@/store/favorites-store';
import { useMarketStore } from '@/store/market-store';
import { CoinIcon } from '@/components/ui/coin-icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface MarketInfoBarProps {
  symbol: string;
  mobileStatsExpanded?: boolean;
  onMobileStatsToggle?: (expanded: boolean) => void;
}

// Known symbols with coin icons - only include symbols that have actual icon files
const SYMBOLS_WITH_ICONS = new Set([
  'AAVE', 'ADA', 'AERO', 'ALGO', 'APE', 'APT', 'AR', 'ARB', 'ATOM', 'AVAX',
  'AXS', 'BCH', 'BERA', 'BLUR', 'BLZ', 'BNB', 'BOME', 'BONK', 'BSV', 'BTC',
  'CAKE', 'CELO', 'COMP', 'CRV', 'DASH', 'DOGE', 'DOT', 'DYDX', 'DYM', 'EIGEN',
  'ENA', 'ENJ', 'ENS', 'EOS', 'ETC', 'ETH', 'ETHFI', 'FET', 'FIL', 'FTM',
  'FTT', 'FXS', 'GALA', 'GMT', 'GMX', 'GRT', 'HBAR', 'HYPE', 'ICP', 'IMX',
  'INJ', 'IO', 'IOTA', 'JTO', 'JUP', 'KAS', 'LDO', 'LINK', 'LTC', 'MANA',
  'MANTA', 'MATIC', 'MEME', 'MKR', 'MOVE', 'NEAR', 'NEO', 'NOT', 'OM', 'OMNI',
  'ONDO', 'OP', 'ORDI', 'PAXG', 'PENDLE', 'PENGU', 'PEOPLE', 'PEPE', 'PNUT',
  'POPCAT', 'PYTH', 'RENDER', 'RNDR', 'RSR', 'RUNE', 'SAGA', 'SAND', 'SEI',
  'SHIB', 'SNX', 'SOL', 'STRK', 'STX', 'SUI', 'SUSHI', 'TAO', 'TIA', 'TON',
  'TRUMP', 'TRX', 'UNI', 'USUAL', 'VET', 'VIRTUAL', 'W', 'WIF', 'WLD', 'XLM',
  'XMR', 'XRP', 'YGG', 'ZEC', 'ZETA', 'ZK', 'ZRO'
]);

export function MarketInfoBar({ symbol, mobileStatsExpanded, onMobileStatsToggle }: MarketInfoBarProps) {
  const router = useRouter();
  const { market } = useSymbolData(symbol);
  const [showMarketsDropdown, setShowMarketsDropdown] = useState(false);
  const [showMobileStatsInternal, setShowMobileStatsInternal] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const showMobileStats = mobileStatsExpanded !== undefined ? mobileStatsExpanded : showMobileStatsInternal;
  const setShowMobileStats = (value: boolean) => {
    if (onMobileStatsToggle) {
      onMobileStatsToggle(value);
    } else {
      setShowMobileStatsInternal(value);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [searchMode, setSearchMode] = useState<'strict' | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const markets = useMarketStore((state) => state.markets);
  const marketType = useMarketStore((state) => state.marketType);
  const isSpot = marketType === 'spot';
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on scroll (but not when scrolling inside the dropdown)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (showMarketsDropdown) {
        // Check if the scroll is happening inside the dropdown
        const target = e.target as Node;
        if (dropdownContentRef.current?.contains(target)) {
          return; // Don't close if scrolling inside the modal
        }
        setShowMarketsDropdown(false);
        setSearchTerm('');
        setSearchMode('all');
        setActiveFilter('All');
      }
    };

    if (showMarketsDropdown) {
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showMarketsDropdown]);

  const price = market?.price ? parseFloat(market.price) : 0;
  const change24h = market?.change24h || 0;
  const volume24h = market?.volume24h || '0';
  const funding = market?.funding || '0';
  const openInterest = market?.openInterest || '0';

  const isPositive = change24h >= 0;

  // Filter and sort markets for dropdown
  const filteredMarkets = useMemo(() => {
    let filtered = Array.from(markets.values());

    // Apply category filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Perps') {
        // For now, assume most markets are perps (this is true for Hyperliquid)
        filtered = filtered; // All markets are perpetuals on Hyperliquid
      } else if (activeFilter === 'Spot') {
        // Spot filter handled below after search
        filtered = [];
      } else if (activeFilter === 'Crypto') {
        // Traditional crypto assets (BTC, ETH, major coins)
        const cryptoSymbols = [
          'BTC',
          'ETH',
          'SOL',
          'AVAX',
          'MATIC',
          'BNB',
          'ADA',
          'DOT',
          'LINK',
          'UNI',
        ];
        filtered = filtered.filter((m) => cryptoSymbols.includes(m.symbol));
      } else if (activeFilter === 'Tradfi') {
        // Traditional finance (stocks, forex, commodities)
        // Looking for symbols that might be stocks or forex
        filtered = filtered.filter(
          (m) =>
            m.symbol.includes('USD') ||
            (m.symbol.match(/^[A-Z]{3,4}$/) &&
              !['BTC', 'ETH', 'SOL'].includes(m.symbol))
        );
      } else if (activeFilter === 'Trending') {
        // Top 10 by 24h volume
        filtered = filtered.slice(0, 10);
      } else {
        // For HIP-3 and Pre-launch, show empty for now
        filtered = [];
      }
    }

    // Apply search filter
    if (searchTerm) {
      if (searchMode === 'strict') {
        // Strict mode: exact match (case-insensitive)
        filtered = filtered.filter(
          (m) => m.symbol.toLowerCase() === searchTerm.toLowerCase()
        );
      } else {
        // All mode: contains match (case-insensitive)
        filtered = filtered.filter((m) =>
          m.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    // Sort: symbols with icons first (sorted by volume), then rest by volume
    filtered.sort((a, b) => {
      const aHasIcon = SYMBOLS_WITH_ICONS.has(a.symbol);
      const bHasIcon = SYMBOLS_WITH_ICONS.has(b.symbol);

      if (aHasIcon && !bHasIcon) return -1;
      if (!aHasIcon && bHasIcon) return 1;

      // Both have or both don't have icons, sort by volume
      const volA = parseFloat(a.volume24h || '0');
      const volB = parseFloat(b.volume24h || '0');
      return volB - volA;
    });

    return filtered;
  }, [markets, searchTerm, searchMode, activeFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Check if click is outside both the button and the dropdown content
      const clickedOutsideButton =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideDropdown =
        dropdownContentRef.current &&
        !dropdownContentRef.current.contains(target);

      if (clickedOutsideButton && clickedOutsideDropdown) {
        setShowMarketsDropdown(false);
        setSearchTerm('');
        setSearchMode('all');
        setActiveFilter('All');
      }
    }

    if (showMarketsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMarketsDropdown]);

  // Dropdown content
  const dropdownContent =
    showMarketsDropdown && mounted
      ? createPortal(
          <div
            ref={dropdownContentRef}
            className={cn(
              "fixed inset-x-0 bottom-14 lg:bottom-auto lg:inset-x-auto lg:top-[128.6px] lg:left-0 lg:w-[1100px] lg:max-w-[1200px] bg-[#0a0a0c] overflow-hidden border-t lg:border border-[#1a1a1f] shadow-2xl z-[60] lg:z-[99998] flex flex-col",
              showMobileStats ? "top-[207px]" : "top-[100px]"
            )}
          >
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b border-[#2a2a2f]">
              <h2 className="text-sm font-medium text-white">Select Market</h2>
              <button
                onClick={() => setShowMarketsDropdown(false)}
                className="p-1.5 text-[#68686f] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-2 sm:p-3 border-b border-[#2a2a2f] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#68686f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-[#56565B]/30 border border-[#1a1a1f] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#16DE93]/50 focus:ring-1 focus:ring-[#16DE93]/20 transition-all"
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSearchMode('strict')}
                  className={cn(
                    'flex-1 sm:flex-initial px-3 py-1.5 text-xs font-normal transition-all duration-200',
                    searchMode === 'strict'
                      ? 'text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]'
                      : 'text-white bg-[#56565B]/30 hover:bg-[#56565B]/50'
                  )}
                >
                  Strict
                </button>
                <button
                  onClick={() => setSearchMode('all')}
                  className={cn(
                    'flex-1 sm:flex-initial px-3 py-1.5 text-xs font-normal transition-all duration-200',
                    searchMode === 'all'
                      ? 'text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]'
                      : 'text-white bg-[#56565B]/30 hover:bg-[#56565B]/50'
                  )}
                >
                  All
                </button>
              </div>
            </div>

            {/* Filter Tabs - Scrollable on mobile */}
            <div className="flex border-b border-[#2a2a2f] text-xs px-2 sm:px-4 gap-1 overflow-x-auto scrollbar-hide py-2">
              {[
                'All',
                'Perps',
                'Spot',
                'Crypto',
                'Tradfi',
                'HIP-3',
                'Trending',
                'Pre-launch',
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all duration-200 font-normal whitespace-nowrap flex-shrink-0',
                    activeFilter === filter
                      ? 'text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Column Headers - Responsive */}
            <div className="grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-[11px] text-[#68686f] border-b border-[#2a2a2f] font-normal uppercase tracking-wider bg-[#0a0a0c]">
              <div className="col-span-4 sm:col-span-2">Symbol</div>
              <div className="col-span-3 sm:col-span-2 text-right">Price</div>
              <div className="col-span-3 sm:col-span-2 text-right">24h %</div>
              <div className="hidden sm:block sm:col-span-2 text-right">
                Funding
              </div>
              <div className="col-span-2 sm:col-span-2 text-right">Volume</div>
              <div className="hidden lg:block lg:col-span-2 text-right">
                Open Int.
              </div>
            </div>

            {/* Markets List */}
            <div className="flex-1 lg:flex-none lg:max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
              {markets.size === 0 ? (
                <div className="flex items-center justify-center py-12 sm:py-16 text-white text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-3 border-[#16DE93] mx-auto mb-2 sm:mb-3"></div>
                    <div className="font-normal">Loading markets...</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-1.5">
                      ({markets.size} markets loaded)
                    </div>
                  </div>
                </div>
              ) : filteredMarkets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Image
                    src="/iobit/landingpage/nofound.svg"
                    alt="No markets"
                    width={40}
                    height={40}
                    className="mb-2 opacity-50"
                  />
                  <span className="text-[#8A8A8E] text-xs sm:text-sm font-normal">
                    No markets found for &ldquo;{searchTerm}&rdquo;
                  </span>
                </div>
              ) : (
                filteredMarkets.map((m) => {
                  const marketPrice = parseFloat(m.price || '0');
                  const marketChange = m.change24h || 0;
                  const marketVolume = parseFloat(m.volume24h || '0');
                  const marketFunding = parseFloat(m.funding || '0');
                  const marketOI = parseFloat(m.openInterest || '0');
                  const isActive = m.symbol === symbol;
                  const isFav = isFavorite(m.symbol);

                  return (
                    <Link
                      key={m.symbol}
                      href={`/trade/${m.symbol}`}
                      onClick={(e) => {
                        setShowMarketsDropdown(false);
                        setSearchTerm('');
                        setSearchMode('all');
                        setActiveFilter('All');

                        // Force navigation and refresh if different symbol
                        if (m.symbol !== symbol) {
                          e.preventDefault();
                          router.push(`/trade/${m.symbol}`);
                          // Small delay to ensure navigation completes
                          setTimeout(() => {
                            router.refresh();
                          }, 100);
                        }
                      }}
                      className={cn(
                        'grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 border-b border-[#2a2a2f] hover:bg-gray-800/40 transition-all duration-150 text-[10px] sm:text-xs group',
                        isActive &&
                          'bg-[#16DE93]/10 border-l-2 border-l-[#16DE93]'
                      )}
                    >
                      {/* Symbol */}
                      <div className="col-span-4 sm:col-span-2 flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(m.symbol);
                          }}
                          className="text-gray-600 hover:text-yellow-400 transition-all duration-200 hover:scale-125 hidden sm:inline"
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                        <CoinIcon symbol={m.symbol} size="sm" />
                        <span className={cn(
                            'font-normal transition-colors truncate',
                            isActive ? 'text-[#16DE93]' : 'text-white group-hover:text-[#16DE93]'
                          )}>
                          {m.symbol}
                        </span>
                        <span className={cn(
                            'hidden sm:inline text-[9px]',
                            isActive ? 'text-[#16DE93]/60' : 'text-gray-600'
                          )}>
                          USDC
                        </span>
                        <span className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-[#F7931A]/10 text-[#F7931A] font-medium">
                          40x
                        </span>
                      </div>

                      {/* Last Price */}
                      <div className="col-span-3 sm:col-span-2 text-right text-white font-normal flex items-center justify-end group-hover:text-white transition-colors">
                        {marketPrice > 0
                          ? marketPrice.toLocaleString(undefined, {
                              minimumFractionDigits:
                                marketPrice < 1 ? 4 : marketPrice < 100 ? 2 : 0,
                              maximumFractionDigits:
                                marketPrice < 1 ? 4 : marketPrice < 100 ? 2 : 0,
                            })
                          : '--'}
                      </div>

                      {/* 24H Change */}
                      <div
                        className={cn(
                          'col-span-3 sm:col-span-2 text-right font-normal flex items-center justify-end',
                          marketChange >= 0
                            ? 'text-[#16DE93]'
                            : 'text-[#f6465d]'
                        )}
                      >
                        {marketChange !== 0 ? (
                          <>
                            {marketChange >= 0 ? '+' : ''}
                            {marketChange.toFixed(2)}%
                          </>
                        ) : (
                          <span className="text-gray-600">--</span>
                        )}
                      </div>

                      {/* 8H Funding - Hidden on mobile */}
                      <div className="hidden sm:flex sm:col-span-2 text-right text-white font-normal items-center justify-end group-hover:text-white transition-colors">
                        {marketFunding !== 0
                          ? `${(marketFunding * 100).toFixed(4)}%`
                          : '--'}
                      </div>

                      {/* Volume */}
                      <div className="col-span-2 sm:col-span-2 text-right text-white font-normal flex items-center justify-end group-hover:text-white transition-colors">
                        {marketVolume > 0
                          ? `$${
                              marketVolume >= 1000000000
                                ? (marketVolume / 1000000000).toFixed(1) + 'B'
                                : marketVolume >= 1000000
                                  ? (marketVolume / 1000000).toFixed(0) + 'M'
                                  : marketVolume >= 1000
                                    ? (marketVolume / 1000).toFixed(0) + 'K'
                                    : marketVolume.toFixed(0)
                            }`
                          : '--'}
                      </div>

                      {/* Open Interest - Hidden on mobile and tablet */}
                      <div className="hidden lg:flex lg:col-span-2 text-right text-white font-normal items-center justify-end group-hover:text-white transition-colors">
                        {marketOI > 0
                          ? `$${
                              marketOI >= 1000000000
                                ? (marketOI / 1000000000).toFixed(1) + 'B'
                                : marketOI >= 1000000
                                  ? (marketOI / 1000000).toFixed(0) + 'M'
                                  : marketOI >= 1000
                                    ? (marketOI / 1000).toFixed(0) + 'K'
                                    : marketOI.toFixed(0)
                            }`
                          : '--'}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="border-b border-[#1a1a1f] bg-[#0a0a0c]">
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side - All Market Info */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide">
            {/* Markets Dropdown */}
            <div className="relative flex items-center flex-shrink-0 py-2" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setShowMarketsDropdown(!showMarketsDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-all group"
              >
                <CoinIcon symbol={symbol} size="sm" />
                <span className="text-lg font-normal text-white whitespace-nowrap">
                  {isSpot ? symbol : `${symbol}/USD`}
                </span>
                <span className="text-sm text-[#6b6b6b] whitespace-nowrap">
                  [{symbol}-USDC]
                </span>
                <svg
                  className={cn(
                    'w-4 h-4 text-[#68686f] transition-all duration-200',
                    showMarketsDropdown && 'rotate-180 text-white'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Main Price with Change Badge */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 border-l border-[#1a1a1f] pl-4 py-2">
              <span className="text-lg sm:text-2xl font-normal text-white tabular-nums">
                ${price > 0 ? formatPrice(price, price > 100 ? 2 : 4) : '--'}
              </span>
              <span
                className={cn(
                  'hidden sm:inline px-2 py-1 rounded-lg text-xs sm:text-sm font-normal tabular-nums backdrop-blur-[2.5px]',
                  isPositive
                    ? 'text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)]'
                    : 'text-[#f6465d] shadow-[inset_0_0.5px_8px_rgba(246,70,93,0.10)]'
                )}
              >
                {market ? formatPercentage(change24h) : '--'}
              </span>
            </div>

            {/* Stats - Vertical layout like reference */}
            {/* 24h Volume */}
            <div className="hidden md:flex flex-col px-4 flex-shrink-0 border-l border-[#1a1a1f] py-2">
              <span className="text-[10px] text-[#68686f] uppercase tracking-wider">24H Volume</span>
              <span className="text-sm font-normal text-white tabular-nums">
                ${market ? formatCompactNumber(volume24h) : '--'}
              </span>
            </div>

            {/* Open Interest - Perps only */}
            {!isSpot && (
              <div className="hidden md:flex flex-col px-4 flex-shrink-0 border-l border-[#1a1a1f] py-2">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">Open Interest</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-white tabular-nums">
                    ${market ? formatCompactNumber(openInterest) : '--'}
                  </span>
                </div>
              </div>
            )}

            {/* 24h High/Low - Perps only */}
            {!isSpot && market && (
              <div className="hidden lg:flex flex-col px-4 flex-shrink-0 border-l border-[#1a1a1f] py-2">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">24H Range</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[#16DE93]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-normal text-white tabular-nums">
                    ${formatPrice(price * 1.02, price > 100 ? 2 : 4)}
                  </span>
                  <span className="text-gray-600 mx-1">/</span>
                  <svg className="w-3 h-3 text-[#f6465d]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-normal text-white tabular-nums">
                    ${formatPrice(price * 0.98, price > 100 ? 2 : 4)}
                  </span>
                </div>
              </div>
            )}

            {/* Funding Rate - Perps only */}
            {!isSpot && (
              <div className="hidden xl:flex flex-col px-4 flex-shrink-0 border-l border-[#1a1a1f] py-2">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">Funding Rate</span>
                <span className={cn(
                  'text-sm font-normal tabular-nums',
                  parseFloat(funding) >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                )}>
                  {market ? `${(parseFloat(funding) * 100).toFixed(4)}%` : '--'}
                </span>
              </div>
            )}

            {/* Mobile Stats Button */}
            <button
              onClick={() => setShowMobileStats(!showMobileStats)}
              className={cn(
                'md:hidden flex items-center justify-center px-2 py-1.5 rounded border transition-all flex-shrink-0',
                showMobileStats
                  ? 'bg-[#16DE93]/20 border-[#16DE93]/50 text-[#16DE93]'
                  : 'bg-[#111111] border-[#1a1a1f] text-[#68686f] hover:border-[#333]'
              )}
            >
              <svg className={cn('w-4 h-4 transition-transform', showMobileStats && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Stats Dropdown */}
        {showMobileStats && (
          <div className="md:hidden border-t border-[#1a1a1f] py-3 px-2 grid grid-cols-2 gap-3">
            {/* 24h Volume */}
            <div className="flex flex-col">
              <span className="text-[10px] text-[#68686f] uppercase tracking-wider">24H Volume</span>
              <span className="text-sm font-normal text-white tabular-nums">
                ${market ? formatCompactNumber(volume24h) : '--'}
              </span>
            </div>

            {/* Open Interest - Perps only */}
            {!isSpot && (
              <div className="flex flex-col">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">Open Interest</span>
                <span className="text-sm font-normal text-white tabular-nums">
                  ${market ? formatCompactNumber(openInterest) : '--'}
                </span>
              </div>
            )}

            {/* 24h Range - Perps only */}
            {!isSpot && market && (
              <div className="flex flex-col">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">24H Range</span>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-[#16DE93]">${formatPrice(price * 1.02, price > 100 ? 2 : 4)}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-[#f6465d]">${formatPrice(price * 0.98, price > 100 ? 2 : 4)}</span>
                </div>
              </div>
            )}

            {/* Funding Rate - Perps only */}
            {!isSpot && (
              <div className="flex flex-col">
                <span className="text-[10px] text-[#68686f] uppercase tracking-wider">Funding Rate</span>
                <span className={cn(
                  'text-sm font-normal tabular-nums',
                  parseFloat(funding) >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                )}>
                  {market ? `${(parseFloat(funding) * 100).toFixed(4)}%` : '--'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dropdown rendered via Portal */}
      {dropdownContent}
    </div>
  );
}
