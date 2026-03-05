'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export function TransfersPage() {
  const [chainFilter, setChainFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data - in real app would come from hook
  const transfers: Array<{
    time: number;
    type: 'deposit' | 'withdrawal';
    status: 'completed' | 'pending';
    amount: number;
    coin: string;
    fee: number;
    chain: string;
    counterparty: string;
    txId: string;
  }> = [];

  return (
    <div className="flex-1 bg-[#0a0a0c] min-h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-[#1a1a1f]">
        {/* Title */}
        <h2 className="text-white text-base sm:text-lg font-medium px-3 sm:px-4 lg:px-6 py-2 lg:py-0 border-b lg:border-b-0 border-[#1a1a1f]">My Transfers</h2>

        {/* Filters with horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center lg:border-l lg:border-[#1a1a1f] lg:pl-4 px-2 lg:px-6 min-w-max">
            {/* Chain Dropdown */}
            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f]"
            >
              <option value="all">Chain</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="ethereum">Ethereum</option>
              <option value="optimism">Optimism</option>
            </select>

            {/* Transfer Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f]"
            >
              <option value="all">Type</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>

            {/* Date Dropdown */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0a0a0c] text-white text-xs sm:text-sm px-2 sm:px-4 py-2 lg:py-3 focus:outline-none cursor-pointer border-r border-[#1a1a1f] lg:border-r-0"
            >
              <option value="all">Date</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table Header */}
      <div className="border-b border-[#1a1a1f] hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[#56565B] text-[10px] sm:text-xs">
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Transaction Time</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Transfer Type</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Status</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Amount</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Coin</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Fee</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Chain</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Counterparty Account</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Transaction ID</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* Mobile Table Header - Simplified with scroll */}
      <div className="border-b border-[#1a1a1f] sm:hidden overflow-x-auto scrollbar-hide">
        <div className="flex text-[#56565B] text-[10px] px-3 py-2 min-w-max">
          <span className="w-16">Type</span>
          <span className="w-16 text-center">Status</span>
          <span className="w-20 text-center">Amount</span>
          <span className="w-16 text-right">Chain</span>
        </div>
      </div>

      {/* Content */}
      <div>
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <Image
              src="/iobit/landingpage/nofound.svg"
              alt="No transfers"
              width={48}
              height={48}
              className="mb-3 opacity-50 sm:w-16 sm:h-16 sm:mb-4"
            />
            <h3 className="text-white text-sm sm:text-base mb-1 sm:mb-2 text-center">No transfers found</h3>
            <p className="text-[#56565B] text-xs sm:text-sm text-center">Your deposit and withdrawal history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-max text-xs sm:text-sm">
              <tbody>
                {transfers.map((item, index) => (
                  <tr key={index} className="border-b border-[#1a1a1f]">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white whitespace-nowrap">
                      {new Date(item.time).toLocaleString()}
                    </td>
                    <td className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3 capitalize',
                      item.type === 'deposit' ? 'text-[#16DE93]' : 'text-[#F6465D]'
                    )}>
                      {item.type}
                    </td>
                    <td className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3 capitalize',
                      item.status === 'completed' ? 'text-[#16DE93]' : 'text-[#F6465D]'
                    )}>
                      {item.status}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      {item.amount.toFixed(4)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">{item.coin}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      {item.fee.toFixed(4)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">{item.chain}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white whitespace-nowrap">
                      {item.counterparty.slice(0, 6)}...{item.counterparty.slice(-4)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">
                      <a href="#" className="text-[#16DE93] hover:underline">
                        {item.txId.slice(0, 8)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
