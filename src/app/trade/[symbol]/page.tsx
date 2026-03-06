'use client';

import { use, useState } from 'react';
import dynamic from 'next/dynamic';
import { MarketInfoBar } from '@/components/trading/market-info/market-info-bar';
import { PriceChart } from '@/components/trading/chart/price-chart';
import { OrderBook } from '@/components/trading/order-book/order-book';
import { RecentTrades } from '@/components/trading/trade-history/recent-trades';
import { PositionsTable } from '@/components/trading/positions/positions-table';
import { OpenOrdersTable } from '@/components/trading/orders/open-orders-table';
import { OrderHistoryTable } from '@/components/trading/orders/order-history-table';
import { TradeHistoryTable } from '@/components/trading/trade-history/trade-history-table';
import { SpotBalancesTable } from '@/components/trading/spot/spot-balances-table';
import { MobileBottomNav } from '@/components/trading/mobile';
import { MobileAccountPanel } from '@/components/trading/mobile/mobile-account-panel';

// Dynamic import TradingPanel with ssr: false to avoid AppKit SSR issues
const TradingPanel = dynamic(
  () => import('@/components/trading/trade-panel/trading-panel').then(mod => ({ default: mod.TradingPanel })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0a0a0c] animate-pulse" /> }
);
import { useMarketStore } from '@/store/market-store';
import { useSpotStore } from '@/store/spot-store';
import { useMarketData } from '@/hooks/use-market-data';
import { useSpotMeta } from '@/hooks/use-spot-meta';
import { useUserPositions } from '@/hooks/use-user-positions';
import { useUserOrders } from '@/hooks/use-user-orders';
import { useTradingStore } from '@/store/trading-store';
import { isSpotSymbol, symbolToDisplay } from '@/lib/utils/spot-helpers';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { TradingErrorBoundary, ChartErrorBoundary, DataErrorBoundary } from '@/components/error-boundary';

interface TradingPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

type BottomTab = 'positions' | 'orders' | 'history' | 'trades' | 'balances';
type RightSidebarTab = 'orderbook' | 'trades';
type MobileMainTab = 'chart' | 'orderbook' | 'trades';
type MobileBottomSection = 'trade' | 'markets' | 'account';

