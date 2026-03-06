'use client';

import { useState, useEffect } from 'react';
import { BitHeader } from '@/components/bit/bit-header';
import { BitOverview } from '@/components/bit/bit-overview';
import { BitRanking } from '@/components/bit/bit-ranking';
import { BitActionCards } from '@/components/bit/bit-action-cards';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils/cn';

type BitTab = 'overview' | 'ranking';

const TABS: { key: BitTab; label: string }[] = [
  { key: 'overview', label: "BIT's Overview" },
  { key: 'ranking', label: "BIT's Ranking" },
];

export default function BitPage() {
  const [activeTab, setActiveTab] = useState<BitTab>('overview');

  // Set page title
  useEffect(() => {
    document.title = 'BIT Token | IOBIT';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white page-enter">
      {/* Hero Section */}
      <BitHeader />

      {/* Tabs Navigation */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="flex items-center justify-center gap-6 md:gap-16">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'text-base md:text-2xl lg:text-3xl font-medium transition-all duration-200 py-4 md:py-8 border-b-2',
                activeTab === tab.key
                  ? 'text-white border-[#16DE93]'
                  : 'text-[#6b6b6b] border-transparent hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'overview' && <BitOverview />}
        {activeTab === 'ranking' && <BitRanking />}
      </div>

      {/* Action Cards */}
      <BitActionCards />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
