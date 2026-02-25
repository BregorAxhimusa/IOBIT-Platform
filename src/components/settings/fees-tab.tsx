'use client';

import { formatUSD, formatCompactNumber } from '@/lib/utils/format';
import type { UserFees } from '@/lib/hyperliquid/types';

interface FeesTabProps {
  userFees: UserFees | null;
  isLoading: boolean;
}

export function FeesTab({ userFees, isLoading }: FeesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-800/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!userFees) {
    return <p className="text-gray-500 text-sm py-8 text-center">Connect wallet to view fee information</p>;
  }

  const volume14d = (userFees.dailyUserVlm ?? [])
    .slice(-14)
    .reduce((sum, entry) => {
      // Handle both tuple [date, vlm] and object { date, vlm } formats
      const vlm = Array.isArray(entry) ? entry[1] : (entry as Record<string, string>)?.vlm ?? '0';
      return sum + parseFloat(vlm || '0');
    }, 0);

  const makerRate = parseFloat(userFees.userAddRate || '0') * 100;
  const takerRate = parseFloat(userFees.userCrossRate || '0') * 100;
  const referralDiscount = parseFloat(userFees.activeReferralDiscount || '0') * 100;

  const tiers = userFees.feeSchedule?.tiers ?? [];

  // Determine current tier
  let currentTier = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (volume14d >= parseFloat(tiers[i].ntlCutoff)) {
      currentTier = i + 1;
      break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Fee Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2028] rounded-lg p-3">
          <p className="text-gray-400 text-[10px] mb-1">Current Tier</p>
          <p className="text-white font-normal">VIP {currentTier}</p>
        </div>
        <div className="bg-[#1a2028] rounded-lg p-3">
          <p className="text-gray-400 text-[10px] mb-1">14-Day Volume</p>
          <p className="text-white font-normal">{formatUSD(volume14d)}</p>
        </div>
        <div className="bg-[#1a2028] rounded-lg p-3">
          <p className="text-gray-400 text-[10px] mb-1">Maker / Taker</p>
          <p className="text-white font-normal">{makerRate.toFixed(3)}% / {takerRate.toFixed(3)}%</p>
        </div>
        <div className="bg-[#1a2028] rounded-lg p-3">
          <p className="text-gray-400 text-[10px] mb-1">Referral Discount</p>
          <p className="text-teal-400 font-normal">{referralDiscount > 0 ? `${referralDiscount}%` : 'None'}</p>
        </div>
      </div>

      {/* VIP Tiers Table */}
      {tiers.length > 0 && (
        <div>
          <h4 className="text-white font-normal text-sm mb-3">VIP Fee Tiers</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-800">
                  <th className="text-left py-2 font-normal">Tier</th>
                  <th className="text-right py-2 font-normal">14d Volume</th>
                  <th className="text-right py-2 font-normal">Maker</th>
                  <th className="text-right py-2 font-normal">Taker</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => {
                  const isCurrentTier = i + 1 === currentTier || (i === 0 && currentTier === 0);
                  return (
                    <tr key={i} className={`border-b border-gray-800/50 ${isCurrentTier ? 'bg-teal-500/5' : ''}`}>
                      <td className="py-2 text-white text-xs">
                        VIP {i}{isCurrentTier && <span className="ml-2 text-teal-400 text-[10px]">(You)</span>}
                      </td>
                      <td className="py-2 text-right text-gray-300 text-xs">
                        {i === 0 ? `< $${formatCompactNumber(tiers[1]?.ntlCutoff ?? '0')}` : `$${formatCompactNumber(tier.ntlCutoff)}+`}
                      </td>
                      <td className="py-2 text-right text-white text-xs">{(parseFloat(tier.maker) * 100).toFixed(3)}%</td>
                      <td className="py-2 text-right text-white text-xs">{(parseFloat(tier.taker) * 100).toFixed(3)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
