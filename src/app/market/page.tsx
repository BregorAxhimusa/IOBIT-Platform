'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { useSpotMeta } from '@/hooks/use-spot-meta';
import { useMarketPageData } from '@/hooks/use-market-page-data';
import { StatsBanner } from '@/components/market/stats-banner';
import { MarketTable, type MarketTab } from '@/components/market/market-table';
import type { CoinCategory } from '@/lib/utils/coin-categories';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>('cryptos');
  const [activeCategory, setActiveCategory] = useState<CoinCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Initialize data (populates stores)
  useMarketData();
  useSpotMeta();

  const { globalStats, isLoading } = useMarketPageData();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <div className="w-full">
        {/* Stats Banner */}
        <StatsBanner stats={globalStats} isLoading={isLoading} />

        {/* Market Table */}
        <MarketTable
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => { setActiveCategory(cat); setCurrentPage(1); }}
          searchTerm={searchTerm}
          onSearchChange={(s) => { setSearchTerm(s); setCurrentPage(1); }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
