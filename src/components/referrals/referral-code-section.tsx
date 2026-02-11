'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCompactNumber } from '@/lib/utils/format';
import type { ReferralInfo } from '@/lib/hyperliquid/types';

interface ReferralCodeSectionProps {
  referralInfo: ReferralInfo | null;
  onCreateCode: (code: string) => Promise<{ success: boolean }>;
  isCreating: boolean;
}

type Scenario = 'hasCode' | 'canCreate' | 'needsVolume';

function getScenario(referralInfo: ReferralInfo | null): Scenario {
  if (!referralInfo) return 'needsVolume';

  const code = referralInfo.referrerState?.data?.code;
  if (code) return 'hasCode';

  const volume = parseFloat(referralInfo.cumVlm || '0');
  if (volume >= 10000) return 'canCreate';

  return 'needsVolume';
}

function HasCodeView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://app.hyperliquid.xyz/join/${code}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-[#1a2028] border border-teal-500/30 rounded-lg px-5 py-3 flex-1">
          <p className="text-gray-400 text-xs mb-1">Your Referral Code</p>
          <p className="text-teal-400 text-xl font-bold tracking-wider">{code}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-[#1a2028] border border-gray-700 rounded-lg px-3 py-2 flex-1 overflow-hidden">
          <p className="text-gray-300 text-sm truncate">{referralLink}</p>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          )}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <div className="bg-[#1a2028] border border-gray-800 rounded-lg p-3">
        <p className="text-gray-400 text-xs">
          Share this link with friends. You earn a portion of their trading fees, and they get a 4% fee discount
          on their first $25M in volume.
        </p>
      </div>
    </div>
  );
}

function CreateCodeView({
  onCreateCode,
  isCreating,
}: {
  onCreateCode: (code: string) => Promise<{ success: boolean }>;
  isCreating: boolean;
}) {
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState('');

  const isValidCode = /^[A-Z0-9]{3,20}$/.test(codeInput);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 20) {
      setCodeInput(value);
      setError('');
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (!isValidCode) return;
    setError('');
    const result = await onCreateCode(codeInput);
    if (!result.success) {
      setError('Failed to create referral code. It may already be taken.');
    }
  }, [codeInput, isValidCode, onCreateCode]);

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-amber-400 text-sm">
          Your referral code is permanent and cannot be changed!
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={codeInput}
          onChange={handleInputChange}
          placeholder="Enter code (3-20 chars, A-Z, 0-9)"
          maxLength={20}
          className="flex-1 bg-[#1a2028] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors uppercase"
        />
        <button
          onClick={handleCreate}
          disabled={!isValidCode || isCreating}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
            isValidCode && !isCreating
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          )}
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Code'
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <p className="text-gray-500 text-xs">
        Alphanumeric characters only (A-Z, 0-9). Minimum 3, maximum 20 characters.
      </p>
    </div>
  );
}

function NeedsVolumeView({ currentVolume }: { currentVolume: string }) {
  const volume = parseFloat(currentVolume) || 0;
  const target = 10000;
  const progress = Math.min((volume / target) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="bg-[#1a2028] border border-gray-800 rounded-lg p-4">
        <p className="text-gray-300 text-sm mb-3">
          You need <span className="text-teal-400 font-semibold">$10,000</span> in trading volume to create a referral code.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Current Volume</span>
            <span className="text-white font-medium">${formatCompactNumber(currentVolume)}</span>
          </div>

          <div className="w-full bg-[#0b0e11] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{progress.toFixed(1)}% complete</span>
            <span className="text-gray-500">$10,000</span>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-xs">
        Start trading to build up your volume. Once you reach $10,000 in cumulative volume,
        you will be able to create your own referral code.
      </p>
    </div>
  );
}

export function ReferralCodeSection({
  referralInfo,
  onCreateCode,
  isCreating,
}: ReferralCodeSectionProps) {
  const scenario = getScenario(referralInfo);

  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        Your Referral Code
      </h3>

      {scenario === 'hasCode' && referralInfo?.referrerState?.data?.code && (
        <HasCodeView code={referralInfo.referrerState.data.code} />
      )}

      {scenario === 'canCreate' && (
        <CreateCodeView onCreateCode={onCreateCode} isCreating={isCreating} />
      )}

      {scenario === 'needsVolume' && (
        <NeedsVolumeView currentVolume={referralInfo?.cumVlm ?? '0'} />
      )}
    </div>
  );
}
