'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useReferralInfo } from '@/hooks/use-referral-info';
import { useCreateReferralCode } from '@/hooks/use-create-referral-code';
import { useSetReferrer } from '@/hooks/use-set-referrer';
import { useClaimReferralRewards } from '@/hooks/use-claim-referral-rewards';
import { ReferralStats } from '@/components/referrals/referral-stats';
import { ReferralCodeSection } from '@/components/referrals/referral-code-section';
import { ReferredBySection } from '@/components/referrals/referred-by-section';
import { ReferredUsersTable } from '@/components/referrals/referred-users-table';
import { RewardsSection } from '@/components/referrals/rewards-section';

export default function ReferralsPage() {
  const { isConnected } = useAppKitAccount();
  const { referralInfo, isLoading } = useReferralInfo();
  const { createCode, isCreating } = useCreateReferralCode();
  const { setReferrer, isSetting } = useSetReferrer();
  const { claimRewards, isClaiming } = useClaimReferralRewards();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16 text-gray-500">
            Please connect your wallet to view referrals
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white page-enter">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-normal text-white">Referral Program</h1>
          <p className="text-gray-400 text-sm mt-1">
            Earn 10% of referred users&apos; fees. Referred users get 4% fee discount.
          </p>
        </div>

        {/* Stats Cards */}
        <ReferralStats referralInfo={referralInfo} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Your Referral Code */}
          <ReferralCodeSection
            referralInfo={referralInfo}
            onCreateCode={createCode}
            isCreating={isCreating}
          />

          {/* Referred By */}
          <ReferredBySection
            referralInfo={referralInfo}
            onSetReferrer={setReferrer}
            isSetting={isSetting}
          />
        </div>

        {/* Rewards Section */}
        <div className="mt-4">
          <RewardsSection
            referralInfo={referralInfo}
            onClaim={claimRewards}
            isClaiming={isClaiming}
          />
        </div>

        {/* Referred Users Table */}
        <div className="mt-4">
          <ReferredUsersTable
            referralStates={referralInfo?.referrerState?.data?.referralStates ?? []}
          />
        </div>

        {/* How It Works */}
        <div className="mt-4 bg-[#0f1419] border border-gray-800 p-5">
          <h3 className="text-white font-normal mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { step: '1', title: 'Create Code', desc: 'Need $10K+ volume' },
              { step: '2', title: 'Share Link', desc: 'Send to friends' },
              { step: '3', title: 'They Trade', desc: 'On Hyperliquid' },
              { step: '4', title: 'Earn 10%', desc: 'Of their fees' },
              { step: '5', title: 'Claim', desc: 'Min $1, to spot' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#1a2028] p-3 text-center"
              >
                <div className="w-7 h-7 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-xs font-normal mx-auto mb-2">
                  {item.step}
                </div>
                <p className="text-white text-sm font-normal">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-[#1a2028] p-3">
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="text-amber-400 font-normal">Note:</span> Referral rewards are valid up to $1B volume per referred user.
              Fee discounts are valid up to $25M volume per referred user.
              Vaults and sub-accounts do not benefit from referral discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
