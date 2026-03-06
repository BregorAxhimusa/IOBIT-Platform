'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatAddress } from '@/lib/utils/format';
import type { BlockEntry } from './types';

interface BlocksTableProps {
  data: BlockEntry[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
}

export function BlocksTable({
  data,
  isLoading,
  error,
  emptyMessage = 'No blocks found',
}: BlocksTableProps) {
  const router = useRouter();

  const handleRowClick = (blockNumber: number) => {
    router.push(`/explorer/block?block=${blockNumber}`);
  };

  return (
    <div className="overflow-x-auto scrollbar-dark">
      <table className="w-full min-w-[600px] text-xs md:text-sm">
        <thead>
          <tr className="text-[#8A8A8E] text-[10px] md:text-xs border-b border-[#1a1a1f]">
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Block</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Time</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Transactions</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Proposer</th>
            <th className="text-left py-3 md:py-4 px-3 md:px-4 font-medium whitespace-nowrap">Hash</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-[#1a1a1f]">
                <td className="py-3 px-3 md:px-4"><div className="w-20 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-16 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-12 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
                <td className="py-3 px-3 md:px-4"><div className="w-24 h-4 bg-[#1a1a1f] animate-pulse rounded" /></td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={5} className="py-12 md:py-16 text-center text-[#f6465d] text-xs md:text-sm">
                Error loading blocks. Please try again later.
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 md:py-16 text-center">
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <Image
                    src="/iobit/landingpage/nofound.svg"
                    alt="No data"
                    width={40}
                    height={40}
                    className="opacity-50 md:w-12 md:h-12"
                  />
                  <p className="text-[#8A8A8E] text-xs md:text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((block) => (
              <tr
                key={block.blockNumber}
                onClick={() => handleRowClick(block.blockNumber)}
                className="border-b border-[#1a1a1f] last:border-b-0 hover:bg-[#16DE93]/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-3 px-3 md:px-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/iobit/more/block.svg"
                      alt="Block"
                      width={16}
                      height={16}
                      className="w-4 h-4 md:w-5 md:h-5"
                    />
                    <span className="text-[#16DE93] font-medium">{block.blockNumber}</span>
                  </div>
                </td>
                <td className="py-3 px-3 md:px-4 text-white">{block.time}</td>
                <td className="py-3 px-3 md:px-4 text-white">{block.transactions}</td>
                <td className="py-3 px-3 md:px-4">
                  <span className="text-white">{formatAddress(block.proposer)}</span>
                </td>
                <td className="py-3 px-3 md:px-4">
                  <span className="text-[#16DE93]">{formatAddress(block.hash)}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
