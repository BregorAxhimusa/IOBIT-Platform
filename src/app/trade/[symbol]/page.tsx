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
import { useMarketStore } from '@/store/market-store';
import { useMarketData } from '@/hooks/use-market-data';
import { useUserPositions } from '@/hooks/use-user-positions';
import { useUserOrders } from '@/hooks/use-user-orders';
import { useTradingStore } from '@/store/trading-store';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { TradingErrorBoundary, ChartErrorBoundary, DataErrorBoundary } from '@/components/error-boundary';

interface TradingPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

type BottomTab = 'positions' | 'orders' | 'history' | 'trades';
type RightSidebarTab = 'orderbook' | 'trades';

export default function TradingPage({ params }: TradingPageProps) {
  const { symbol } = use(params);
  const symbolUpper = symbol.toUpperCase();
  const [activeTab, setActiveTab] = useState<BottomTab>('positions');
  const [rightTab, setRightTab] = useState<RightSidebarTab>('orderbook');

  const { setCurrentSymbol, getMarket } = useMarketStore();
  const { setPrice } = useTradingStore();
  useMarketData(); // Initialize market data
  useUserPositions(); // Fetch user positions
  useUserOrders(); // Fetch user orders

  useEffect(() => {
    setCurrentSymbol(symbolUpper);
  }, [symbolUpper, setCurrentSymbol]);

  const market = getMarket(symbolUpper);
  const currentPrice = market ? parseFloat(market.price) : undefined;

  // Handle price click from order book
  const handlePriceClick = (price: string) => {
    setPrice(price);
  };

  return (
    <div className="bg-black">
      {/* Market Info Bar */}
      <MarketInfoBar key={symbolUpper} symbol={symbolUpper} />

      {/* Main Trading Layout */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-128px)] overflow-y-auto lg:overflow-hidden scrollbar-hide relative z-0">
        {/* Center - Chart & Order Book */}
        <div className="flex-1 flex flex-col p-2 lg:p-3 min-w-0 overflow-hidden">
          {/* Top Row - Chart and Order Book side by side */}
          <div className="flex flex-col lg:flex-row flex-1 mb-2 lg:mb-3 gap-2 lg:gap-3 min-h-0">
            {/* Chart */}
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              <ChartErrorBoundary>
                <PriceChart key={symbolUpper} symbol={symbolUpper} />
              </ChartErrorBoundary>
            </div>

            {/* Order Book & Recent Trades Tabs */}
            <div className="w-full lg:w-80 h-[500px] lg:h-auto bg-gray-950 border border-gray-800 rounded-lg flex flex-col">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setRightTab('orderbook')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-semibold transition-colors',
                    rightTab === 'orderbook'
                      ? 'bg-gray-800 text-white border-b-2 border-teal-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  Order Book
                </button>
                <button
                  onClick={() => setRightTab('trades')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-semibold transition-colors',
                    rightTab === 'trades'
                      ? 'bg-gray-800 text-white border-b-2 border-teal-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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

          {/* Bottom Panel - Positions, Orders, History */}
          <div className="min-h-[300px] lg:h-52 bg-gray-950 border border-gray-800 rounded-lg">
            <div className="flex space-x-1 px-3 pt-2 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('positions')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                  activeTab === 'positions'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                Positions
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                  activeTab === 'orders'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                Open Orders
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                  activeTab === 'history'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-t transition-colors',
                  activeTab === 'trades'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                Trade History
              </button>
            </div>

            <div className="p-2 h-[calc(100%-44px)] overflow-auto">
              <DataErrorBoundary>
                {activeTab === 'positions' && <PositionsTable />}
                {activeTab === 'orders' && <OpenOrdersTable />}
                {activeTab === 'history' && <OrderHistoryTable />}
                {activeTab === 'trades' && <TradeHistoryTable />}
              </DataErrorBoundary>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trading Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-800 flex-shrink-0 flex flex-col p-2 lg:p-3">
          {/* Trading Panel */}
          <div className="flex-1">
            <TradingErrorBoundary>
              <TradingPanel key={symbolUpper} symbol={symbolUpper} currentPrice={currentPrice} />
            </TradingErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
