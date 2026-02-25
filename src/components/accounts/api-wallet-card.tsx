'use client';

import { formatAddress } from '@/lib/utils/format';
import type { ApiWallet } from '@/lib/hyperliquid/types';

interface ApiWalletCardProps {
  wallet: ApiWallet;
}

export function ApiWalletCard({ wallet }: ApiWalletCardProps) {
  const isExpired = wallet.authorizedUntil > 0 && Date.now() > wallet.authorizedUntil;
  const expiryDate = wallet.authorizedUntil > 0
    ? new Date(wallet.authorizedUntil).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never';

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-white font-medium text-sm">
            {wallet.name || 'Unnamed Wallet'}
          </h3>
          <p className="text-gray-500 font-mono text-xs mt-0.5">
            {formatAddress(wallet.address)}
          </p>
        </div>
        {isExpired ? (
          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded-full">
            Expired
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div>
          <p className="text-gray-400 text-[10px] mb-0.5">Expires</p>
          <p className="text-gray-300 text-xs">{expiryDate}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] mb-0.5">Permissions</p>
          <p className="text-gray-300 text-xs">
            {wallet.allowedActions.length > 0
              ? wallet.allowedActions.join(', ')
              : 'All'}
          </p>
        </div>
      </div>
    </div>
  );
}
