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
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Market Info Bar */}
      <MarketInfoBar key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} />

      {/* Main Trading Layout */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-128px)] relative">
        {/* Left Section - Chart & OrderBook & Bottom Tables */}
        <div className="flex-1 flex flex-col p-2 lg:p-1 min-w-0 space-y-2 lg:space-y-0">
          {/* Top Row - Chart and Order Book/Trades */}
          <div className="flex flex-col lg:flex-row flex-1 lg:mb-3 gap-2 lg:gap-3 lg:min-h-0">
            {/* Chart */}
            <div className="w-full lg:flex-1 h-[300px] sm:h-[400px] lg:h-auto lg:min-h-[350px] lg:max-h-[480px]">
              <ChartErrorBoundary>
                <PriceChart key={symbolUpper} symbol={symbolUpper} />
              </ChartErrorBoundary>
            </div>

            {/* Order Book & Recent Trades Tabs - Desktop Only */}
            <div className="hidden lg:flex lg:w-80 bg-[#0f1419] border border-gray-800 rounded-lg flex-col">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setRightTab('orderbook')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-semibold transition-colors',
                    rightTab === 'orderbook'
                      ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                  )}
                >
                  Order Book
                </button>
                <button
                  onClick={() => setRightTab('trades')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-semibold transition-colors',
                    rightTab === 'trades'
                      ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                  )}
                >
                  Recent Trades
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
          <div className="lg:hidden bg-[#0f1419] border border-gray-800 rounded-lg flex flex-col h-[350px]">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setRightTab('orderbook')}
                className={cn(
                  'flex-1 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors',
                  rightTab === 'orderbook'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Order Book
              </button>
              <button
                onClick={() => setRightTab('trades')}
                className={cn(
                  'flex-1 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors',
                  rightTab === 'trades'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Recent Trades
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
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg overflow-hidden lg:h-72">
            {/* Tab Headers - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto lg:overflow-visible border-b border-gray-800 scrollbar-hide lg:space-x-1 lg:px-3 lg:pt-2">
              <button
                onClick={() => setActiveTab('positions')}
                className={cn(
                  'px-3 py-2 lg:py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap lg:rounded-t transition-colors',
                  activeTab === 'positions'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6] lg:border-b-0'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Positions
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'px-3 py-2 lg:py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap lg:rounded-t transition-colors',
                  activeTab === 'orders'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6] lg:border-b-0'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Open Orders
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'px-3 py-2 lg:py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap lg:rounded-t transition-colors',
                  activeTab === 'history'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6] lg:border-b-0'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={cn(
                  'px-3 py-2 lg:py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap lg:rounded-t transition-colors',
                  activeTab === 'trades'
                    ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6] lg:border-b-0'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                Trade History
              </button>
              {isSpot && (
                <button
                  onClick={() => setActiveTab('balances')}
                  className={cn(
                    'px-3 py-2 lg:py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap lg:rounded-t transition-colors',
                    activeTab === 'balances'
                      ? 'bg-[#1a2028] text-white border-b-2 border-[#14b8a6] lg:border-b-0'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a2028]/50'
                  )}
                >
                  Balances
                </button>
              )}
            </div>

            {/* Tab Content - Horizontal Scroll */}
            <div className="p-2 h-[250px] sm:h-[300px] lg:h-[calc(100%-44px)] overflow-auto">
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
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-800 p-2 lg:p-1 flex-shrink-0">
          <TradingErrorBoundary>
            <TradingPanel key={symbolUpper} symbol={isSpot ? displaySymbol : symbolUpper} currentPrice={currentPrice} />
          </TradingErrorBoundary>
        </div>
      </div>
    </div>
  );
}
