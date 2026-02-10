import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubAccount, ApiWallet, TradingContext } from '@/lib/hyperliquid/types';

interface AccountState {
  // Data
  subAccounts: SubAccount[];
  apiWallets: ApiWallet[];
  tradingContext: TradingContext | null;

  // Actions
  setSubAccounts: (accounts: SubAccount[]) => void;
  setApiWallets: (wallets: ApiWallet[]) => void;
  setTradingContext: (ctx: TradingContext | null) => void;
  switchToMaster: (address: string) => void;
  switchToSubAccount: (subAccount: SubAccount) => void;

  // Computed helpers
  getFetchAddress: (masterAddress: string) => string;
  getVaultAddress: () => string | undefined;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      subAccounts: [],
      apiWallets: [],
      tradingContext: null,

      setSubAccounts: (subAccounts) => set({ subAccounts }),
      setApiWallets: (apiWallets) => set({ apiWallets }),
      setTradingContext: (tradingContext) => set({ tradingContext }),

      switchToMaster: (address) =>
        set({
          tradingContext: {
            type: 'master',
            address,
            label: 'Main Account',
          },
        }),

      switchToSubAccount: (subAccount) =>
        set({
          tradingContext: {
            type: 'subaccount',
            address: subAccount.subAccountUser,
            label: subAccount.name || 'Sub-Account',
            vaultAddress: subAccount.subAccountUser,
          },
        }),

      getFetchAddress: (masterAddress) => {
        const { tradingContext } = get();
        if (!tradingContext || tradingContext.type === 'master') {
          return masterAddress;
        }
        return tradingContext.address;
      },

      getVaultAddress: () => {
        const { tradingContext } = get();
        if (!tradingContext || tradingContext.type === 'master') {
          return undefined;
        }
        return tradingContext.vaultAddress;
      },
    }),
    {
      name: 'iobit-account-store',
      partialize: (state) => ({
        tradingContext: state.tradingContext,
      }),
    }
  )
);
