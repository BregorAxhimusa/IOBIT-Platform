'use client';

import { useState } from 'react';
import { formatCompactNumber } from '@/lib/utils/format';
import type { StakingState } from '@/lib/hyperliquid/types';

interface StakingBalanceProps {
  stakingState: StakingState | null;
  spotHypeBalance: string;
  onDeposit: (amount: string) => Promise<{ success: boolean }>;
  onWithdraw: (amount: string) => Promise<{ success: boolean }>;
  isTransferring: boolean;
}

export function StakingBalance({ stakingState, spotHypeBalance, onDeposit, onWithdraw, isTransferring }: StakingBalanceProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const pendingCount = stakingState?.nPendingWithdrawals ?? 0;

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const result = await onDeposit(depositAmount);
    if (result.success) { setDepositAmount(''); setShowDeposit(false); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    const result = await onWithdraw(withdrawAmount);
    if (result.success) { setWithdrawAmount(''); setShowWithdraw(false); }
  };

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Staking Balance</h3>

      <div className="space-y-3">
        {/* Spot HYPE */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Spot HYPE Balance</p>
            <p className="text-white font-medium">{formatCompactNumber(spotHypeBalance)} HYPE</p>
          </div>
          <button
            onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }}
            className="px-3 py-1.5 text-xs font-medium bg-teal-500/10 text-teal-400  hover:bg-teal-500/20 transition-colors"
          >
            Transfer to Staking
          </button>
        </div>

        {showDeposit && (
          <div className="bg-[#1a2028]  p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 bg-[#0f1419] border border-gray-700  px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={() => setDepositAmount(spotHypeBalance)}
                className="px-2 py-2 text-xs text-teal-400 hover:text-teal-300"
              >
                MAX
              </button>
            </div>
            <button
              onClick={handleDeposit}
              disabled={isTransferring || !depositAmount || parseFloat(depositAmount) <= 0}
              className="w-full py-2  text-xs font-semibold bg-teal-500 hover:bg-teal-500/80 text-white disabled:bg-teal-500/30 disabled:text-white/50 transition-colors"
            >
              {isTransferring ? 'Transferring...' : 'Transfer to Staking'}
            </button>
          </div>
        )}

        {/* Staking Balance */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Staking Balance (Undelegated)</p>
            <p className="text-white font-medium">{formatCompactNumber(stakingState?.undelegated ?? '0')} HYPE</p>
          </div>
          <button
            onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }}
            disabled={pendingCount >= 5}
            className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-400  hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw to Spot
          </button>
        </div>

        {showWithdraw && (
          <div className="bg-[#1a2028]  p-3 space-y-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 ">
              <p className="text-amber-400 text-[10px]">7-day unstaking queue. Max 5 pending withdrawals ({pendingCount}/5 used).</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 bg-[#0f1419] border border-gray-700  px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={() => setWithdrawAmount(stakingState?.undelegated ?? '0')}
                className="px-2 py-2 text-xs text-amber-400 hover:text-amber-300"
              >
                MAX
              </button>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isTransferring || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || pendingCount >= 5}
              className="w-full py-2  text-xs font-semibold bg-amber-500 hover:bg-amber-500/80 text-white disabled:bg-amber-500/30 disabled:text-white/50 transition-colors"
            >
              {isTransferring ? 'Withdrawing...' : 'Withdraw to Spot (7-day queue)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
