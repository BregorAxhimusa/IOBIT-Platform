'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export function FundsPage() {
  const [contractFilter, setContractFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data - in real app would come from hook
  const fundingHistory: Array<{
    time: number;
    market: string;
    direction: 'long' | 'short';
    positionQty: number;
    fundingFee: number;
    fundingRate: number;
    oraclePrice: number;
    indexPrice: number;
  }> = [];

  const totalFundingCost = fundingHistory.reduce((sum, f) => sum + f.fundingFee, 0);

  return (
    <div className="flex-1 bg-[#0a0a0c] min-h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-[#1a1a1f]">
        {/* Total Funding Cost */}
        <div className="flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 lg:py-0 border-b lg:border-b-0 border-[#1a1a1f]">
          <span className="text-[#8A8A8E] text-xs sm:text-sm">Total Funding Cost</span>
          <span className="text-white text-base sm:text-lg font-medium">
            ${totalFundingCost.toFixed(2)}
          </span>
        </div>

        {/* Filters with horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center lg:border-l lg:border-[#1a1a1f] lg:pl-4 px-2 lg:px-6 min-w-max">
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
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Markets</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Direction</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Position Qty</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Funding Fee</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Funding Rate</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Oracle Price</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal whitespace-nowrap">Index Price</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* Mobile Table Header - Simplified with scroll */}
      <div className="border-b border-[#1a1a1f] sm:hidden overflow-x-auto scrollbar-hide">
        <div className="flex text-[#56565B] text-[10px] px-3 py-2 min-w-max">
          <span className="w-20">Market</span>
          <span className="w-16 text-center">Direction</span>
          <span className="w-20 text-center">Qty</span>
          <span className="w-20 text-right">Fee</span>
        </div>
      </div>

      {/* Content */}
      <div>
        {fundingHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <Image
              src="/iobit/landingpage/nofound.svg"
              alt="No funding history"
              width={48}
              height={48}
              className="mb-3 opacity-50 sm:w-16 sm:h-16 sm:mb-4"
            />
            <h3 className="text-white text-sm sm:text-base mb-1 sm:mb-2 text-center">No funding history found</h3>
            <p className="text-[#56565B] text-xs sm:text-sm text-center">Your funding fee history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-max text-xs sm:text-sm">
              <tbody>
                {fundingHistory.map((item, index) => (
                  <tr key={index} className="border-b border-[#1a1a1f]">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white whitespace-nowrap">
                      {new Date(item.time).toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">{item.market}</td>
                    <td className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3',
                      item.direction === 'long' ? 'text-[#16DE93]' : 'text-[#F6465D]'
                    )}>
                      {item.direction.toUpperCase()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      {item.positionQty.toFixed(4)}
                    </td>
                    <td className={cn(
                      'px-2 sm:px-4 py-2 sm:py-3 text-right',
                      item.fundingFee >= 0 ? 'text-[#16DE93]' : 'text-[#F6465D]'
                    )}>
                      ${item.fundingFee.toFixed(4)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      {(item.fundingRate * 100).toFixed(4)}%
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      ${item.oraclePrice.toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-white">
                      ${item.indexPrice.toLocaleString()}
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
