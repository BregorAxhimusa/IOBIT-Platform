'use client';

import { use, useState } from 'react';
import { MarketInfoBar } from '@/components/trading/market-info/market-info-bar';
import { PriceChart } from '@/components/trading/chart/price-chart';
import { OrderBook } from '@/components/trading/order-book/order-book';
import { RecentTrades } from '@/components/trading/trade-history/recent-trades';
import { TradingPanel } from '@/components/trading/trade-panel/trading-panel';
import { PositionsTable } from '@/components/trading/positions/positions-table';
import { OpenOrdersTable } from '@/components/trading/orders/open-orders-table';
import { OrderHistoryTable } from '@/components/trading/orders/order-history-table';
import { TradeHistoryTable } from '@/components/trading/trade-history/trade-history-table';
import { SpotBalancesTable } from '@/components/trading/spot/spot-balances-table';
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

export default function TradingPage({ params }: TradingPageProps) {
  const { symbol } = use(params);
  const symbolUpper = symbol.toUpperCase();
  const [activeTab, setActiveTab] = useState<BottomTab>('positions');
  const [rightTab, setRightTab] = useState<RightSidebarTab>('orderbook');

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

  // Handle price click from order book
  const handlePriceClick = (price: string) => {
    setPrice(price);
  };

  return (
    <div className="bg-[#0a0a0f]">
      {/* Market Info Bar */}
      <MarketInfoBar key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} />

      {/* Main Trading Layout */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-128px)] relative">
        {/* Left Section - Chart & OrderBook & Bottom Tables */}
        <div className="flex-1 flex flex-col p-1 sm:p-2 lg:p-1 min-w-0 space-y-1.5 sm:space-y-2 lg:space-y-1">
          {/* Top Row - Chart and Order Book/Trades */}
          <div className="flex flex-col lg:flex-row lg:flex-1 lg:mb-0 gap-1.5 sm:gap-2 lg:gap-1 lg:min-h-0">
            {/* Chart */}
            <div className="w-full lg:flex-1 h-[240px] sm:h-[350px] md:h-[420px] lg:h-full">
              <ChartErrorBoundary>
                <PriceChart key={symbolUpper} symbol={symbolUpper} />
              </ChartErrorBoundary>
            </div>

            {/* Order Book & Recent Trades Tabs - Desktop Only */}
            <div className="hidden lg:flex lg:w-80 lg:h-full bg-[#0f0f0f] border border-white/20 flex-col overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-white/20 bg-[#0a0a0a]/50">
                <button
                  onClick={() => setRightTab('orderbook')}
                  className={cn(
                    'flex-1 px-3 py-3 text-sm font-semibold transition-all relative',
                    rightTab === 'orderbook'
                      ? 'text-teal-400'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  Order Book
                  {rightTab === 'orderbook' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setRightTab('trades')}
                  className={cn(
                    'flex-1 px-3 py-3 text-sm font-semibold transition-all relative',
                    rightTab === 'trades'
                      ? 'text-teal-400'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  Recent Trades
                  {rightTab === 'trades' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
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

          {/* Order Book & Recent Trades - Mobile Only */}
          <div className="lg:hidden bg-[#0a0a0a] border border-white/20 flex flex-col h-[280px] sm:h-[350px] overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-white/20 bg-[#0a0a0a]/50">
              <button
                onClick={() => setRightTab('orderbook')}
                className={cn(
                  'flex-1 px-3 py-3 text-xs sm:text-sm font-semibold transition-all relative',
                  rightTab === 'orderbook'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Order Book
                {rightTab === 'orderbook' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setRightTab('trades')}
                className={cn(
                  'flex-1 px-3 py-3 text-xs sm:text-sm font-semibold transition-all relative',
                  rightTab === 'trades'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Recent Trades
                {rightTab === 'trades' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
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

          {/* Bottom Panel - Positions, Orders, History */}
          <div className="bg-[#0f0f0f] border border-white/20 overflow-hidden lg:h-[300px] flex flex-col">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-white/20 bg-[#0a0a0a]/50 scrollbar-hide">
              <button
                onClick={() => setActiveTab('positions')}
                className={cn(
                  'px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all relative',
                  activeTab === 'positions'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Positions
                {activeTab === 'positions' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 lg:w-14 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all relative',
                  activeTab === 'orders'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Open Orders
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 lg:w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all relative',
                  activeTab === 'history'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Order History
                {activeTab === 'history' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 lg:w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={cn(
                  'px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all relative',
                  activeTab === 'trades'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Trade History
                {activeTab === 'trades' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 lg:w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>
              {isSpot && (
                <button
                  onClick={() => setActiveTab('balances')}
                  className={cn(
                    'px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all relative',
                    activeTab === 'balances'
                      ? 'text-teal-400'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  Balances
                  {activeTab === 'balances' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 lg:w-14 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                  )}
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-1">
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

        {/* Right Sidebar - Trading Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/20 p-1 sm:p-2 lg:p-1 flex-shrink-0">
          <TradingErrorBoundary>
            <TradingPanel key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} currentPrice={currentPrice} />
          </TradingErrorBoundary>
        </div>
      </div>
    </div>
  );
}
