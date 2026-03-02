'use client';

import { formatCompactNumber } from '@/lib/utils/format';
import type { GlobalStats } from '@/hooks/use-market-page-data';

interface StatsBannerProps {
  stats: GlobalStats;
  isLoading: boolean;
}

function StatCard({ label, value, badge, isLoading }: { label: string; value: string; badge?: string; isLoading: boolean }) {
  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-400 text-xs">{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/20 text-teal-400 border border-teal-500/30">
            {badge}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-7 bg-gray-800/50 animate-pulse w-2/3" />
      ) : (
        <p className="text-white text-lg font-normal">{value}</p>
      )}
    </div>
  );
}

export function StatsBanner({ stats, isLoading }: StatsBannerProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Trading Volume"
        badge="24h"
        value={`$${formatCompactNumber(stats.volume24h)}`}
        isLoading={isLoading}
      />
      <StatCard
        label="Earned by Stakers"
        badge="24h"
        value="$0"
        isLoading={isLoading}
      />
      <StatCard
        label="Open Interest"
        badge="Current"
        value={`$${formatCompactNumber(stats.openInterest)}`}
        isLoading={isLoading}
      />
      <StatCard
        label="All Time Volume"
        value="$0"
        isLoading={isLoading}
      />
    </div>
  );
}
