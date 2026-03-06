'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function AccountButton() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  const handleAccountClick = () => {
    if (isConnected) {
      open({ view: 'Account' });
    } else {
      open();
    }
  };

  return (
    <button
      onClick={handleAccountClick}
      className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[#56565B] transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="text-[10px] font-medium">Account</span>
    </button>
  );
}
