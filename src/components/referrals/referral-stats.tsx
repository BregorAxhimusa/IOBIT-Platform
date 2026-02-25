'use client';

import { formatUSD, formatCompactNumber } from '@/lib/utils/format';
import type { ReferralInfo } from '@/lib/hyperliquid/types';

interface ReferralStatsProps {
  referralInfo: ReferralInfo | null;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-teal-500">{icon}</div>
        <p className="text-gray-400 text-xs">{label}</p>
      </div>
      <p className="text-white text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-4 bg-gray-700 rounded" />
        <div className="h-3 bg-gray-700 rounded w-24" />
      </div>
      <div className="h-6 bg-gray-700 rounded w-20 mt-1" />
    </div>
  );
}

export function ReferralStats({ referralInfo, isLoading }: ReferralStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const totalVolume = referralInfo?.cumVlm ?? '0';
  const unclaimedRewards = referralInfo?.unclaimedRewards ?? '0';
  const claimedRewards = referralInfo?.claimedRewards ?? '0';
  const totalReferrals = referralInfo?.referrerState?.data?.referralStates?.length ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Volume"
        value={`$${formatCompactNumber(totalVolume)}`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        }
      />
      <StatCard
        label="Unclaimed Rewards"
        value={formatUSD(unclaimedRewards)}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        }
      />
      <StatCard
        label="Claimed Rewards"
        value={formatUSD(claimedRewards)}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
      />
      <StatCard
        label="Total Referrals"
        value={totalReferrals.toLocaleString()}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        }
      />
    </div>
  );
}
