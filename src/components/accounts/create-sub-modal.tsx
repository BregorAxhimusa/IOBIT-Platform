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
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-white">Create Sub-Account</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 text-center">
              Separate balances and positions
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-[#1a2028] border border-gray-800 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed">
                Sub-accounts share your master wallet for signing but have separate balances and positions.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mb-3 sm:mb-4">
            <label className="text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2 block">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Trading Bot, Long-term"
              maxLength={24}
              className="w-full bg-[#1a2028] border border-gray-800 px-3 py-2 sm:px-4 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500/50 placeholder-gray-600"
            />
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-1.5">{name.length}/24 characters</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isCreating || !name.trim()}
            className="w-full py-2.5 sm:py-3 font-normal text-xs sm:text-sm bg-teal-500 hover:bg-teal-400 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
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
