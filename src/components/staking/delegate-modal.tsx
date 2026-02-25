'use client';

import { useState } from 'react';
import { formatCompactNumber, formatAddress } from '@/lib/utils/format';
import type { ValidatorSummary } from '@/lib/hyperliquid/types';

interface DelegateModalProps {
  isOpen: boolean;
  onClose: () => void;
  validator: ValidatorSummary | null;
  availableBalance: string;
  onDelegate: (validator: string, amount: string) => Promise<{ success: boolean }>;
  isDelegating: boolean;
}

export function DelegateModal({ isOpen, onClose, validator, availableBalance, onDelegate, isDelegating }: DelegateModalProps) {
  const [amount, setAmount] = useState('');

  if (!isOpen || !validator) return null;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const result = await onDelegate(validator.validator, amount);
    if (result.success) {
      setAmount('');
      onClose();
    }
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
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-purple-500/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-white">Delegate HYPE</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Stake with a validator</p>
          </div>

          {/* Validator Info */}
          <div className="bg-[#1a2028] border border-gray-800 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Validator</p>
                <p className="text-white text-sm sm:text-base font-normal">{validator.name || 'Unknown'}</p>
                <p className="text-gray-600 text-[10px] sm:text-xs mt-0.5">{formatAddress(validator.validator)}</p>
              </div>
              {validator.isJailed ? (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/10 text-red-400 text-[10px] sm:text-xs border border-red-500/30">Jailed</span>
              ) : (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/10 text-green-400 text-[10px] sm:text-xs border border-green-500/30">Active</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-800">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Commission</p>
                <p className="text-white text-xs sm:text-sm font-normal">{(parseFloat(validator.commission) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Total Stake</p>
                <p className="text-white text-xs sm:text-sm font-normal">{formatCompactNumber(validator.stake)} HYPE</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-2 sm:p-3 mb-3 sm:mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-amber-400 text-[10px] sm:text-xs">
                Delegated HYPE has a 1-day lockup period before it can be undelegated.
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="text-[10px] sm:text-xs text-gray-500 font-normal">Amount (HYPE)</label>
              <span className="text-[10px] sm:text-xs text-gray-500">
                Available: <span className="text-teal-400">{formatCompactNumber(availableBalance)}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-[#1a2028] border border-gray-800 px-3 py-2 sm:px-4 sm:py-3 text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-teal-500/50 placeholder-gray-600"
              />
              <button
                onClick={() => setAmount(availableBalance)}
                className="px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-xs font-normal text-teal-400 hover:text-teal-300 bg-[#1a2028] border border-gray-800 hover:border-teal-500/30 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isDelegating || !amount || parseFloat(amount) <= 0}
            className="w-full py-2.5 sm:py-3 font-semibold text-xs sm:text-sm bg-teal-500 hover:bg-teal-400 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isDelegating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Delegating...
              </span>
            ) : 'Delegate HYPE'}
          </button>
        </div>
      </div>
    </div>
  );
}
