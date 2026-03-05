'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useOrdersStore } from '@/store/orders-store';
import { useTradesStore } from '@/store/trades-store';
import { cn } from '@/lib/utils/cn';

type OrderTab = 'open' | 'conditional' | 'filled' | 'history' | 'closedPnl' | 'positionHistory';

const TABS: { key: OrderTab; label: string; mobileLabel: string }[] = [
  { key: 'open', label: 'Open Orders', mobileLabel: 'Open' },
  { key: 'conditional', label: 'Conditional', mobileLabel: 'Cond.' },
  { key: 'filled', label: 'Filled', mobileLabel: 'Filled' },
  { key: 'history', label: 'Trade History', mobileLabel: 'History' },
  { key: 'closedPnl', label: 'Closed P&L', mobileLabel: 'P&L' },
  { key: 'positionHistory', label: 'Position History', mobileLabel: 'Positions' },
];

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>('open');
  const [accountFilter, setAccountFilter] = useState('main');
  const [contractFilter, setContractFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  // Orders data - will be used when implementing real data display
  const _openOrders = useOrdersStore((state) => state.openOrders);
  const _orderHistory = useOrdersStore((state) => state.orderHistory);
  const _trades = useTradesStore((state) => state.trades);

  // Suppress unused variable warnings - these will be used for actual data display
  void _openOrders;
  void _orderHistory;
  void _trades;

  const renderContent = () => {
    switch (activeTab) {
      case 'open':
        return (
          <EmptyState
            title="No open orders found"
            subtitle="Your open orders will appear here once you start trading"
          />
        );
      case 'conditional':
        return (
          <EmptyState
            title="No conditional orders found"
            subtitle="Your conditional orders will appear here"
          />
        );
      case 'filled':
        return (
          <EmptyState
            title="No filled orders found"
            subtitle="Your filled orders will appear here"
          />
        );
      case 'history':
        return (
          <EmptyState
            title="No trade history found"
            subtitle="Your trade history will appear here once you start trading"
          />
        );
      case 'closedPnl':
        return (
          <EmptyState
            title="No closed P&L found"
            subtitle="Your closed positions P&L will appear here"
          />
        );
      case 'positionHistory':
        return (
          <EmptyState
            title="No position history found"
            subtitle="Your position history will appear here"
          />
        );
      default:
        return null;
    }
  };

  // Get table headers based on active tab
  const getTableHeaders = () => {
    switch (activeTab) {
      case 'open':
      case 'conditional':
        return ['Markets', 'Price', 'Filled/Total', 'Trade Type', 'TP/SL', 'Order No.', 'Order time', 'Good Till', 'Action'];
      case 'filled':
        return ['Markets', 'Price', 'Filled', 'Trade Type', 'Order No.', 'Fill time', 'Fee', 'Realized PnL'];
      case 'history':
        return ['Markets', 'Side', 'Price', 'Size', 'Fee', 'Time', 'Realized PnL'];
      case 'closedPnl':
        return ['Markets', 'Side', 'Entry Price', 'Exit Price', 'Size', 'PnL', 'ROE%', 'Close Time'];
      case 'positionHistory':
        return ['Markets', 'Side', 'Size', 'Entry Price', 'Exit Price', 'PnL', 'Open Time', 'Close Time'];
      default:
        return [];
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0c] min-h-full">
      {/* Header with Tabs and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-[#1a1a1f]">
        {/* Tabs - Full width on mobile with horizontal scroll */}
        <div className="overflow-x-auto scrollbar-hide border-b lg:border-b-0 border-[#1a1a1f]">
          <div className="flex w-full lg:w-auto min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 lg:flex-none px-3 sm:px-4 py-2.5 lg:py-3 text-xs sm:text-sm whitespace-nowrap transition-colors relative text-center',
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-[#56565B] hover:text-white'
                )}
              >
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#16DE93]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters with horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center lg:border-l lg:border-[#1a1a1f] lg:pl-4 px-2 lg:px-6 min-w-max">
          {/* Account Dropdown - Hidden on mobile */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="hidden sm:block bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f]"
          >
            <option value="main">Main Account</option>
          </select>

          {/* Contract Dropdown */}
          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f]"
          >
            <option value="all">Contract</option>
            <option value="btc">BTC</option>
            <option value="eth">ETH</option>
            <option value="sol">SOL</option>
          </select>

          {/* Date Dropdown */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f]"
          >
            <option value="all">Date</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>

          {/* Export Button */}
          <button className="text-white text-xs sm:text-sm px-3 sm:px-6 py-2 lg:py-3 hover:text-[#16DE93] transition-colors whitespace-nowrap border-r border-[#1a1a1f] lg:border-r-0">
            Export
          </button>
          </div>
        </div>
      </div>

      {/* Table Header - Desktop only */}
      <div className="border-b border-[#1a1a1f] hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[#56565B] text-[10px] sm:text-xs">
                {getTableHeaders().map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap',
                      index === 0 ? 'text-left' : 'text-center'
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* Mobile Table Header - Simplified with scroll */}
      <div className="border-b border-[#1a1a1f] sm:hidden overflow-x-auto scrollbar-hide">
        <div className="flex text-[#56565B] text-[10px] px-3 py-2 min-w-max">
          <span className="w-24">Market</span>
          <span className="w-20 text-center">Price</span>
          <span className="w-16 text-center">Size</span>
          <span className="w-16 text-right">
            {activeTab === 'closedPnl' || activeTab === 'history' ? 'PnL' : 'Type'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  title: string;
  subtitle: string;
}

function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
      <Image
        src="/iobit/landingpage/nofound.svg"
        alt="No data"
        width={48}
        height={48}
        className="mb-3 opacity-50 sm:w-16 sm:h-16 sm:mb-4"
      />
      <h3 className="text-white text-sm sm:text-base mb-1 sm:mb-2 text-center">{title}</h3>
      <p className="text-[#56565B] text-xs sm:text-sm text-center">{subtitle}</p>
    </div>
  );
}
