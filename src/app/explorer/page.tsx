'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  ExplorerSearch,
  BlocksTable,
  TransactionsTable,
  type BlockEntry,
  type TransactionEntry,
} from '@/components/explorer';
import { PaginationFooter } from '@/components/ui/pagination';

type TabType = 'blocks' | 'transactions';

// Mock data for blocks
const mockBlocks: BlockEntry[] = [
  { blockNumber: 729787914, time: '0 sec ago', transactions: 3146, proposer: '0x80f0384d7c2e9a1f56a4b9df38479522c7c049985fe419dfeaab8233aa39f2', hash: '0x7c1a...f64b' },
  { blockNumber: 729787913, time: '1 sec ago', transactions: 2891, proposer: '0x1234567890abcdef1234567890abcdef12345678', hash: '0x9d2b...a1c3' },
  { blockNumber: 729787912, time: '2 sec ago', transactions: 3256, proposer: '0xabcdef1234567890abcdef1234567890abcdefgh', hash: '0x4e7f...8b9c' },
  { blockNumber: 729787911, time: '3 sec ago', transactions: 2789, proposer: '0x9876543210fedcba9876543210fedcba98765432', hash: '0x1a2b...3c4d' },
  { blockNumber: 729787910, time: '4 sec ago', transactions: 3124, proposer: '0x5678901234abcdef5678901234abcdef56789abc', hash: '0x5e6f...7g8h' },
  { blockNumber: 729787909, time: '5 sec ago', transactions: 2956, proposer: '0xdef0123456789abcdef0123456789abcdef01234', hash: '0x9i0j...1k2l' },
  { blockNumber: 729787908, time: '6 sec ago', transactions: 3087, proposer: '0x3456789abcdef01233456789abcdef0123456789a', hash: '0x3m4n...5o6p' },
  { blockNumber: 729787907, time: '7 sec ago', transactions: 2845, proposer: '0xbcde0123456789abcbcde0123456789abcbcdef012', hash: '0x7q8r...9s0t' },
];

// Mock data for transactions
const mockTransactions: TransactionEntry[] = [
  { hash: '0x80f0384d7c2e9a1f56a4b9df38479522c7c049985fe419dfeaab8233aa39f2', action: 'Place order', block: 729787914, time: '0x80f0...384d', user: '0x7c1a...f64b' },
  { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', action: 'Cancel order', block: 729787913, time: '0x1234...5678', user: '0x9d2b...a1c3' },
  { hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', action: 'Place order', block: 729787912, time: '0xabcd...efgh', user: '0x4e7f...8b9c' },
  { hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba', action: 'BatchModify', block: 729787911, time: '0x9876...5432', user: '0x1a2b...3c4d' },
  { hash: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef', action: 'Place order', block: 729787910, time: '0x5678...9abc', user: '0x5e6f...7g8h' },
  { hash: '0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abc', action: 'Cancel order', block: 729787909, time: '0xdef0...1234', user: '0x9i0j...1k2l' },
  { hash: '0x3456789abcdef01233456789abcdef01233456789abcdef01233456789abcdef0', action: 'Place order', block: 729787908, time: '0x3456...789a', user: '0x3m4n...5o6p' },
  { hash: '0xbcde0123456789abcbcde0123456789abcbcde0123456789abcbcde0123456789', action: 'BatchModify', block: 729787907, time: '0xbcde...f012', user: '0x7q8r...9s0t' },
];

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('blocks');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  // Set page title
  useEffect(() => {
    document.title = 'Explorer | IOBIT';
  }, []);

  // Filter data based on search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return mockBlocks;
    const query = searchQuery.toLowerCase();
    return mockBlocks.filter(
      (block) =>
        block.blockNumber.toString().includes(query) ||
        block.proposer.toLowerCase().includes(query) ||
        block.hash.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return mockTransactions;
    const query = searchQuery.toLowerCase();
    return mockTransactions.filter(
      (tx) =>
        tx.hash.toLowerCase().includes(query) ||
        tx.block.toString().includes(query) ||
        tx.user.toLowerCase().includes(query) ||
        tx.action.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const currentData = activeTab === 'blocks' ? filteredBlocks : filteredTransactions;

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return currentData.slice(startIdx, startIdx + rowsPerPage);
  }, [currentData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(currentData.length / rowsPerPage);

  // Reset to page 1 when search or tab changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0a0a0c] text-white page-enter min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="px-3 md:px-6 lg:px-8 py-6 md:py-10">
          <h1 className="text-[30px] sm:text-4xl lg:text-[60px] font-normal text-white">
            Explorer
          </h1>
        </div>
      </div>

      {/* Tabs and Search Section */}
      <div className="flex items-center justify-between border-b border-[#1a1a1f] px-3 md:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => handleTabChange('blocks')}
            className={cn(
              'relative py-3 md:py-4 text-sm md:text-base font-medium transition-colors',
              activeTab === 'blocks' ? 'text-white' : 'text-[#56565B] hover:text-white'
            )}
          >
            Latest Blocks
            {activeTab === 'blocks' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#16DE93] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('transactions')}
            className={cn(
              'relative py-3 md:py-4 text-sm md:text-base font-medium transition-colors',
              activeTab === 'transactions' ? 'text-white' : 'text-[#56565B] hover:text-white'
            )}
          >
            Latest Transactions
            {activeTab === 'transactions' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#16DE93] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="hidden sm:block border-l border-r border-[#1a1a1f] px-2 md:px-4">
          <ExplorerSearch
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-[300px] md:w-[400px] lg:w-[500px]"
          />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-3 py-3 border-b border-[#1a1a1f]">
        <ExplorerSearch
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden flex-1">
        {activeTab === 'blocks' ? (
          <BlocksTable
            data={paginatedData as BlockEntry[]}
            isLoading={false}
            error={null}
            emptyMessage={
              searchQuery
                ? 'No blocks found matching your search'
                : 'No blocks available'
            }
          />
        ) : (
          <TransactionsTable
            data={paginatedData as TransactionEntry[]}
            isLoading={false}
            error={null}
            emptyMessage={
              searchQuery
                ? 'No transactions found matching your search'
                : 'No transactions available'
            }
          />
        )}
      </div>

      {/* Pagination Section */}
      {currentData.length > 0 && (
        <div className="w-full border-t border-[#1a1a1f]">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={currentData.length}
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
