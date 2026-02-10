'use client';

import { useState } from 'react';
import { useCreateSubAccount } from '@/hooks/use-create-sub-account';

interface CreateSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSubModal({ isOpen, onClose, onSuccess }: CreateSubModalProps) {
  const [name, setName] = useState('');
  const { createSubAccount, isCreating } = useCreateSubAccount();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const result = await createSubAccount(name);
    if (result.success) {
      setName('');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0f1419] border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Create Sub-Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 text-xs mb-4">
          Sub-accounts share your master wallet for signing but have separate balances and positions.
        </p>

        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Account Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Trading Bot, Long-term"
            maxLength={24}
            className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isCreating || !name.trim()}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white disabled:bg-[#14b8a6]/30 disabled:text-white/50 transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Sub-Account'}
        </button>
      </div>
    </div>
  );
}
