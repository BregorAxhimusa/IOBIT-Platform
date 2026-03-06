'use client';

import { useState, useEffect } from 'react';

// Data points for the chart
const earningsData = [
  { traders: 30, earnings: 420 },
  { traders: 60, earnings: 1200 },
  { traders: 90, earnings: 2451 },
  { traders: 120, earnings: 3950 },
  { traders: 150, earnings: 5800 },
  { traders: 180, earnings: 8000 },
  { traders: 210, earnings: 9700 },
];

// CountUp animation component
function CountUp({
  from = 0,
  to,
  duration = 1.5,
  className,
}: {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    setCount(from);
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Linear interpolation
      setCount(Math.floor(from + (to - from) * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span className={className}>{count.toLocaleString()}</span>;
}

// Calculate chart points with coordinates
function getChartCoordinates() {
  const maxEarnings = 9700;
  return earningsData.map((d, i) => ({
    ...d,
    x: 50 + i * 50, // X: 50, 100, 150, 200, 250, 300, 350
    y: 250 - (d.earnings / maxEarnings) * 120, // Y scaled to chart height
  }));
}

// Generate pixelated path with 8px grid snapping
function getPixelatedPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';

  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Create 6 sub-steps between points for pixelated effect
    for (let step = 1; step <= 6; step++) {
      const t = step / 6;
      const x = prev.x + (curr.x - prev.x) * t;
      const y = prev.y + (curr.y - prev.y) * t;

      // Round to 8px grid for pixel effect
      const pixelX = Math.round(x / 8) * 8;
      const pixelY = Math.round(y / 8) * 8;
      pathData += ` L ${pixelX} ${pixelY}`;
    }
  }

  return pathData;
}

export function EarningsChart() {
  const [activeTrader, setActiveTrader] = useState(120);
  const chartPoints = getChartCoordinates();
  const pixelPath = getPixelatedPath(chartPoints);

  // Find active point
  const activePoint = chartPoints.find((p) => p.traders === activeTrader);
  const activeData = earningsData.find((d) => d.traders === activeTrader);

  // Button styles
  const buttonActiveStyle = {
    backgroundColor: 'rgba(22, 222, 147, 0.01)',
    border: '1px solid rgba(22, 222, 147, 0.1)',
    boxShadow: 'inset 0 0 8px rgba(22, 222, 147, 0.2)',
  };

  const buttonInactiveStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      {/* Chart Container */}
      <div className="relative w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[580px]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 300"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Chart gradient (fill under line) */}
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#080808" stopOpacity="0.5" />
            </linearGradient>

            {/* Line gradient */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#17D78F" />
              <stop offset="100%" stopColor="#17D78F" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glowFilter" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Grid background pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Background layers */}
          <rect width="100%" height="100%" fill="transparent" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Gradient fill under the line */}
          <path d={`${pixelPath} L 350 250 L 50 250 Z`} fill="url(#chartGradient)" />

          {/* Pixelated chart line with glow */}
          <path
            d={pixelPath}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
            filter="url(#glowFilter)"
            opacity="0.5"
          />

          {/* Dashed connection line (active point only) */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2={280}
              stroke="#00FF88"
              strokeOpacity="1"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}

          {/* Diamond data points */}
          {chartPoints.map((point) => {
            const isActive = point.traders === activeTrader;
            return (
              <g
                key={point.traders}
                onMouseEnter={() => setActiveTrader(point.traders)}
                className="cursor-pointer"
              >
                {/* Clickable area */}
                <circle cx={point.x} cy={point.y} r="15" fill="transparent" />
                {/* Diamond shape */}
                <polygon
                  points={`${point.x},${point.y - 4} ${point.x + 4},${point.y} ${point.x},${point.y + 4} ${point.x - 4},${point.y}`}
                  fill={isActive ? '#00FF88' : 'rgba(0, 255, 136, 0.4)'}
                  stroke={isActive ? '#00FF88' : 'rgba(0, 255, 136, 0.6)'}
                  strokeWidth={isActive ? '2' : '1'}
                  style={{
                    filter: isActive
                      ? 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))'
                      : 'drop-shadow(0 0 3px rgba(0, 255, 136, 0.4))',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip (HTML positioned over SVG) */}
        {activePoint && activeData && (
          <div
            className="pointer-events-none absolute min-w-[120px] rounded-[5px] p-3 text-left backdrop-blur-sm"
            style={{
              left: `${(activePoint.x / 400) * 100}%`,
              top: `${(activePoint.y / 300) * 100}%`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px',
              zIndex: 1,
              backgroundColor: 'rgba(102, 102, 102, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p className="text-[12px] font-light text-[#E0E0E0]">Potential</p>
            <p className="text-[12px] font-light text-[#E0E0E0]">earnings/month</p>
            <p className="mt-1 text-[14px] font-medium text-[#00FF88]">
              ≈<CountUp key={activeTrader} from={0} to={activeData.earnings} duration={1.5} /> USDT
            </p>
          </div>
        )}
      </div>

      {/* Trader buttons row */}
      <div className="flex w-full flex-wrap justify-center gap-2 pb-6 pt-4 sm:pb-10 md:gap-3 lg:gap-4">
        {earningsData.map((data) => {
          const isActive = data.traders === activeTrader;
          return (
            <button
              key={data.traders}
              className={`cursor-pointer rounded-[5px] px-3 py-2 text-[10px] sm:px-4 sm:py-3 sm:text-[12px] md:px-5 md:py-3 md:text-[14px] ${
                isActive ? 'text-[#00FF88] shadow-lg' : 'text-white'
              }`}
              style={isActive ? buttonActiveStyle : buttonInactiveStyle}
              onMouseEnter={() => setActiveTrader(data.traders)}
            >
              {data.traders}
              {isActive && <span className="hidden sm:inline"> traders</span>}
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-2 px-4 pb-6 text-right text-[10px] text-[#4C4F52] sm:mt-4 sm:pb-10 sm:text-[12px]">
        * Based on affiliates&apos; average earnings
      </p>
    </div>
  );
}
