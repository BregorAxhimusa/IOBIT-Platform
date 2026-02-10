'use client';

import { formatCompactNumber, formatAddress } from '@/lib/utils/format';
import type { Delegation, ValidatorSummary } from '@/lib/hyperliquid/types';

interface MyDelegationsProps {
  delegations: Delegation[];
  validators: ValidatorSummary[];
  onUndelegate: (validator: string, amount: string) => void;
  isDelegating: boolean;
}

export function MyDelegations({ delegations, validators, onUndelegate, isDelegating }: MyDelegationsProps) {
  const getValidatorName = (addr: string) => {
    const v = validators.find((v) => v.validator.toLowerCase() === addr.toLowerCase());
    return v?.name || formatAddress(addr);
  };

  if (delegations.length === 0) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold text-sm mb-4">My Delegations</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <p className="text-sm">No active delegations</p>
          <p className="text-xs mt-1">Choose a validator below to start staking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-5">
      <h3 className="text-white font-semibold text-sm mb-4">My Delegations</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-800">
              <th className="text-left py-2 font-normal">Validator</th>
              <th className="text-right py-2 font-normal">Staked</th>
              <th className="text-right py-2 font-normal">Status</th>
              <th className="text-right py-2 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {delegations.map((d) => {
              const isLocked = d.lockedUntil > Date.now();
              const lockRemaining = isLocked ? Math.ceil((d.lockedUntil - Date.now()) / (1000 * 60 * 60)) : 0;

              return (
                <tr key={d.validator} className="border-b border-gray-800/50">
                  <td className="py-3 text-white">{getValidatorName(d.validator)}</td>
                  <td className="py-3 text-right text-white">{formatCompactNumber(d.amount)} HYPE</td>
                  <td className="py-3 text-right">
                    {isLocked ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded-full">
                        Locked ({lockRemaining}h left)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onUndelegate(d.validator, d.amount)}
                      disabled={isLocked || isDelegating}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Undelegate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
