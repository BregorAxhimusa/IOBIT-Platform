'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useAccountStore } from '@/store/account-store';

/**
 * Hook that provides the current trading context.
 * Returns the address to fetch data for and the optional vaultAddress for exchange calls.
 */
export function useTradingContext() {
  const { address: masterAddress } = useAppKitAccount();
  const tradingContext = useAccountStore((state) => state.tradingContext);
  const getFetchAddress = useAccountStore((state) => state.getFetchAddress);
  const getVaultAddress = useAccountStore((state) => state.getVaultAddress);

  const fetchAddress = masterAddress ? getFetchAddress(masterAddress) : undefined;
  const vaultAddress = getVaultAddress();

  const isSubAccount = tradingContext?.type === 'subaccount';
  const contextLabel = tradingContext?.label || 'Main Account';

  return {
    fetchAddress,
    vaultAddress,
    isSubAccount,
    contextLabel,
    tradingContext,
  };
}
