'use client';

import { useMemo, useState } from 'react';
import { formatAddress, formatCompactNumber, formatUSD, formatDate } from '@/lib/utils/format';
import { Pagination } from '@/components/ui/pagination';
import type { ReferralState } from '@/lib/hyperliquid/types';

const ROWS_PER_PAGE = 15;

interface ReferredUsersTableProps {
  referralStates: ReferralState[];
}

export function ReferredUsersTable({ referralStates }: ReferredUsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedStates = useMemo(() => {
    return [...referralStates].sort(
      (a, b) => parseFloat(b.cumVlm) - parseFloat(a.cumVlm)
    );
  }, [referralStates]);

  const totalPages = Math.ceil(sortedStates.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const pageStates = sortedStates.slice(startIdx, startIdx + ROWS_PER_PAGE);

  if (sortedStates.length === 0) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Referred Users
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1a2028] flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No referred users yet.</p>
          <p className="text-gray-500 text-xs mt-1">
            Share your referral code to start earning!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Referred Users
        <span className="text-gray-500 text-sm font-normal">({sortedStates.length})</span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 text-xs font-normal py-2 px-2 w-10">#</th>
              <th className="text-left text-gray-500 text-xs font-normal py-2 px-2">User</th>
              <th className="text-right text-gray-500 text-xs font-normal py-2 px-2">Volume</th>
              <th className="text-right text-gray-500 text-xs font-normal py-2 px-2">Fees Earned</th>
              <th className="text-right text-gray-500 text-xs font-normal py-2 px-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {pageStates.map((state, index) => (
              <tr
                key={state.user}
                className="border-b border-gray-800/50 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="text-gray-500 text-xs py-2.5 px-2">{startIdx + index + 1}</td>
                <td className="text-white text-sm py-2.5 px-2">
                  {formatAddress(state.user, 6)}
                </td>
                <td className="text-right text-white text-sm py-2.5 px-2">
                  ${formatCompactNumber(state.cumVlm)}
                </td>
                <td className="text-right text-teal-400 text-sm py-2.5 px-2">
                  {formatUSD(state.cumFeesRewardedToReferrer)}
                </td>
                <td className="text-right text-gray-400 text-sm py-2.5 px-2">
                  {formatDate(state.timeJoined)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={sortedStates.length}
        itemLabel="users"
      />
    </div>
  );
}
