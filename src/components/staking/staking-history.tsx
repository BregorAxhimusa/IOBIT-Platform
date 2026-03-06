'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatCompactNumber, formatAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { DelegatorReward, DelegatorHistoryEvent, ValidatorSummary } from '@/lib/hyperliquid/types';

interface StakingHistoryProps {
  rewards: DelegatorReward[];
  history: DelegatorHistoryEvent[];
  validators: ValidatorSummary[];
  isLoading: boolean;
}

type Tab = 'rewards' | 'history';

export function StakingHistory({ rewards, history, validators, isLoading }: StakingHistoryProps) {
  const [tab, setTab] = useState<Tab>('rewards');

  const getValidatorName = (addr: string) => {
    const v = validators.find((v) => v.validator.toLowerCase() === addr.toLowerCase());
    return v?.name || formatAddress(addr);
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'rewards', label: `Rewards (${rewards.length})` },
    { value: 'history', label: `History (${history.length})` },
  ];

  return (
    <div className="bg-[#0a0a0c] border border-[#2a2a2f] p-5">
      <div className="flex border-b border-[#2a2a2f] mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-xs transition-colors border-b-2 -mb-px',
              tab === t.value ? 'border-[#16DE93] text-white' : 'border-transparent text-white/70 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-800/50 rounded animate-pulse" />)}
        </div>
      ) : tab === 'rewards' ? (
        <div className="max-h-[400px] overflow-y-auto">
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Image
                src="/iobit/landingpage/nofound.svg"
                alt="No rewards"
                width={48}
                height={48}
                className="mb-3 opacity-50"
              />
              <p className="text-[#8A8A8E] text-sm">No rewards yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs border-b border-[#2a2a2f]">
                  <th className="text-left py-2 font-normal">Date</th>
                  <th className="text-left py-2 font-normal">Source</th>
                  <th className="text-right py-2 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rewards.slice().sort((a, b) => b.time - a.time).map((r, i) => (
                  <tr key={i} className="border-b border-[#2a2a2f]/50">
                    <td className="py-2 text-white text-xs">{new Date(r.time).toLocaleDateString()}</td>
                    <td className="py-2 text-white text-xs capitalize">{r.source}</td>
                    <td className="py-2 text-right text-[#16DE93] text-xs">+{parseFloat(r.totalAmount).toFixed(4)} HYPE</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Image
                src="/iobit/landingpage/nofound.svg"
                alt="No history"
                width={48}
                height={48}
                className="mb-3 opacity-50"
              />
              <p className="text-[#8A8A8E] text-sm">No staking history yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs border-b border-[#2a2a2f]">
                  <th className="text-left py-2 font-normal">Date</th>
                  <th className="text-left py-2 font-normal">Action</th>
                  <th className="text-right py-2 font-normal">Amount</th>
                  <th className="text-right py-2 font-normal">Validator</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().sort((a, b) => b.time - a.time).map((h, i) => {
                  const d = h.delta.delegate;
                  const w = h.delta.withdrawal;
                  const dep = h.delta.deposit;
                  let action = '';
                  let amount = '';
                  let validator = '';

                  if (d) {
                    action = d.isUndelegate ? 'Undelegate' : 'Delegate';
                    amount = d.amount;
                    validator = getValidatorName(d.validator);
                  } else if (w) {
                    action = 'Withdraw';
                    amount = w.amount;
                  } else if (dep) {
                    action = 'Deposit';
                    amount = dep.amount;
                  }

                  return (
                    <tr key={i} className="border-b border-[#2a2a2f]/50">
                      <td className="py-2 text-white text-xs">{new Date(h.time).toLocaleDateString()}</td>
                      <td className="py-2 text-xs">
                        <span className={cn(
                          action === 'Delegate' || action === 'Deposit' ? 'text-[#16DE93]' : 'text-[#f6465d]'
                        )}>
                          {action}
                        </span>
                      </td>
                      <td className="py-2 text-right text-white text-xs">{formatCompactNumber(amount)} HYPE</td>
                      <td className="py-2 text-right text-white text-xs">{validator || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
