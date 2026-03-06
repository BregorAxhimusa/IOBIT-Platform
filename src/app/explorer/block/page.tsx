'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { TransactionsTable, type TransactionEntry } from '@/components/explorer';
import { PaginationFooter } from '@/components/ui/pagination';
import { useState, useMemo } from 'react';

// Mock block data
const mockBlockData = {
  blockNumber: 729787914,
  time: '9/14/2025 - 19:38:34',
  hash: '0x72b05c49cf872d2a1f56a4b9df38479522c7c049985fe419dfeaab8233aa39f2',
  proposer: '0x5795ab6e71ecbefa255fc4728cc34893ba992d44',
  transactions: [
    { hash: '0x48a52618abc123def456789012345678901234567890abcdef1234567890abcd', action: 'Noop', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618def456789012345678901234567890abcdef1234567890abcdef1234', action: 'Place order', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618789012345678901234567890abcdef1234567890abcdef1234567890', action: 'BatchModify', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618012345678901234567890abcdef1234567890abcdef1234567890abcd', action: 'Noop', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618345678901234567890abcdef1234567890abcdef1234567890abcdef1', action: 'Place order', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618678901234567890abcdef1234567890abcdef1234567890abcdef1234', action: 'BatchModify', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618901234567890abcdef1234567890abcdef1234567890abcdef1234567', action: 'Noop', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618234567890abcdef1234567890abcdef1234567890abcdef1234567890', action: 'Place order', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618567890abcdef1234567890abcdef1234567890abcdef1234567890abc', action: 'BatchModify', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
    { hash: '0x48a52618890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', action: 'Place order', block: 730438435, time: '9/14/2025 - 19:10:14', user: '0x393d2109abcdef1234567890abcdef1234567890' },
  ] as TransactionEntry[],
};

function BlockDetailsContent() {
  const searchParams = useSearchParams();
  const blockNumber = searchParams.get('block') || mockBlockData.blockNumber.toString();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Set page title
  useEffect(() => {
    document.title = `Block ${blockNumber} | IOBIT`;
  }, [blockNumber]);

  // Use mock data for now
  const blockData = mockBlockData;

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return blockData.transactions.slice(startIdx, startIdx + rowsPerPage);
  }, [blockData.transactions, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(blockData.transactions.length / rowsPerPage);

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 10)}...${address.slice(-8)}`;
    }
    return address;
  };

  return (
    <div className="bg-[#0a0a0c] text-white page-enter min-h-screen flex flex-col">
      {/* Breadcrumb Header */}
      <div className="w-full px-3 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Link href="/explorer" className="text-[#16DE93] hover:underline">EXPLORER</Link>
          <span className="text-[#56565B]">/</span>
          <span className="text-[#16DE93]">BLOCK DETAILS</span>
        </div>
      </div>

      {/* Block Info Header */}
      <div className="w-full border-b border-[#1a1a1f] px-3 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-normal text-white">
            Block {blockNumber}
          </h1>

          {/* Block Details */}
          <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-3 text-xs md:text-sm">
            <div>
              <span className="text-[#8A8A8E]">Time</span>
              <p className="text-white mt-1">{blockData.time}</p>
            </div>
            <div className="max-w-[200px] md:max-w-none">
              <span className="text-[#8A8A8E]">Hash</span>
              <p className="text-white mt-1 truncate" title={blockData.hash}>
                {formatAddress(blockData.hash)}
              </p>
            </div>
            <div className="max-w-[200px] md:max-w-none">
              <span className="text-[#8A8A8E]">Proposer</span>
              <p className="text-white mt-1 truncate" title={blockData.proposer}>
                {formatAddress(blockData.proposer)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block Number Label */}
      <div className="px-3 md:px-6 lg:px-8 border-b border-[#1a1a1f] flex items-center justify-between">
        <span className="text-white text-sm md:text-base font-medium">{blockNumber}</span>
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

      {/* Transactions Table */}
      <div className="w-full overflow-hidden flex-1">
        <TransactionsTable
          data={paginatedTransactions}
          isLoading={false}
          error={null}
          emptyMessage="No transactions in this block"
          showBlockColumn={true}
        />
      </div>

      {/* Pagination */}
      {blockData.transactions.length > 0 && (
        <div className="w-full border-t border-[#1a1a1f]">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={blockData.transactions.length}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowOptions={[10, 20, 50]}
            className="px-3 md:px-6 lg:px-8"
          />
        </div>
      )}
    </div>
  );
}

export default function BlockDetailsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#0a0a0c] text-white min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <BlockDetailsContent />
    </Suspense>
  );
}
