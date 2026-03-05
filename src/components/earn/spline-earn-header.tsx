'use client';

import { useState } from 'react';
import Spline from '@splinetool/react-spline';

export function SplineEarnHeader() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-[600px] lg:h-[788px] bg-[#080808] overflow-hidden border-b border-white/10">
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#080808]">
          {/* Spinner */}
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#16DE93]/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#16DE93] animate-spin" />
          </div>
          <p className="text-white/60 text-sm">Loading Earn Experience...</p>
        </div>
      )}

      {/* Spline Canvas Container */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Spline
          scene="/earn/scene.splinecode"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-full flex">
          {/* Left Side - Title */}
          <div className="flex-1 flex flex-col justify-start px-4 md:px-8 lg:px-16 pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 pointer-events-auto">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-light text-white leading-tight">
              Grow and Earn
              <br />
              by Powering the
              <br />
              IOBIT Ecosystem
            </h1>

            {/* How to Earn Button */}
            <button className="mt-6 md:mt-8 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-[#16DE93] hover:bg-[#16DE93]/80 text-black text-xs md:text-sm font-medium rounded-md transition-colors w-fit">
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              How to Earn?
            </button>

            {/* Mobile Info - Hidden on desktop */}
            <div className="mt-6 lg:hidden">
              <p className="flex items-center gap-2 text-white text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Invite 1 friend to get 5% commission
              </p>
              <p className="text-white/50 text-[11px] leading-relaxed">
                Stake your BIT tokens with trusted validators to secure the network and earn rewards.
              </p>
            </div>
          </div>

          {/* Right Side - Info (Desktop only) */}
          <div className="hidden lg:flex flex-1 flex-col justify-end items-end px-8 lg:px-16 py-12 pointer-events-auto">
            <div className="max-w-sm text-right">
              <p className="flex items-center justify-end gap-2 text-white text-sm mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Invite 1 friend to get 5% commission
              </p>
              <p className="text-white/50 text-sm">
                Stake your BIT tokens with trusted validators to secure the network and earn rewards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
