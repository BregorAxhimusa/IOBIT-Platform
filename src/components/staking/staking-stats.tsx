'use client';

import { formatCompactNumber } from '@/lib/utils/format';
import type { StakingState } from '@/lib/hyperliquid/types';

interface StakingStatsProps {
  stakingState: StakingState | null;
  totalRewards: number;
  isLoading: boolean;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-teal-500">{icon}</div>
        <p className="text-gray-400 text-xs">{label}</p>
      </div>
      <p className="text-white text-lg font-normal">{value}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-4 bg-gray-700 rounded" />
        <div className="h-3 bg-gray-700 rounded w-24" />
      </div>
      <div className="h-6 bg-gray-700 rounded w-20 mt-1" />
    </div>
  );
}

export function StakingStats({ stakingState, totalRewards, isLoading }: StakingStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Staked"
        value={`${formatCompactNumber(stakingState?.delegated ?? '0')} HYPE`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
      />
      <StatCard
        label="Undelegated"
        value={`${formatCompactNumber(stakingState?.undelegated ?? '0')} HYPE`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>}
      />
      <StatCard
        label="Pending Withdrawals"
        value={`${formatCompactNumber(stakingState?.totalPendingWithdrawal ?? '0')} HYPE`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clipRule="evenodd" /></svg>}
      />
      <StatCard
        label="Total Rewards"
        value={`${formatCompactNumber(totalRewards)} HYPE`}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
      />
    </div>
  );
}
