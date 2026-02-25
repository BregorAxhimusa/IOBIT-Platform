'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useSubAccountTransfer } from '@/hooks/use-sub-account-transfer';
import { useAccountBalance } from '@/hooks/use-account-balance';
import { formatAddress } from '@/lib/utils/format';
import type { SubAccount } from '@/lib/hyperliquid/types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  subAccount: SubAccount;
  onSuccess: () => void;
}

type Direction = 'toSub' | 'toMaster';

export function TransferModal({ isOpen, onClose, subAccount, onSuccess }: TransferModalProps) {
  const [direction, setDirection] = useState<Direction>('toSub');
  const [amount, setAmount] = useState('');
  const { transfer, isTransferring } = useSubAccountTransfer();
  const { fullBalance } = useAccountBalance();

  if (!isOpen) return null;

  const masterBalance = fullBalance?.withdrawable || 0;
  const subBalance = subAccount.clearinghouseState
    ? Math.max(
        0,
        parseFloat(subAccount.clearinghouseState.marginSummary.accountValue) -
          parseFloat(subAccount.clearinghouseState.marginSummary.totalMarginUsed)
      )
    : 0;

  const availableBalance = direction === 'toSub' ? masterBalance : subBalance;
  const parsedAmount = parseFloat(amount) || 0;
  const canTransfer = parsedAmount > 0 && parsedAmount <= availableBalance;

  const handleSubmit = async () => {
    if (!canTransfer) return;

    const result = await transfer(
      subAccount.subAccountUser,
      direction === 'toSub',
      parsedAmount
    );

    if (result.success) {
      setAmount('');
      onSuccess();
      onClose();
    }
  };

  const handleMaxClick = () => {
    setAmount(availableBalance.toFixed(2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0f1419] border border-gray-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Transfer USDC</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 truncate max-w-full">
              {subAccount.name || 'Sub-Account'}{' '}
              <span className="font-mono text-gray-600">
                ({formatAddress(subAccount.subAccountUser)})
              </span>
            </p>
          </div>

          {/* Direction Tabs */}
          <div className="flex bg-[#1a2028] border border-gray-800 p-1 mb-4 sm:mb-6">
            <button
              onClick={() => { setDirection('toSub'); setAmount(''); }}
              className={cn(
                'flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors',
                direction === 'toSub'
                  ? 'bg-teal-500 text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Master → Sub
            </button>
            <button
              onClick={() => { setDirection('toMaster'); setAmount(''); }}
              className={cn(
                'flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors',
                direction === 'toMaster'
                  ? 'bg-teal-500 text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Sub → Master
            </button>
          </div>

          {/* Transfer Visual */}
          <div className="bg-[#1a2028] border border-gray-800 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              {/* From */}
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">From</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                    direction === 'toSub' ? 'bg-purple-400' : 'bg-teal-400'
                  )} />
                  <span className="text-white text-sm sm:text-base font-medium">
                    {direction === 'toSub' ? 'Master' : 'Sub-Account'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  ${(direction === 'toSub' ? masterBalance : subBalance).toFixed(2)}
                </p>
              </div>

              {/* Arrow */}
              <div className="mx-2 sm:mx-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* To */}
              <div className="flex-1 text-right">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">To</p>
                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                  <span className="text-white text-sm sm:text-base font-medium">
                    {direction === 'toSub' ? 'Sub-Account' : 'Master'}
                  </span>
                  <span className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                    direction === 'toSub' ? 'bg-teal-400' : 'bg-purple-400'
                  )} />
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  ${(direction === 'toSub' ? subBalance : masterBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="text-[10px] sm:text-xs text-gray-500 font-medium">Amount (USDC)</label>
              <button
                onClick={handleMaxClick}
                className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                MAX: ${availableBalance.toFixed(2)}
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a2028] border border-gray-800 px-3 py-2 sm:px-4 sm:py-3 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500/50 placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isTransferring || !canTransfer}
            className="w-full py-2.5 sm:py-3 font-semibold text-xs sm:text-sm bg-teal-500 hover:bg-teal-400 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isTransferring ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Transferring...
              </span>
            ) : `Transfer $${parsedAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