export default function TradingPage({ params }: TradingPageProps) {
  const { symbol } = use(params);
  const symbolUpper = symbol.toUpperCase();
  const [activeTab, setActiveTab] = useState<BottomTab>('positions');
  const [rightTab, setRightTab] = useState<RightSidebarTab>('orderbook');
  const [mobileMainTab, setMobileMainTab] = useState<MobileMainTab>('chart');
  const [mobileBottomSection, setMobileBottomSection] = useState<MobileBottomSection>('markets');
  const [mobileStatsExpanded, setMobileStatsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Track screen size to conditionally render chart (avoid duplicate TradingView instances)
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const { setCurrentSymbol, setMarketType, getMarket, marketType } = useMarketStore();
  const { setPrice } = useTradingStore();
  const spotDetected = isSpotSymbol(symbolUpper);
  const isSpot = marketType === 'spot';
  const displaySymbol = spotDetected ? symbolToDisplay(symbolUpper) : symbolUpper;

  useMarketData(); // Initialize market data
  useSpotMeta(); // Initialize spot meta data
  useUserPositions(); // Fetch user positions
  useUserOrders(); // Fetch user orders

  // Detect market type from URL and set it
  useEffect(() => {
    if (spotDetected) {
      setMarketType('spot');
      setCurrentSymbol(displaySymbol);
    } else {
      setMarketType('perp');
      setCurrentSymbol(symbolUpper);
    }
  }, [symbolUpper, spotDetected, displaySymbol, setCurrentSymbol, setMarketType]);

  // Get price - for spot, try spot store first
  const spotAssetCtxs = useSpotStore((state) => state.spotAssetCtxs);
  const spotMeta = useSpotStore((state) => state.spotMeta);

  const getPrice = (): number | undefined => {
    if (isSpot && spotMeta) {
      const pairIdx = spotMeta.universe.findIndex((p) => p.name === displaySymbol);
      if (pairIdx >= 0 && spotAssetCtxs[pairIdx]) {
        const ctx = spotAssetCtxs[pairIdx];
        return parseFloat(ctx.midPx) || parseFloat(ctx.markPx) || undefined;
      }
    }
    const market = getMarket(isSpot ? displaySymbol : symbolUpper);
    return market ? parseFloat(market.price) : undefined;
  };

  const currentPrice = getPrice();

  // Update document title with current price
  useEffect(() => {
    const formatPriceForTitle = (p: number): string => {
      if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (p >= 1) return p.toFixed(2);
      return p.toFixed(4);
    };

    if (currentPrice && currentPrice > 0) {
      document.title = `$${formatPriceForTitle(currentPrice)} | ${displaySymbol} USD | IOBIT`;
    } else {
      document.title = `${displaySymbol} USD | IOBIT - Trade`;
    }

    return () => {
      document.title = 'IOBIT - Advanced Crypto Trading Platform';
    };
  }, [currentPrice, displaySymbol]);

  // Handle price click from order book
  const handlePriceClick = (price: string) => {
    setPrice(price);
  };

  return (
    <div className="bg-[#0a0a0c]">
      {/* Desktop Market Info Bar */}
      <div className="hidden lg:block">
        <MarketInfoBar key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} />
      </div>

      {/* Mobile Market Info Bar - Compact Version */}
      <div className="lg:hidden">
        <MarketInfoBar
          key={symbolUpper}
          symbol={isSpot ? displaySymbol : symbolUpper}
          mobileStatsExpanded={mobileStatsExpanded}
          onMobileStatsToggle={setMobileStatsExpanded}
        />
      </div>

      {/* Mobile Main Content Tabs (Chart/OrderBook/Trades) - Only show when Markets tab is active */}
      <div className={cn("lg:hidden border-b border-[#1a1a1f]", mobileBottomSection !== 'markets' && 'hidden')}>
        <div className="flex">
          <button
            onClick={() => setMobileMainTab('chart')}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-all relative',
              mobileMainTab === 'chart'
                ? 'text-white'
                : 'text-[#56565B]'
            )}
          >
            Chart
            {mobileMainTab === 'chart' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
            )}
          </button>
          <button
            onClick={() => setMobileMainTab('orderbook')}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-all relative',
              mobileMainTab === 'orderbook'
                ? 'text-white'
                : 'text-[#56565B]'
            )}
          >
            Order Book
            {mobileMainTab === 'orderbook' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
            )}
          </button>
          <button
            onClick={() => setMobileMainTab('trades')}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-all relative',
              mobileMainTab === 'trades'
                ? 'text-white'
                : 'text-[#56565B]'
            )}
          >
            Trades
            {mobileMainTab === 'trades' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Trading Layout */}
      <div className="flex flex-col lg:flex-row relative pb-14 lg:pb-0">
        {/* Left Section - Chart & OrderBook & Bottom Tables */}
        <div className="flex-1 flex flex-col lg:p-1 min-w-0">
          {/* Mobile Main Content Area - Only show when Markets tab is active */}
          <div className={cn("lg:hidden", mobileBottomSection !== 'markets' && 'hidden')}>
            {/* Chart - Mobile */}
            {mobileMainTab === 'chart' && !isDesktop && (
              <div className="h-[55vh] min-h-[300px]">
                <ChartErrorBoundary>
                  <PriceChart key={`mobile-${symbolUpper}`} symbol={symbolUpper} />
                </ChartErrorBoundary>
              </div>
            )}

            {/* Order Book - Mobile */}
            {mobileMainTab === 'orderbook' && (
              <div className="h-[55vh] min-h-[300px] overflow-hidden">
                <DataErrorBoundary>
                  <OrderBook key={symbolUpper} symbol={symbolUpper} onPriceClick={handlePriceClick} />
                </DataErrorBoundary>
              </div>
            )}

            {/* Recent Trades - Mobile */}
            {mobileMainTab === 'trades' && (
              <div className="h-[55vh] min-h-[300px] overflow-hidden">
                <DataErrorBoundary>
                  <RecentTrades key={symbolUpper} symbol={symbolUpper} />
                </DataErrorBoundary>
              </div>
            )}
          </div>

          {/* Desktop: Top Row - Chart and Order Book/Trades */}
          <div className="hidden lg:flex lg:flex-row lg:mt-0 lg:mb-0 gap-1 lg:h-[calc(100vh-470px)]">
            {/* Chart - Desktop */}
            <div className="w-full lg:flex-1 h-full">
              {isDesktop && (
                <ChartErrorBoundary>
                  <PriceChart key={`desktop-${symbolUpper}`} symbol={symbolUpper} />
                </ChartErrorBoundary>
              )}
            </div>

            {/* Order Book & Recent Trades Tabs - Desktop Only */}
            <div className="lg:w-80 h-full bg-[#0a0a0c] border border-[#1a1a1f] flex-col overflow-hidden flex">
              {/* Tab Headers */}
              <div className="flex border-b border-[#1a1a1f] bg-[#0a0a0a]">
                <button
                  onClick={() => setRightTab('orderbook')}
                  className={cn(
                    'flex-1 px-3 py-3 text-sm font-normal transition-all relative border-r border-[#1a1a1f]',
                    rightTab === 'orderbook'
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  Order Book
                  {rightTab === 'orderbook' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                  )}
                </button>
                <button
                  onClick={() => setRightTab('trades')}
                  className={cn(
                    'flex-1 px-3 py-3 text-sm font-normal transition-all relative',
                    rightTab === 'trades'
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  Recent Trades
                  {rightTab === 'trades' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <DataErrorBoundary>
                  {rightTab === 'orderbook' ? (
                    <OrderBook key={symbolUpper} symbol={symbolUpper} onPriceClick={handlePriceClick} />
                  ) : (
                    <RecentTrades key={symbolUpper} symbol={symbolUpper} />
                  )}
                </DataErrorBoundary>
              </div>
            </div>
          </div>

          {/* Bottom Panel - Positions, Orders, History (always show on desktop, show when Markets tab on mobile) */}
          <div className={cn(
            "bg-[#0a0a0c] border-t lg:border border-[#1a1a1f] overflow-hidden flex flex-col lg:flex-1",
            mobileBottomSection !== 'markets' ? 'hidden lg:flex' : 'flex'
          )}>
            {/* Tab Headers */}
            <div className="flex border-b border-[#1a1a1f] bg-[#0a0a0a]">
              <button
                onClick={() => setActiveTab('positions')}
                className={cn(
                  'flex-1 lg:flex-none px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-normal transition-all relative',
                  activeTab === 'positions'
                    ? 'text-white'
                    : 'text-[#56565B] lg:text-white/70 lg:hover:text-white'
                )}
              >
                Positions
                {activeTab === 'positions' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'flex-1 lg:flex-none px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-normal transition-all relative',
                  activeTab === 'orders'
                    ? 'text-white'
                    : 'text-[#56565B] lg:text-white/70 lg:hover:text-white'
                )}
              >
                Orders
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'flex-1 lg:flex-none px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-normal transition-all relative',
                  activeTab === 'history'
                    ? 'text-white'
                    : 'text-[#56565B] lg:text-white/70 lg:hover:text-white'
                )}
              >
                History
                {activeTab === 'history' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={cn(
                  'flex-1 lg:flex-none px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-normal transition-all relative',
                  activeTab === 'trades'
                    ? 'text-white'
                    : 'text-[#56565B] lg:text-white/70 lg:hover:text-white'
                )}
              >
                Trades
                {activeTab === 'trades' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                )}
              </button>
              {isSpot && (
                <button
                  onClick={() => setActiveTab('balances')}
                  className={cn(
                    'flex-1 lg:flex-none px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-normal transition-all relative',
                    activeTab === 'balances'
                      ? 'text-white'
                      : 'text-[#56565B] lg:text-white/70 lg:hover:text-white'
                  )}
                >
                  Balances
                  {activeTab === 'balances' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16DE93]" />
                  )}
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-1 min-h-[250px] lg:min-h-0">
              <DataErrorBoundary>
                {activeTab === 'positions' && <PositionsTable />}
                {activeTab === 'orders' && <OpenOrdersTable />}
                {activeTab === 'history' && <OrderHistoryTable />}
                {activeTab === 'trades' && <TradeHistoryTable />}
                {activeTab === 'balances' && <SpotBalancesTable />}
              </DataErrorBoundary>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trading Panel - Desktop Only */}
        <div className="hidden lg:block w-96 border-l border-[#1a1a1f] p-1 flex-shrink-0 overflow-y-auto">
          <TradingErrorBoundary>
            <TradingPanel key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} currentPrice={currentPrice} />
          </TradingErrorBoundary>
        </div>
      </div>

      {/* Mobile Trading Panel - Full Screen Overlay (only show when Trade tab is active) */}
      {mobileBottomSection === 'trade' && (
        <div
          className={cn(
            "lg:hidden fixed inset-x-0 bottom-14 z-[60] bg-[#0a0a0c] overflow-y-auto border-t border-b border-[#1a1a1f]",
            mobileStatsExpanded ? "top-[207px]" : "top-[100px]"
          )}
        >
          <TradingErrorBoundary>
            <TradingPanel key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} currentPrice={currentPrice} />
          </TradingErrorBoundary>
        </div>
      )}

      {/* Mobile Account Panel - Full Screen Overlay (only show when Account tab is active) */}
      {mobileBottomSection === 'account' && (
        <div
          className={cn(
            "lg:hidden fixed inset-x-0 bottom-14 z-[60] bg-[#0a0a0c] overflow-y-auto border-t border-b border-[#1a1a1f]",
            mobileStatsExpanded ? "top-[207px]" : "top-[100px]"
          )}
        >
          <MobileAccountPanel />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={mobileBottomSection}
        onSectionChange={(section) => setMobileBottomSection(section)}
      />
    </div>
  );
}
