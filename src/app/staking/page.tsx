'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useValidators } from '@/hooks/use-validators';
import { useStakingState } from '@/hooks/use-staking-state';
import { useStakingDelegate } from '@/hooks/use-staking-delegate';
import { useStakingTransfer } from '@/hooks/use-staking-transfer';
import { useStakingRewards } from '@/hooks/use-staking-rewards';
import { StakingStats } from '@/components/staking/staking-stats';
import { StakingBalance } from '@/components/staking/staking-balance';
import { MyDelegations } from '@/components/staking/my-delegations';
import { ValidatorsTable } from '@/components/staking/validators-table';
import { DelegateModal } from '@/components/staking/delegate-modal';
import { StakingHistory } from '@/components/staking/staking-history';
import type { ValidatorSummary } from '@/lib/hyperliquid/types';

export default function StakingPage() {
  const { isConnected } = useAccount();
  const { validators, isLoading: isLoadingValidators } = useValidators();
  const { stakingState, delegations, isLoading: isLoadingState } = useStakingState();
  const { delegate, undelegate, isDelegating } = useStakingDelegate();
  const { depositToStaking, withdrawFromStaking, isTransferring } = useStakingTransfer();
  const { rewards, history, totalRewards, isLoading: isLoadingRewards } = useStakingRewards();

  const [selectedValidator, setSelectedValidator] = useState<ValidatorSummary | null>(null);

  // TODO: Get actual HYPE spot balance from spotClearinghouseState
  const spotHypeBalance = '0';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm">Please connect your wallet to access staking</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">HYPE Staking</h1>
          <p className="text-gray-400 text-sm mt-1">
            Delegate HYPE to validators and earn staking rewards (~2-3% APY, auto-compounded daily)
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StakingStats
            stakingState={stakingState}
            totalRewards={totalRewards}
            isLoading={isLoadingState}
          />
        </div>

        {/* Balance + Delegations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StakingBalance
            stakingState={stakingState}
            spotHypeBalance={spotHypeBalance}
            onDeposit={depositToStaking}
            onWithdraw={withdrawFromStaking}
            isTransferring={isTransferring}
          />
          <MyDelegations
            delegations={delegations}
            validators={validators}
            onUndelegate={undelegate}
            isDelegating={isDelegating}
          />
        </div>

        {/* Validators */}
        <div className="mb-6">
          <ValidatorsTable
            validators={validators}
            isLoading={isLoadingValidators}
            onStake={setSelectedValidator}
          />
        </div>

        {/* Rewards + History */}
        <div className="mb-6">
          <StakingHistory
            rewards={rewards}
            history={history}
            validators={validators}
            isLoading={isLoadingRewards}
          />
        </div>

        {/* How Staking Works */}
        <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-semibold text-sm mb-4">How Staking Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', text: 'Transfer HYPE from Spot to Staking (instant)' },
              { step: '2', text: 'Choose a validator and delegate your HYPE' },
              { step: '3', text: 'Rewards auto-compound daily (~2-3% APY)' },
              { step: '4', text: 'Undelegate anytime (1-day lockup period)' },
              { step: '5', text: 'Withdraw to Spot (7-day queue, max 5 pending)' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <p className="text-gray-400 text-xs">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-[10px] mt-3">
            Note: Jailed validators do not produce rewards. Rewards are auto-redelegated and do not require manual claiming.
          </p>
        </div>
      </div>

      {/* Delegate Modal */}
      <DelegateModal
        isOpen={!!selectedValidator}
        onClose={() => setSelectedValidator(null)}
        validator={selectedValidator}
        availableBalance={stakingState?.undelegated ?? '0'}
        onDelegate={delegate}
        isDelegating={isDelegating}
      />
    </div>
  );
}
