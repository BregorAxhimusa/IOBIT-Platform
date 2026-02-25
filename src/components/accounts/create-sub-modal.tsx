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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0f1419] border border-gray-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Create Sub-Account</h2>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Separate balances and positions
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-[#1a2028] border border-gray-800 p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-xs leading-relaxed">
                Sub-accounts share your master wallet for signing but have separate balances and positions.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium mb-2 block">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trading Bot, Long-term"
              maxLength={24}
              className="w-full bg-[#1a2028] border border-gray-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder-gray-600"
            />
            <p className="text-xs text-gray-600 mt-1.5">{name.length}/24 characters</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isCreating || !name.trim()}
            className="w-full py-3 font-semibold text-sm bg-teal-500 hover:bg-teal-400 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : 'Create Sub-Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
