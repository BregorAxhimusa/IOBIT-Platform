'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import type { ReferralInfo } from '@/lib/hyperliquid/types';

interface ReferredBySectionProps {
  referralInfo: ReferralInfo | null;
  onSetReferrer: (code: string) => Promise<{ success: boolean }>;
  isSetting: boolean;
}

function AlreadyReferredView({ referrer, code }: { referrer: string; code: string }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#1a2028] border border-teal-500/20  p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-normal">
              Referred by {formatAddress(referrer)}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Code: <span className="text-teal-400 font-normal">{code}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#1a2028] border border-gray-800  p-3">
        <p className="text-gray-400 text-xs">
          You get a <span className="text-teal-400 font-normal">4% fee discount</span> on your first $25M in trading volume.
        </p>
      </div>
    </div>
  );
}

function SetReferrerView({
  onSetReferrer,
  isSetting,
}: {
  onSetReferrer: (code: string) => Promise<{ success: boolean }>;
  isSetting: boolean;
}) {
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');

  const isValidCode = codeInput.trim().length >= 1;

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    setError('');
  }, []);

  const handleApply = useCallback(async () => {
    if (!isValidCode) return;
    setError('');
    const result = await onSetReferrer(codeInput);
    if (!result.success) {
      setError('Failed to apply referral code. Please check the code and try again.');
    }
  }, [codeInput, isValidCode, onSetReferrer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isValidCode && !isSetting) {
        handleApply();
      }
    },
    [handleApply, isValidCode, isSetting]
  );

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/30  p-3 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-amber-400 text-sm">
          This action is permanent. You can only set a referral code once and it cannot be changed.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={codeInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter referral code"
          className="flex-1 bg-[#1a2028] border border-gray-700  px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors uppercase"
        />
        <button
          onClick={handleApply}
          disabled={!isValidCode || isSetting}
          className={cn(
            'px-4 py-2  text-sm font-normal transition-all shrink-0',
            isValidCode && !isSetting
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          )}
        >
          {isSetting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Applying...
            </span>
          ) : (
            'Apply Code'
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <p className="text-gray-500 text-xs">
        Enter a referral code from a friend to get a 4% fee discount on your first $25M in volume.
      </p>
    </div>
  );
}

export function ReferredBySection({
  referralInfo,
  onSetReferrer,
  isSetting,
}: ReferredBySectionProps) {
  const isReferred = referralInfo?.referredBy !== null && referralInfo?.referredBy !== undefined;

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      <h3 className="text-white font-normal mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        Referred By
      </h3>

      {isReferred && referralInfo?.referredBy ? (
        <AlreadyReferredView
          referrer={referralInfo.referredBy.referrer}
          code={referralInfo.referredBy.code}
        />
      ) : (
        <SetReferrerView onSetReferrer={onSetReferrer} isSetting={isSetting} />
      )}
    </div>
  );
}
