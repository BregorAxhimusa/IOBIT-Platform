'use client';

interface SparklineChartProps {
  prevPrice: number;
  currentPrice: number;
  width?: number;
  height?: number;
}

export function SparklineChart({ prevPrice, currentPrice, width = 80, height = 24 }: SparklineChartProps) {
  if (prevPrice <= 0 && currentPrice <= 0) {
    return <div style={{ width, height }} />;
  }

  const isUp = currentPrice >= prevPrice;
  const color = isUp ? '#2dd4bf' : '#f87171';

  // Generate a simple curve with 4 control points
  const y1 = isUp ? height * 0.75 : height * 0.25;
  const y2 = isUp ? height * 0.55 : height * 0.45;
  const y3 = isUp ? height * 0.4 : height * 0.6;
  const y4 = isUp ? height * 0.2 : height * 0.8;

  const points = `0,${y1} ${width * 0.3},${y2} ${width * 0.6},${y3} ${width},${y4}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
