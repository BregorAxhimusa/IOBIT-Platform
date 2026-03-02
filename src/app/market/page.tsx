'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { useSpotMeta } from '@/hooks/use-spot-meta';
import { useMarketPageData } from '@/hooks/use-market-page-data';
import { StatsBanner } from '@/components/market/stats-banner';
import { InfoPanels } from '@/components/market/info-panels';
import { MarketTable, type MarketTab } from '@/components/market/market-table';
import type { CoinCategory } from '@/lib/utils/coin-categories';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>('cryptos');
  const [activeCategory, setActiveCategory] = useState<CoinCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Initialize data (populates stores)
  useMarketData();
  useSpotMeta();

  const { globalStats, topEarners, biggestMovers, isLoading } = useMarketPageData();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white page-enter">
      <div className="w-full px-6 py-6">
        <StatsBanner stats={globalStats} isLoading={isLoading} />

        <InfoPanels
          topEarners={topEarners}
          biggestMovers={biggestMovers}
          isLoading={isLoading}
        />

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
