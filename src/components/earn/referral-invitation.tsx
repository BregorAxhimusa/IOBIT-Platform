'use client';

import { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

export function ReferralInvitation() {
  const [referralCode, setReferralCode] = useState('');
  const { isConnected } = useAppKitAccount();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setReferralCode(text);
    } catch {
      console.error('Failed to read clipboard');
    }
  };

  return (
    <div className="w-full border-t border-[#1a1a1f] bg-[#0a0a0c]">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:border-l lg:border-r border-[#1a1a1f]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side - Info */}
          <div>
            {/* Commission Badge */}
            <span className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px] mb-4 md:mb-6">
              Get up to 30% commission!
            </span>

            {/* Title */}
            <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium mb-3 md:mb-4">
              Complete the Invitation
            </h2>

            {/* Description */}
            <p className="text-[#6b6b6b] text-xs md:text-sm mb-6 md:mb-8">
              Enter your friend&apos;s referral code to complete the referral.
              <br />
              Refer friends and unlock more rewards together!
            </p>

            {/* Referral Flow Icons */}
            <div className="flex items-center gap-2">
              {/* Single Person */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-[#16DE93] bg-[#16DE93]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#16DE93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Dotted Line */}
              <div className="flex-1 max-w-12 md:max-w-16 border-t border-dashed border-[#6b6b6b]" />

              {/* Two People */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-[#16DE93] bg-[#16DE93]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#16DE93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              {/* Dotted Line */}
              <div className="flex-1 max-w-12 md:max-w-16 border-t border-dashed border-[#6b6b6b]" />

              {/* Group */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-[#16DE93] bg-[#16DE93]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#16DE93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Referral Code Input */}
          <div className="flex flex-col justify-center">
            <label className="text-white text-xs md:text-sm font-medium mb-2 md:mb-3">
              Referral Code
            </label>

            {/* Input with Paste button */}
            <div className="relative mb-3 md:mb-4">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter or Paste your friend's referral code"
                className="w-full bg-transparent border border-[#2a2a2f] rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-white text-xs md:text-sm placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#16DE93] transition-colors pr-14 md:pr-16"
              />
              <button
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#16DE93] text-[10px] md:text-xs hover:underline"
              >
                Paste
              </button>
            </div>

            {/* Submit Button */}
            <button className="w-fit px-4 md:px-6 py-2.5 md:py-3 bg-white hover:bg-white/90 text-black text-xs md:text-sm font-medium rounded-lg transition-colors">
              Submit the Code
            </button>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="border-t border-[#1a1a1f]">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {/* Total Referrals */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mb-1">Total Referrals</p>
            <p className="text-white text-xl md:text-2xl font-semibold">0</p>
          </div>

          {/* Lifetime Points Earned */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mb-1">Lifetime Points Earned</p>
            <p className="text-white text-xl md:text-2xl font-semibold">0</p>
          </div>

          {/* Current Affiliate Points */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mb-1">Current Affiliate Points</p>
            <p className="text-white text-xl md:text-2xl font-semibold">0</p>
          </div>

          {/* Your Referral Status */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mb-1">Your Referral Status</p>
            <p className="text-white text-xl md:text-2xl font-semibold">
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="py-8 md:py-12 border-t border-[#1a1a1f]" />
    </div>
  );
}
