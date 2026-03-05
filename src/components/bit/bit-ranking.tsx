'use client';

import Image from 'next/image';
import Link from 'next/link';

// Mock ranking data
const RANKING_DATA = [
  { rank: 1, name: 'Full Name', uid: '--', points: '--' },
  { rank: 2, name: 'Full Name', uid: '--', points: '--' },
  { rank: 3, name: 'Full Name', uid: '--', points: '--' },
  { rank: 4, name: 'Full Name', uid: '--', points: '--' },
  { rank: 5, name: 'Full Name', uid: '--', points: '--' },
  { rank: 6, name: 'Full Name', uid: '--', points: '--' },
  { rank: 7, name: 'Full Name', uid: '--', points: '--' },
  { rank: 8, name: 'Full Name', uid: '--', points: '--' },
  { rank: 9, name: 'Full Name', uid: '--', points: '--' },
  { rank: 10, name: 'Full Name', uid: '--', points: '--' },
];

function StatCard({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <span className="text-[#6b6b6b] text-xs sm:text-sm">{label}</span>
        {action}
      </div>
      <span className="text-white text-xl sm:text-2xl font-semibold">{value}</span>
    </div>
  );
}

export function BitRanking() {
  return (
    <div className="w-full">
      {/* Stats Row */}
      <div className="flex flex-col md:flex-row items-stretch border-b border-[#1a1a1f]">
        <StatCard label="Trading points" value="0" />
        <StatCard
          label="Total Points"
          value="0"
          action={<Link href="#" className="text-[#16DE93] text-sm hover:underline">History</Link>}
        />
        <StatCard label="Pending Claim" value="0" />
        <div className="flex items-center px-3 sm:px-4 py-4 sm:py-6">
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#16DE93] hover:bg-[#16DE93]/90 text-black text-xs sm:text-sm font-medium rounded transition-colors">
            Claim BIT&apos;s
          </button>
        </div>
      </div>

      {/* Table Container with horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center px-3 sm:px-4 py-3 sm:py-4 border-b border-[#1a1a1f] min-w-[400px]">
          <div className="flex-1 text-[#6b6b6b] text-xs sm:text-sm">Weekly Ranking</div>
          <div className="w-24 sm:w-32 md:w-48 text-center text-[#6b6b6b] text-xs sm:text-sm">My UID</div>
          <div className="w-20 sm:w-32 text-right text-[#6b6b6b] text-xs sm:text-sm">Points</div>
        </div>

        {/* Table Body */}
        {RANKING_DATA.map((item) => {
          // Gold for rank 1, silver for rank 2, green for rest
          const iconSrc = item.rank === 1
            ? '/iobit/bits/gold.svg'
            : item.rank === 2
              ? '/iobit/bits/silver.svg'
              : '/iobit/bits/green.svg';

          return (
            <div
              key={item.rank}
              className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#1a1a1f] hover:bg-[#0d0d0f] transition-colors min-w-[400px]"
            >
              <div className="flex-1 flex items-center gap-2 sm:gap-3">
                <Image
                  src={iconSrc}
                  alt="Reward"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-[#16DE93] text-xs sm:text-sm font-medium">{item.rank}</span>
                <span className="text-white text-xs sm:text-sm">{item.name}</span>
              </div>
              <div className="w-24 sm:w-32 md:w-48 text-center text-[#6b6b6b] text-xs sm:text-sm">{item.uid}</div>
              <div className="w-20 sm:w-32 text-right text-[#6b6b6b] text-xs sm:text-sm">{item.points}</div>
            </div>
          );
        })}

        {/* My Stats Footer */}
        <div className="flex items-center px-3 sm:px-4 py-3 sm:py-4 border-t border-[#1a1a1f] min-w-[400px]">
          <div className="flex-1">
            <p className="text-[#6b6b6b] text-[10px] sm:text-xs mb-1">My Weekly Ranking</p>
            <p className="text-white text-base sm:text-xl font-semibold">0</p>
          </div>
          <div className="w-24 sm:w-32 md:w-48 text-center">
            <p className="text-[#6b6b6b] text-[10px] sm:text-xs mb-1">My UID</p>
            <p className="text-white text-base sm:text-xl font-semibold">--</p>
          </div>
          <div className="w-20 sm:w-32 text-right">
            <p className="text-[#6b6b6b] text-[10px] sm:text-xs mb-1">My Points</p>
            <p className="text-white text-base sm:text-xl font-semibold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
