'use client';

import { useSpotBalance } from '@/hooks/use-spot-balance';
import { useSpotStore } from '@/store/spot-store';

/**
 * Spot Balances Table - Shows user's spot token holdings
 */
export function SpotBalancesTable() {
  const { balances, isLoading } = useSpotBalance();
  const getSpotMarkets = useSpotStore((state) => state.getSpotMarkets);
  const spotMarkets = getSpotMarkets();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Loading balances...
      </div>
    );
  }

  // Filter out zero-balance tokens
  const nonZeroBalances = balances.filter((b) => {
    const total = parseFloat(b.total);
    return total > 0.000001;
  });

  if (nonZeroBalances.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No spot balances. Transfer USDC from Perps to start trading.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-normal">Token</th>
            <th className="text-right py-2 px-3 font-normal">Total</th>
            <th className="text-right py-2 px-3 font-normal">Available</th>
            <th className="text-right py-2 px-3 font-normal">In Orders</th>
            <th className="text-right py-2 px-3 font-normal">Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          {nonZeroBalances.map((balance) => {
            const total = parseFloat(balance.total);
            const hold = parseFloat(balance.hold);
            const available = total - hold;

            // Find market price for this token
            const market = spotMarkets.find((m) => m.base === balance.coin);
            const price = market ? parseFloat(market.midPx) : (balance.coin === 'USDC' ? 1 : 0);
            const value = total * price;

            return (
              <tr
                key={balance.coin}
                className="border-b border-gray-800/50 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-2 px-3 font-normal text-white">
                  {balance.coin}
                </td>
                <td className="py-2 px-3 text-right text-white">
                  {total.toFixed(balance.coin === 'USDC' ? 2 : 4)}
                </td>
                <td className="py-2 px-3 text-right text-white">
                  {available.toFixed(balance.coin === 'USDC' ? 2 : 4)}
                </td>
                <td className="py-2 px-3 text-right text-gray-400">
                  {hold > 0 ? hold.toFixed(balance.coin === 'USDC' ? 2 : 4) : '-'}
                </td>
                <td className="py-2 px-3 text-right text-white">
                  ${value.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
