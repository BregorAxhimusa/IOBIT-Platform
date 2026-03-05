'use client';

import { cn } from '@/lib/utils/cn';

// Volume thresholds for the chart
const VOLUME_THRESHOLDS = ['<4.2B', '4.2B', '7B', '10.5B', '14B'];

// Bar data for the chart
const CHART_DATA = [
  { threshold: '<4.2B', height: 15, active: false },
  { threshold: '4.2B', height: 50, active: true },
  { threshold: '7B', height: 40, active: false },
  { threshold: '10.5B', height: 65, active: false },
  { threshold: '14B', height: 85, active: false },
];

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 sm:px-4 py-4 sm:py-6 md:py-8 border-b border-[#1a1a1f] last:border-b-0">
      <p className="text-[#6b6b6b] text-[10px] sm:text-xs mb-1 sm:mb-2">{label}</p>
      <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">{value}</p>
    </div>
  );
}

function VolumeChart({
  data,
  thresholds,
  title
}: {
  data: typeof CHART_DATA;
  thresholds: string[];
  title: string;
}) {
  return (
    <div className="flex-1">
      {/* Chart Title */}
      <div className="mb-4">
        <span className="text-[#6b6b6b] text-xs">{title}</span>
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between mb-2">
        {thresholds.map((threshold, i) => (
          <span
            key={i}
            className={cn(
              'text-[10px] sm:text-xs',
              data[i]?.active ? 'text-white font-medium' : 'text-[#6b6b6b]'
            )}
          >
            {threshold}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 sm:h-48 pt-4">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-t transition-all duration-300',
              item.active
                ? 'bg-[#16DE93]'
                : 'bg-[#2a2a2f] hover:bg-[#3a3a3f]'
            )}
            style={{ height: `${item.height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function BitOverview() {
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        {/* Left Side - Stats */}
        <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[#1a1a1f]">
          <StatItem
            label="Current Points Pool"
            value="120,000"
          />
          <StatItem
            label="Current Cycle Volume (USD)"
            value="4,788,171,122"
          />
          <StatItem
            label="Next Pool Target (USD)"
            value="7,000,000,000"
          />
        </div>

        {/* Right Side - Chart */}
        <div className="lg:flex-1 px-3 sm:px-4 py-4 lg:py-0">
          <VolumeChart
            data={CHART_DATA}
            thresholds={VOLUME_THRESHOLDS}
            title="Cumulative Vol (USD)"
          />
        </div>
      </div>
    </div>
  );
}
