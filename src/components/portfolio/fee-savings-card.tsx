'use client';

import { useUserFees } from '@/hooks/use-user-fees';
import { cn } from '@/lib/utils/cn';

const VOLUME_MILESTONES = [
  { label: 'Bronze', volume: 1_000_000, color: 'text-amber-600' },
  { label: 'Silver', volume: 10_000_000, color: 'text-gray-300' },
  { label: 'Gold', volume: 50_000_000, color: 'text-yellow-400' },
  { label: 'Platinum', volume: 250_000_000, color: 'text-cyan-300' },
  { label: 'Diamond', volume: 1_000_000_000, color: 'text-purple-400' },
];

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(0)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function FeeSavingsCard() {
  const { userFees, isLoading } = useUserFees();

  if (isLoading) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-full" />
      </div>
    );
  }

  if (!userFees) return null;

  const referralDiscount = parseFloat(userFees.activeReferralDiscount || '0');
  const makerRate = parseFloat(userFees.userAddRate || '0');
  const takerRate = parseFloat(userFees.userCrossRate || '0');

  // Calculate 14-day volume
  const totalVolume = (userFees.dailyUserVlm || []).reduce((sum, day) => {
    return sum + parseFloat(day[1] || '0');
  }, 0);

  // Find current milestone
  const currentMilestone = VOLUME_MILESTONES.filter(m => totalVolume >= m.volume).pop();
  const nextMilestone = VOLUME_MILESTONES.find(m => totalVolume < m.volume);

  const progressToNext = nextMilestone
    ? (totalVolume / nextMilestone.volume) * 100
    : 100;

  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Fee Status</h3>
        {currentMilestone && (
          <span className={cn('text-xs font-bold', currentMilestone.color)}>
            {currentMilestone.label}
          </span>
        )}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[10px] text-gray-500 uppercase">Maker</div>
          <div className="text-sm text-white font-medium">
            {(makerRate * 100).toFixed(4)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase">Taker</div>
          <div className="text-sm text-white font-medium">
            {(takerRate * 100).toFixed(4)}%
          </div>
        </div>
      </div>

      {/* Referral Discount */}
      {referralDiscount > 0 && (
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-400">Referral Discount</span>
            <span className="text-xs font-bold text-teal-300">
              {(referralDiscount * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Volume Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500">14-Day Volume</span>
          <span className="text-xs text-gray-300">{formatVolume(totalVolume)}</span>
        </div>
        {nextMilestone && (
          <>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {formatVolume(nextMilestone.volume - totalVolume)} to {nextMilestone.label}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
