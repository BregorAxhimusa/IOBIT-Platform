'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAccountStore } from '@/store/account-store';
import { useSubAccounts } from '@/hooks/use-sub-accounts';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';

export function AccountSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { subAccounts } = useSubAccounts();
  const tradingContext = useAccountStore((state) => state.tradingContext);
  const switchToMaster = useAccountStore((state) => state.switchToMaster);
  const switchToSubAccount = useAccountStore((state) => state.switchToSubAccount);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isConnected || !address) return null;

  // Don't show if no sub-accounts
  if (subAccounts.length === 0) return null;

  const currentLabel = tradingContext?.label || 'Main Account';
  const isMaster = !tradingContext || tradingContext.type === 'master';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
          isMaster
            ? 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
            : 'border-[#14b8a6]/50 text-[#14b8a6] bg-[#14b8a6]/10 hover:bg-[#14b8a6]/20'
        )}
      >
        <span className="max-w-[100px] truncate">{currentLabel}</span>
        <svg
          className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-[#0f1419] border border-gray-700 rounded-lg shadow-xl z-50 py-1">
          {/* Main Account */}
          <button
            onClick={() => {
              switchToMaster(address);
              setIsOpen(false);
            }}
            className={cn(
              'w-full text-left px-3 py-2 text-xs hover:bg-[#1a2028] transition-colors flex items-center justify-between',
              isMaster && 'bg-[#1a2028]'
            )}
          >
            <div>
              <div className="text-white font-medium">Main Account</div>
              <div className="text-gray-500 font-mono text-[10px]">{formatAddress(address)}</div>
            </div>
            {isMaster && (
              <span className="text-[#14b8a6] text-[10px]">Active</span>
            )}
          </button>

          {subAccounts.length > 0 && (
            <div className="border-t border-gray-800 my-1" />
          )}

          {/* Sub-Accounts */}
          {subAccounts.map((sub) => {
            const isActive = tradingContext?.address === sub.subAccountUser;
            return (
              <button
                key={sub.subAccountUser}
                onClick={() => {
                  switchToSubAccount(sub);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs hover:bg-[#1a2028] transition-colors flex items-center justify-between',
                  isActive && 'bg-[#1a2028]'
                )}
              >
                <div>
                  <div className="text-white font-medium">{sub.name || 'Sub-Account'}</div>
                  <div className="text-gray-500 font-mono text-[10px]">
                    {formatAddress(sub.subAccountUser)}
                  </div>
                </div>
                {isActive && (
                  <span className="text-[#14b8a6] text-[10px]">Active</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
