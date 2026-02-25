'use client';

import { NetworkSwitcherModal } from '@/components/layout/network-switcher-modal';
import { useSymbolData } from '@/hooks/use-market-data';
import { cn } from '@/lib/utils/cn';
import {
  formatCompactNumber,
  formatPercentage,
  formatPrice,
} from '@/lib/utils/format';
import { useFavoritesStore } from '@/store/favorites-store';
import { useMarketStore } from '@/store/market-store';
import { useNetworkStore } from '@/store/network-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface MarketInfoBarProps {
  symbol: string;
}

export function MarketInfoBar({ symbol }: MarketInfoBarProps) {
  const router = useRouter();
  const { market } = useSymbolData(symbol);
  const { network } = useNetworkStore();
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showMarketsDropdown, setShowMarketsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [searchMode, setSearchMode] = useState<'strict' | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 80,
    left: 24,
  });
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

  // Calculate dropdown position when button is clicked, window resizes, or page scrolls
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();

        setDropdownPosition({
          top: rect.bottom + 4, // Position just below the button + small gap
          left: rect.left,
        });
      }
    };

    if (showMarketsDropdown) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // Capture phase to catch all scrolls
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
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

    // Sort by volume (high to low)
    filtered.sort((a, b) => {
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
            className="fixed w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[90%] lg:w-[900px] max-w-[900px] bg-gradient-to-b from-gray-900 to-black border border-gray-700/40 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{
              zIndex: 99998,
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {/* Search Bar */}
            <div className="p-3 sm:p-4 border-b border-gray-800/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/60 border border-white/20 rounded-lg text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
                autoFocus
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setSearchMode('strict')}
                  className={cn(
                    'flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200',
                    searchMode === 'strict'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-lg hover:shadow-teal-500/30'
                      : 'bg-gray-700/70 hover:bg-gray-600/70'
                  )}
                >
                  Strict
                </button>
                <button
                  onClick={() => setSearchMode('all')}
                  className={cn(
                    'flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200',
                    searchMode === 'all'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-lg hover:shadow-teal-500/30'
                      : 'bg-gray-700/70 hover:bg-gray-600/70'
                  )}
                >
                  All
                </button>
              </div>
            </div>

            {/* Filter Tabs - Scrollable on mobile */}
            <div className="flex border-b border-gray-800/40 text-xs px-2 sm:px-4 gap-1 overflow-x-auto scrollbar-hide">
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
                    'px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg transition-all duration-200 font-medium whitespace-nowrap flex-shrink-0',
                    activeFilter === filter
                      ? 'text-white bg-gray-800/50 border-b-2 border-teal-500'
                      : 'text-white/70 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Column Headers - Responsive */}
            <div className="grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 text-[10px] sm:text-[11px] text-gray-500 border-b border-gray-800/40 font-semibold uppercase tracking-wider bg-gray-900/50">
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
            <div className="max-h-[300px] sm:max-h-[400px] md:max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
              {markets.size === 0 ? (
                <div className="flex items-center justify-center py-12 sm:py-16 text-gray-400 text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-3 border-teal-500 mx-auto mb-2 sm:mb-3"></div>
                    <div className="font-medium">Loading markets...</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-1.5">
                      ({markets.size} markets loaded)
                    </div>
                  </div>
                </div>
              ) : filteredMarkets.length === 0 ? (
                <div className="flex items-center justify-center py-12 sm:py-16 text-gray-500 text-xs sm:text-sm font-medium">
                  No markets found for &ldquo;{searchTerm}&rdquo;
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
                        'grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-800/20 hover:bg-gray-800/40 transition-all duration-150 text-[10px] sm:text-xs group',
                        isActive &&
                          'bg-teal-500/10 border-l-2 border-l-teal-500'
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
                        <span className="font-semibold text-white group-hover:text-teal-400 transition-colors truncate">
                          {m.symbol}
                        </span>
                        <span className="hidden sm:inline text-gray-600 text-[9px]">
                          -USDC
                        </span>
                        <span className="hidden lg:inline px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold rounded">
                          40x
                        </span>
                      </div>

                      {/* Last Price */}
                      <div className="col-span-3 sm:col-span-2 text-right text-gray-300 font-mono font-semibold flex items-center justify-end group-hover:text-white transition-colors">
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
                          'col-span-3 sm:col-span-2 text-right font-bold flex items-center justify-end',
                          marketChange >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
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
                      <div className="hidden sm:flex sm:col-span-2 text-right text-gray-400 font-semibold items-center justify-end group-hover:text-gray-300 transition-colors">
                        {marketFunding !== 0
                          ? `${(marketFunding * 100).toFixed(4)}%`
                          : '--'}
                      </div>

                      {/* Volume */}
                      <div className="col-span-2 sm:col-span-2 text-right text-gray-400 font-semibold flex items-center justify-end group-hover:text-gray-300 transition-colors">
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
                      <div className="hidden lg:flex lg:col-span-2 text-right text-gray-400 font-semibold items-center justify-end group-hover:text-gray-300 transition-colors">
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
    <div className="border-b border-white/20 bg-[#0f0f0f]">
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-[72px] gap-3">
          {/* Left Side - All Market Info */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide">
            {/* Markets Dropdown */}
            <div className="relative flex items-center flex-shrink-0" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setShowMarketsDropdown(!showMarketsDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-all group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span className="text-lg font-bold text-white whitespace-nowrap">
                  {isSpot ? symbol : `${symbol}/USDC`}
                </span>
                <svg
                  className={cn(
                    'w-4 h-4 text-gray-500 transition-all duration-200',
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
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 border-l border-white/10 pl-4">
              <span className="text-lg sm:text-2xl font-bold text-white tabular-nums">
                ${price > 0 ? formatPrice(price, price > 100 ? 2 : 4) : '--'}
              </span>
              <span
                className={cn(
                  'px-2 py-1 rounded-lg text-xs sm:text-sm font-bold tabular-nums',
                  isPositive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                )}
              >
                {market ? formatPercentage(change24h) : '--'}
              </span>
            </div>

            {/* Stats - Vertical layout like reference */}
            {/* 24h Volume */}
            <div className="hidden md:flex flex-col px-4 flex-shrink-0 border-l border-white/10">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">24H Volume</span>
              <span className="text-sm font-semibold text-white tabular-nums">
                ${market ? formatCompactNumber(volume24h) : '--'}
              </span>
            </div>

            {/* Open Interest - Perps only */}
            {!isSpot && (
              <div className="hidden md:flex flex-col px-4 flex-shrink-0 border-l border-white/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Open Interest</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    ${market ? formatCompactNumber(openInterest) : '--'}
                  </span>
                </div>
              </div>
            )}

            {/* 24h High/Low - Perps only */}
            {!isSpot && market && (
              <div className="hidden lg:flex flex-col px-4 flex-shrink-0 border-l border-white/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">24H Range</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-emerald-400">↗</span>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    ${formatPrice(price * 1.02, price > 100 ? 2 : 4)}
                  </span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="text-xs text-rose-400">↘</span>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    ${formatPrice(price * 0.98, price > 100 ? 2 : 4)}
                  </span>
                </div>
              </div>
            )}

            {/* Funding Rate - Perps only */}
            {!isSpot && (
              <div className="hidden xl:flex flex-col px-4 flex-shrink-0 border-l border-white/10">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Funding Rate</span>
                <span className={cn(
                  'text-sm font-semibold tabular-nums',
                  parseFloat(funding) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {market ? `${(parseFloat(funding) * 100).toFixed(4)}%` : '--'}
                </span>
              </div>
            )}
          </div>

          {/* Right Side - Network Switcher */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => setShowNetworkModal(true)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap border',
                network === 'mainnet'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50'
              )}
            >
              <span className={cn(
                'w-2 h-2 rounded-full',
                network === 'mainnet' ? 'bg-emerald-400' : 'bg-amber-400'
              )} />
              {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown rendered via Portal */}
      {dropdownContent}

      {/* Network Switcher Modal */}
      <NetworkSwitcherModal
        isOpen={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
      />
    </div>
  );
}
