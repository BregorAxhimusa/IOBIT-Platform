'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

type VaultTab = 'accumulative' | 'daily';
type TimePeriod = '1W' | '1M' | '3M' | '6M' | '1Y';

const VAULT_TABS: { key: VaultTab; label: string }[] = [
  { key: 'accumulative', label: 'Accumulative Rewards' },
  { key: 'daily', label: 'Daily Rewards' },
];

const TIME_PERIODS: TimePeriod[] = ['1W', '1M', '3M', '6M', '1Y'];

function AccumulativeRewardsChart({ period }: { period: TimePeriod }) {
  // Generate data based on period
  const getDataPoints = () => {
    const counts = { '1W': 7, '1M': 30, '3M': 12, '6M': 24, '1Y': 12 };
    const count = counts[period];
    const points: number[] = [0];
    for (let i = 1; i < count; i++) {
      points.push(points[i - 1] + Math.random() * 15 + 5);
    }
    return points;
  };

  const getLabels = () => {
    switch (period) {
      case '1W': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '1M': return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case '3M': return ['Jan', 'Feb', 'Mar'];
      case '6M': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      case '1Y': return ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
      default: return [];
    }
  };

  const dataPoints = getDataPoints();
  const labels = getLabels();
  const maxValue = Math.max(...dataPoints);

  // Generate SVG path points
  const points = dataPoints.map((v, i) => {
    const x = (i / (dataPoints.length - 1)) * 100;
    const y = 100 - (v / maxValue) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="h-64 bg-[#0d0d0f] rounded-lg border border-[#1a1a1f] p-4">
      <div className="h-full flex">
        {/* Y-axis labels */}
        <div className="h-full flex flex-col justify-between text-[10px] text-[#6b6b6b] pr-3 py-2">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>
        {/* Chart area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-b border-[#1a1a1f]" />
              <div className="border-b border-[#1a1a1f]" />
              <div className="border-b border-[#1a1a1f]" />
            </div>
            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="vaultAccGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#16DE93" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#16DE93" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`M 0,100 L ${points.join(' L ')} L 100,100 Z`}
                fill="url(#vaultAccGradient)"
              />
              {/* Line */}
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="#16DE93"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: '2px' }}
              />
              {/* Dots */}
              {dataPoints.map((v, i) => {
                const x = (i / (dataPoints.length - 1)) * 100;
                const y = 100 - (v / maxValue) * 100;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1"
                    fill="#16DE93"
                    style={{ r: '1.5px' }}
                  />
                );
              })}
            </svg>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] text-[#6b6b6b] pt-3">
            {labels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyRewardsChart({ period }: { period: TimePeriod }) {
  // Generate data based on period
  const getDataAndLabels = () => {
    switch (period) {
      case '1W':
        return {
          data: [12, 8, 15, 6, 20, 10, 14],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
      case '1M':
        return {
          data: [45, 32, 58, 41, 67, 55, 48, 62, 38, 71, 44, 53],
          labels: ['W1', 'W2', 'W3', 'W4', '', '', '', '', '', '', '', '']
        };
      case '3M':
        return {
          data: [120, 145, 98, 167, 134, 189, 156, 112, 178, 143, 165, 128],
          labels: ['Jan', '', '', 'Feb', '', '', 'Mar', '', '', '', '', '']
        };
      case '6M':
        return {
          data: [250, 320, 280, 410, 350, 390],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        };
      case '1Y':
        return {
          data: [520, 680, 590, 820, 710, 890, 760, 640, 930, 850, 780, 920],
          labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
        };
      default:
        return { data: [], labels: [] };
    }
  };

  const { data: dataPoints, labels } = getDataAndLabels();
  const maxValue = Math.max(...dataPoints);

  return (
    <div className="h-64 bg-[#0d0d0f] rounded-lg border border-[#1a1a1f] p-4">
      <div className="h-full flex">
        {/* Y-axis labels */}
        <div className="h-full flex flex-col justify-between text-[10px] text-[#6b6b6b] pr-3 py-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>
        {/* Chart area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-[#1a1a1f]" />
              <div className="border-b border-[#1a1a1f]" />
              <div className="border-b border-[#1a1a1f]" />
            </div>
            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around gap-1 px-1">
              {dataPoints.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 max-w-[32px] bg-gradient-to-t from-[#16DE93] to-[#16DE93]/60 rounded-t transition-all duration-300 hover:from-[#16DE93] hover:to-[#16DE93]/80"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-around text-[10px] text-[#6b6b6b] pt-3">
            {labels.map((label, i) => (
              <span key={i} className="flex-1 text-center">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VaultRewards() {
  const [activeTab, setActiveTab] = useState<VaultTab>('accumulative');
  const [period, setPeriod] = useState<TimePeriod>('1W');

  return (
    <div className="px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Side - Chart */}
        <div className="pt-4 md:pt-6 pb-4 md:pb-6">
          {/* Tabs and Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            {/* Rewards Tabs */}
            <div className="flex items-center border border-[#2a2a2f] rounded-lg overflow-hidden bg-[#0a0a0c]">
              {VAULT_TABS.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.key
                      ? 'bg-[#1a1a1f] text-white'
                      : 'text-[#6b6b6b] hover:text-white',
                    index > 0 && 'border-l border-[#2a2a2f]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Period Selector */}
            <div className="flex items-center gap-1 md:gap-2">
              {TIME_PERIODS.map((tp) => (
                <button
                  key={tp}
                  onClick={() => setPeriod(tp)}
                  className={cn(
                    'px-1.5 md:px-2 py-1 text-[10px] md:text-xs font-medium transition-colors',
                    period === tp
                      ? 'text-white'
                      : 'text-[#6b6b6b] hover:text-white'
                  )}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          {activeTab === 'accumulative' ? <AccumulativeRewardsChart period={period} /> : <DailyRewardsChart period={period} />}
        </div>

        {/* Right Side - Stats */}
        <div className="border-t lg:border-t-0 lg:border-l border-[#1a1a1f] pt-4 lg:pt-0 lg:pl-6">
          {/* Commission Rate Badge */}
          <div className="pt-2 lg:pt-6 mb-4 md:mb-6">
            <span className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
              Commission rate 5%
            </span>
          </div>

          {/* eLP Vault Quota */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-white text-base md:text-lg font-medium">eLP Vault Quota</h3>
          </div>

          {/* Your Total Affiliate Points */}
          <div className="mb-4 md:mb-6">
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mb-1">Your Total Affiliate Points</p>
            <p className="text-white">
              <span className="text-2xl md:text-3xl font-bold">0</span><span className="text-[#6b6b6b] text-xs md:text-sm font-normal">points</span>
            </p>
            <p className="text-[#6b6b6b] text-[10px] md:text-xs mt-3 md:mt-4">
              Earn more points by referring friends. Each friend&apos;s trading activity contributes to your affiliate rewards!
            </p>
          </div>

          {/* Lifetime Points Earned */}
          <div className="pb-4 md:pb-6">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-yellow-400">💡</span>
              <span className="text-[#16DE93]">Lifetime Points Earned: 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
