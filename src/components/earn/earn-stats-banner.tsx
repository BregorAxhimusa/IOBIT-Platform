'use client';

import { useAppKitAccount } from '@reown/appkit/react';

function StatCard({
  label,
  labelAction,
  value,
  badge,
}: {
  label: string;
  labelAction?: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="px-3 md:px-4 py-4 md:py-8">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[#6b6b6b] text-[10px] md:text-xs">{label}</span>
        {labelAction && (
          <button className="text-[#16DE93] text-[10px] md:text-xs hover:underline">
            {labelAction}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white text-xs md:text-sm truncate">{value}</span>
        {badge}
      </div>
    </div>
  );
}

export function EarnStatsBanner() {
  const { isConnected } = useAppKitAccount();

  return (
    <div className="w-full border-b border-[#1a1a1f] bg-[#0a0a0c] overflow-x-auto scrollbar-hide">
      <div className="grid grid-cols-3 md:grid-cols-6 min-w-[600px] md:min-w-0">
        {/* VIP Level */}
        <StatCard
          label="VIP Level"
          value="Non VIP"
          badge={
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1f] text-[#6b6b6b] border border-[#2a2a2f]">
              VIP
            </span>
          }
        />

        {/* Referral Link */}
        <StatCard
          label="Referral Link"
          labelAction="Customize"
          value={isConnected ? 'iobit.io/ref/...' : 'Connect Wallet'}
        />

        {/* Rebate Rewards */}
        <StatCard
          label="Rebate Rewards"
          labelAction="History"
          value={isConnected ? '0.00 USDT' : '0.00 USDT'}
        />

        {/* Pending Claim */}
        <StatCard
          label="Pending Claim"
          labelAction="Details"
          value={isConnected ? '0.00 USDT' : '0.00 USDT'}
        />

        {/* Unallocated Interest */}
        <StatCard
          label="Unallocated Interest"
          value={isConnected ? '0.00 USDT' : '0.00 USDT'}
        />

        {/* My Interest */}
        <StatCard
          label="My Interest"
          value={isConnected ? '0.00 USDT' : 'Not Connected'}
        />
      </div>
    </div>
  );
}
