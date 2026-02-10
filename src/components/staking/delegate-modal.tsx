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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f1419] border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Delegate HYPE</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">&times;</button>
        </div>

        <div className="bg-[#1a2028] rounded-lg p-3 mb-4">
          <p className="text-gray-400 text-xs mb-1">Validator</p>
          <p className="text-white text-sm font-medium">{validator.name || 'Unknown'}</p>
          <p className="text-gray-500 text-[10px] font-mono">{formatAddress(validator.validator)}</p>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-gray-400 text-[10px]">Commission</p>
              <p className="text-white text-xs">{(parseFloat(validator.commission) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px]">Total Stake</p>
              <p className="text-white text-xs">{formatCompactNumber(validator.stake)} HYPE</p>
            </div>
          </div>
        </div>

        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
          <p className="text-amber-400 text-[10px]">Delegated HYPE has a 1-day lockup period before it can be undelegated.</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-400 text-xs">Amount</label>
            <p className="text-gray-500 text-[10px]">Available: {formatCompactNumber(availableBalance)} HYPE</p>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
            />
            <button onClick={() => setAmount(availableBalance)} className="px-3 py-3 text-xs text-teal-400 hover:text-teal-300 bg-[#1a2028] border border-gray-700 rounded-lg">
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isDelegating || !amount || parseFloat(amount) <= 0}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-teal-500 hover:bg-teal-500/80 text-white disabled:bg-teal-500/30 disabled:text-white/50 transition-colors"
        >
          {isDelegating ? 'Delegating...' : 'Delegate HYPE'}
        </button>
      </div>
    </div>
  );
}
