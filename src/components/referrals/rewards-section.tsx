'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatUSD } from '@/lib/utils/format';
import type { ReferralInfo } from '@/lib/hyperliquid/types';

interface RewardsSectionProps {
  referralInfo: ReferralInfo | null;
  onClaim: () => Promise<{ success: boolean }>;
  isClaiming: boolean;
}

interface RewardCardProps {
  label: string;
  value: string;
  description?: string;
  accent?: boolean;
}

function RewardCard({ label, value, description, accent = false }: RewardCardProps) {
  return (
    <div className={cn(
      'bg-[#1a2028]  p-4',
      accent && 'border border-teal-500/20'
    )}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={cn(
        'text-lg font-semibold',
        accent ? 'text-teal-400' : 'text-white'
      )}>
        {value}
      </p>
      {description && (
        <p className="text-gray-500 text-xs mt-1">{description}</p>
      )}
    </div>
  );
}

export function RewardsSection({
  referralInfo,
  onClaim,
  isClaiming,
}: RewardsSectionProps) {
  const unclaimedRewards = referralInfo?.unclaimedRewards ?? '0';
  const claimedRewards = referralInfo?.claimedRewards ?? '0';
  const builderRewards = referralInfo?.builderRewards ?? '0';
  const canClaim = parseFloat(unclaimedRewards) >= 1;

  const handleClaim = useCallback(async () => {
    if (!canClaim || isClaiming) return;
    await onClaim();
  }, [canClaim, isClaiming, onClaim]);

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        Rewards
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <RewardCard
          label="Unclaimed Rewards"
          value={formatUSD(unclaimedRewards)}
          accent
        />
        <RewardCard
          label="Claimed Rewards"
          value={formatUSD(claimedRewards)}
        />
        <RewardCard
          label="Builder Rewards"
          value={formatUSD(builderRewards)}
        />
      </div>

      <div className="flex items-center justify-between bg-[#1a2028]  p-3">
        <div>
          <p className="text-gray-400 text-xs">
            {canClaim
              ? `You have ${formatUSD(unclaimedRewards)} available to claim.`
              : 'Minimum $1.00 to claim. Rewards go to your spot balance.'}
          </p>
        </div>
        <button
          onClick={handleClaim}
          disabled={!canClaim || isClaiming}
          className={cn(
            'px-5 py-2  text-sm font-medium transition-all shrink-0 ml-3',
            canClaim && !isClaiming
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          )}
        >
          {isClaiming ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Claiming...
            </span>
          ) : (
            'Claim Rewards'
          )}
        </button>
      </div>

      {!canClaim && parseFloat(unclaimedRewards) > 0 && (
        <p className="text-gray-500 text-xs mt-3">
          You have {formatUSD(unclaimedRewards)} in unclaimed rewards, but the minimum claim amount is $1.00.
          Continue referring users to accumulate more rewards.
        </p>
      )}
    </div>
  );
}
