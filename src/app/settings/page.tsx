'use client';

import { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSubAccounts } from '@/hooks/use-sub-accounts';
import { useApiWallets } from '@/hooks/use-api-wallets';
import { useUserFees } from '@/hooks/use-user-fees';
import { SubAccountCard } from '@/components/accounts/sub-account-card';
import { ApiWalletCard } from '@/components/accounts/api-wallet-card';
import { CreateSubModal } from '@/components/accounts/create-sub-modal';
import { AddApiWalletModal } from '@/components/accounts/add-api-wallet-modal';
import { TransferModal } from '@/components/accounts/transfer-modal';
import { PreferencesTab } from '@/components/settings/preferences-tab';
import { FeesTab } from '@/components/settings/fees-tab';
import { cn } from '@/lib/utils/cn';
import type { SubAccount } from '@/lib/hyperliquid/types';

type Tab = 'accounts' | 'preferences' | 'fees';

export default function SettingsPage() {
  const { isConnected, address } = useAppKitAccount();
  const { subAccounts, isLoading: isLoadingSubs, refetch: refetchSubs } = useSubAccounts();
  const { apiWallets, isLoading: isLoadingWallets, refetch: refetchWallets } = useApiWallets();
  const { userFees, isLoading: isLoadingFees } = useUserFees();

  const [tab, setTab] = useState<Tab>('accounts');
  const [accountsSubTab, setAccountsSubTab] = useState<'sub-accounts' | 'api-wallets'>('sub-accounts');
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [transferTarget, setTransferTarget] = useState<SubAccount | null>(null);

  const tabs: { value: Tab; label: string }[] = [
    { value: 'accounts', label: 'Accounts' },
    { value: 'preferences', label: 'Preferences' },
    { value: 'fees', label: 'Fees' },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16 text-gray-500">
            Please connect your wallet to access settings
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white page-enter">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage accounts, preferences, and view fee information
            </p>
          </div>
          {tab === 'accounts' && (
            <button
              onClick={() =>
                accountsSubTab === 'sub-accounts'
                  ? setShowCreateSub(true)
                  : setShowAddWallet(true)
              }
              className="px-4 py-2 bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {accountsSubTab === 'sub-accounts' ? '+ New Sub-Account' : '+ Add API Wallet'}
            </button>
          )}
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px',
                tab === t.value
                  ? 'border-[#14b8a6] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Accounts Tab */}
        {tab === 'accounts' && (
          <div>
            {/* Sub-tabs for accounts */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAccountsSubTab('sub-accounts')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg transition-colors',
                  accountsSubTab === 'sub-accounts'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                Sub-Accounts ({subAccounts.length})
              </button>
              <button
                onClick={() => setAccountsSubTab('api-wallets')}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg transition-colors',
                  accountsSubTab === 'api-wallets'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                API Wallets ({apiWallets.length})
              </button>
            </div>

            {accountsSubTab === 'sub-accounts' && (
              <div>
                {isLoadingSubs ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : subAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <p className="text-sm mb-2">No sub-accounts yet</p>
                    <button onClick={() => setShowCreateSub(true)} className="text-[#14b8a6] text-sm hover:underline">
                      Create your first sub-account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subAccounts.map((sub) => (
                      <SubAccountCard key={sub.subAccountUser} subAccount={sub} onTransfer={setTransferTarget} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {accountsSubTab === 'api-wallets' && (
              <div>
                {isLoadingWallets ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : apiWallets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <p className="text-sm mb-2">No API wallets authorized</p>
                    <button onClick={() => setShowAddWallet(true)} className="text-[#14b8a6] text-sm hover:underline">
                      Add an API wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiWallets.map((wallet) => (
                      <ApiWalletCard key={wallet.address} wallet={wallet} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {tab === 'preferences' && (
          <PreferencesTab address={address || ''} />
        )}

        {/* Fees Tab */}
        {tab === 'fees' && (
          <FeesTab userFees={userFees} isLoading={isLoadingFees} />
        )}
      </div>

      {/* Modals */}
      <CreateSubModal
        isOpen={showCreateSub}
        onClose={() => setShowCreateSub(false)}
        onSuccess={() => refetchSubs()}
      />
      <AddApiWalletModal
        isOpen={showAddWallet}
        onClose={() => setShowAddWallet(false)}
        onSuccess={() => refetchWallets()}
      />
      {transferTarget && (
        <TransferModal
          isOpen={!!transferTarget}
          onClose={() => setTransferTarget(null)}
          subAccount={transferTarget}
          onSuccess={() => refetchSubs()}
        />
      )}
    </div>
  );
}
