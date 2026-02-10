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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0f1419] border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Transfer USDC</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4 truncate">
          {subAccount.name || 'Sub-Account'}{' '}
          <span className="text-gray-500 font-mono text-xs">
            ({formatAddress(subAccount.subAccountUser)})
          </span>
        </p>

        {/* Direction Tabs */}
        <div className="flex bg-[#1a2028] rounded-lg p-1 mb-4">
          <button
            onClick={() => setDirection('toSub')}
            className={cn(
              'flex-1 py-2 text-sm rounded-md transition-colors',
              direction === 'toSub'
                ? 'bg-[#14b8a6] text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Master → Sub
          </button>
          <button
            onClick={() => setDirection('toMaster')}
            className={cn(
              'flex-1 py-2 text-sm rounded-md transition-colors',
              direction === 'toMaster'
                ? 'bg-[#14b8a6] text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Sub → Master
          </button>
        </div>

        {/* Available Balance */}
        <div className="bg-[#1a2028] rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {direction === 'toSub' ? 'Master Available' : 'Sub Available'}
            </span>
            <span className="text-white">${availableBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Amount (USDC)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#14b8a6] hover:text-[#14b8a6]/80"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isTransferring || !canTransfer}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white disabled:bg-[#14b8a6]/30 disabled:text-white/50 transition-colors"
        >
          {isTransferring
            ? 'Transferring...'
            : `Transfer $${parsedAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
