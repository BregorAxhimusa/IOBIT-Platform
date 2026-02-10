'use client';

import { useState, useMemo } from 'react';
import { formatCompactNumber, formatAddress } from '@/lib/utils/format';
import type { ValidatorSummary } from '@/lib/hyperliquid/types';

interface ValidatorsTableProps {
  validators: ValidatorSummary[];
  isLoading: boolean;
  onStake: (validator: ValidatorSummary) => void;
}

type SortField = 'stake' | 'commission' | 'name';

export function ValidatorsTable({ validators, isLoading, onStake }: ValidatorsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('stake');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    const result = validators.filter((v) => {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.validator.toLowerCase().includes(q);
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'stake') cmp = parseFloat(a.stake) - parseFloat(b.stake);
      else if (sortField === 'commission') cmp = parseFloat(a.commission) - parseFloat(b.commission);
      else cmp = a.name.localeCompare(b.name);
      return sortDesc ? -cmp : cmp;
    });

    return result;
  }, [validators, search, sortField, sortDesc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDesc(!sortDesc);
    else { setSortField(field); setSortDesc(true); }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Validators</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Validators ({filtered.length})</h3>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search validators..."
          className="bg-[#1a2028] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs w-48 focus:outline-none focus:border-gray-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-800">
              <th className="text-left py-2 font-normal">#</th>
              <th className="text-left py-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                Validator {sortField === 'name' ? (sortDesc ? '▼' : '▲') : ''}
              </th>
              <th className="text-right py-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('commission')}>
                Commission {sortField === 'commission' ? (sortDesc ? '▼' : '▲') : ''}
              </th>
              <th className="text-right py-2 font-normal cursor-pointer hover:text-white" onClick={() => handleSort('stake')}>
                Total Stake {sortField === 'stake' ? (sortDesc ? '▼' : '▲') : ''}
              </th>
              <th className="text-right py-2 font-normal">Status</th>
              <th className="text-right py-2 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={v.validator} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-3 text-gray-400">{i + 1}</td>
                <td className="py-3">
                  <div>
                    <p className="text-white text-sm">{v.name || 'Unknown'}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{formatAddress(v.validator)}</p>
                  </div>
                </td>
                <td className="py-3 text-right text-white">{(parseFloat(v.commission) * 100).toFixed(1)}%</td>
                <td className="py-3 text-right text-white">{formatCompactNumber(v.stake)} HYPE</td>
                <td className="py-3 text-right">
                  {v.isJailed ? (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded-full">Jailed</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full">Active</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onStake(v)}
                    disabled={v.isJailed}
                    className="px-3 py-1 text-xs font-medium bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Stake
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
