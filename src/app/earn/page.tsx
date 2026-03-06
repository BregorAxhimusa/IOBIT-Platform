'use client';

import { useState, useEffect } from 'react';
import { SplineEarnHeader } from '@/components/earn/spline-earn-header';
import { EarnStatsBanner } from '@/components/earn/earn-stats-banner';
import { RebateEarnings } from '@/components/earn/rebate-earnings';
import { VaultRewards } from '@/components/earn/vault-rewards';
import { EarnFaq } from '@/components/earn/earn-faq';
import { ReferralInvitation } from '@/components/earn/referral-invitation';
import { SiteFooter } from '@/components/layout/site-footer';
import { cn } from '@/lib/utils/cn';

type EarnTab = 'rebate' | 'vault';

const TABS: { key: EarnTab; label: string }[] = [
  { key: 'rebate', label: 'Rebate Earnings' },
  { key: 'vault', label: 'Vault Rewards' },
];

export default function EarnPage() {
  const [activeTab, setActiveTab] = useState<EarnTab>('rebate');

  // Set page title
  useEffect(() => {
    document.title = 'Earn | IOBIT';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Hero Section with Spline 3D */}
      <SplineEarnHeader />

      {/* Dashboard Stats Banner */}
      <EarnStatsBanner />

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
        {activeTab === 'rebate' && <RebateEarnings />}
        {activeTab === 'vault' && <VaultRewards />}
      </div>

      {/* Referral Invitation Section */}
      <ReferralInvitation />

      {/* FAQ Section */}
      <EarnFaq />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
