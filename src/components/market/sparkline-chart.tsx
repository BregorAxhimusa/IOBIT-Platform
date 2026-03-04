'use client';

interface SparklineChartProps {
  prevPrice: number;
  currentPrice: number;
  width?: number;
  height?: number;
}

export function SparklineChart({ prevPrice, currentPrice, width = 100, height = 32 }: SparklineChartProps) {
  if (prevPrice <= 0 && currentPrice <= 0) {
    return <div style={{ width, height }} className="bg-[#1a1a1f] rounded" />;
  }

  const isUp = currentPrice >= prevPrice;
  const color = isUp ? '#16DE93' : '#F6465D';
  const gradientId = `gradient-${Math.random().toString(36).slice(2)}`;

  // Generate a smooth curve with multiple control points for a more natural look
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const y1 = isUp ? chartHeight * 0.8 : chartHeight * 0.2;
  const y2 = isUp ? chartHeight * 0.6 : chartHeight * 0.4;
  const y3 = isUp ? chartHeight * 0.35 : chartHeight * 0.65;
  const y4 = isUp ? chartHeight * 0.45 : chartHeight * 0.55;
  const y5 = isUp ? chartHeight * 0.2 : chartHeight * 0.8;

  const points = [
    [0, y1],
    [chartWidth * 0.2, y2],
    [chartWidth * 0.4, y3],
    [chartWidth * 0.7, y4],
    [chartWidth, y5],
  ].map(([x, y]) => `${x + padding},${y + padding}`).join(' ');

  // Create area fill path
  const areaPath = `M${padding},${y1 + padding} ` +
    `L${chartWidth * 0.2 + padding},${y2 + padding} ` +
    `L${chartWidth * 0.4 + padding},${y3 + padding} ` +
    `L${chartWidth * 0.7 + padding},${y4 + padding} ` +
    `L${chartWidth + padding},${y5 + padding} ` +
    `L${chartWidth + padding},${height} ` +
    `L${padding},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
