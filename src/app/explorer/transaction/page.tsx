'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// Mock transaction data
const mockTransactionData = {
  hash: '0x95ecf5b366e2a1cd9766042b89ddff01ac010b9901e5c09f39b5a10625e67bb8',
  block: 730455551,
  time: '9/14/2025 - 19:32:53',
  user: '0x0b1ace05eb9ef1c3a1951b763700ecad24f27741',
  action: 'Short BTC',
  limitPrice: '115,590',
  size: '0.09000 BTC',
};

function TransactionDetailsContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash') || mockTransactionData.hash;

  // Use mock data for now
  const txData = mockTransactionData;

  const displayHash = hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-4)}` : hash;

  return (
    <div className="bg-[#0a0a0c] text-white page-enter min-h-screen flex flex-col">
      {/* Breadcrumb Header */}
      <div className="w-full px-3 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Link href="/explorer" className="text-[#16DE93] hover:underline">EXPLORER</Link>
          <span className="text-[#56565B]">/</span>
          <span className="text-[#16DE93]">TRANSACTION DETAILS</span>
        </div>
      </div>

      {/* Transaction Title */}
      <div className="w-full border-b border-[#1a1a1f] px-3 md:px-6 lg:px-8 py-4 md:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-normal text-white">
          Hash {displayHash}
        </h1>
      </div>

      {/* Back to Explorer Row */}
      <div className="px-3 md:px-6 lg:px-8 border-b border-[#1a1a1f] flex items-center justify-end">
        <div className="border-l border-r border-[#1a1a1f] px-2 md:px-4 py-3">
          <Link
            href="/explorer"
            className="text-white text-xs md:text-sm hover:text-[#16DE93] transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back to Explorer</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="w-full flex-1">
        <div className="px-3 md:px-6 lg:px-8 py-4 border-b border-[#1a1a1f]">
          <h2 className="text-white text-base md:text-lg font-medium">Overview</h2>
        </div>

        {/* Hash */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Hash</span>
          <span className="text-white text-sm font-mono break-all">{txData.hash}</span>
        </div>

        {/* Block */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Block</span>
          <Link
            href={`/explorer/block?block=${txData.block}`}
            className="text-[#16DE93] text-sm hover:underline"
          >
            {txData.block}
          </Link>
        </div>

        {/* Time */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Time</span>
          <span className="text-white text-sm">{txData.time}</span>
        </div>

        {/* User */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">User</span>
          <Link
            href={`/leaderboard/address?address=${txData.user}`}
            className="text-[#16DE93] text-sm font-mono hover:underline break-all"
          >
            {txData.user}
          </Link>
        </div>

        {/* Action */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Action</span>
          <span className="text-white text-sm font-medium">{txData.action}</span>
        </div>

        {/* Limit Price */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Limit price</span>
          <span className="text-white text-sm">{txData.limitPrice}</span>
        </div>

        {/* Size */}
        <div className="px-3 md:px-6 lg:px-8 py-3 border-b border-[#1a1a1f] flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
          <span className="text-[#8A8A8E] text-sm w-32 flex-shrink-0">Size</span>
          <span className="text-white text-sm">{txData.size}</span>
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#0a0a0c] text-white min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <TransactionDetailsContent />
    </Suspense>
  );
}
