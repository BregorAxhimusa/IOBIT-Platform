import { useMutation } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';
import { getExchangeClient, getAssetIndex } from '@/lib/hyperliquid/exchange-client';
import { signUpdateLeverage, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

interface UpdateLeverageParams {
  symbol: string;
  leverage: number;
  isCross: boolean;
}

export function useUpdateLeverage() {
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();

  return useMutation({
    mutationFn: async ({ symbol, leverage, isCross }: UpdateLeverageParams) => {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      // Validate leverage (1-50x for most assets)
      if (leverage < 1 || leverage > 50) {
        throw new Error('Leverage must be between 1x and 50x');
      }

      const nonce = generateNonce();
      const assetIndex = getAssetIndex(symbol);

      // Sign the leverage update
      const signature = await signUpdateLeverage(walletClient, {
        coin: symbol,
        isCross,
        leverage,
        nonce,
        network,
        assetIndex,
        vaultAddress,
      });

      // Send to exchange
      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.updateLeverage({
        coin: symbol,
        isCross,
        leverage,
        signature,
        nonce,
        vaultAddress,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update leverage');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Leverage updated to ${variables.leverage}x (${variables.isCross ? 'Cross' : 'Isolated'})`
      );
    },
    onError: (error: Error) => {
      console.error('Leverage update failed:', error);
      toast.error(error.message || 'Failed to update leverage');
    },
  });
}
