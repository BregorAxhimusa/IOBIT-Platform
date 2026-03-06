'use client';

import { useMemo } from 'react';

interface SparklineChartProps {
  symbol: string;
  prevPrice: number;
  currentPrice: number;
  width?: number;
  height?: number;
}

// Generate deterministic pseudo-random number based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Hash string to number for unique seed per symbol
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate realistic price movement data with more points for smoother curves
function generateSparklineData(symbol: string, prevPrice: number, currentPrice: number, points: number = 32): number[] {
  if (prevPrice <= 0 && currentPrice <= 0) return [];

  const data: number[] = [];
  const priceDiff = currentPrice - prevPrice;
  const symbolHash = hashString(symbol);
  const seed = symbolHash * 1000 + Math.abs(Math.floor(prevPrice * 100));

  // Start from previous price
  data.push(prevPrice);

  // Generate intermediate points with realistic volatility
  for (let i = 1; i < points - 1; i++) {
    const progress = i / (points - 1);
    const targetPrice = prevPrice + priceDiff * progress;

    // Add unique noise/volatility based on symbol
    const baseVolatility = Math.abs(priceDiff) * 0.35;
    const symbolVolatility = (seededRandom(symbolHash + i * 7) * 0.3 + 0.7);
    const noise = (seededRandom(seed + i * 13) - 0.5) * baseVolatility * symbolVolatility;

    // Multiple wave patterns for more organic movement
    const wave1 = Math.sin(i * (0.2 + seededRandom(symbolHash) * 0.3)) * baseVolatility * 0.25;
    const wave2 = Math.sin(i * (0.5 + seededRandom(symbolHash + 1) * 0.2)) * baseVolatility * 0.15;

    const price = targetPrice + noise + wave1 + wave2;
    data.push(price);
  }

  // End at current price
  data.push(currentPrice);

  return data;
}

// Generate smooth bezier curve path (like CoinMarketCap)
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Bezier conversion for smooth curves
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function SparklineChart({ symbol, prevPrice, currentPrice, width = 100, height = 32 }: SparklineChartProps) {
  const data = useMemo(() =>
    generateSparklineData(symbol, prevPrice, currentPrice, 32),
    [symbol, prevPrice, currentPrice]
  );

  const { linePath, areaPath, gradientId } = useMemo(() => {
    if (data.length === 0) return { linePath: '', areaPath: '', gradientId: '' };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const paddingX = 2;
    const paddingY = 4;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = data.map((value, index) => ({
      x: paddingX + (index / (data.length - 1)) * chartWidth,
      y: paddingY + chartHeight - ((value - min) / range) * chartHeight,
    }));

    const linePath = generateSmoothPath(points);

    // Create area path for gradient fill
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPoint.x.toFixed(2)} ${height} L ${firstPoint.x.toFixed(2)} ${height} Z`;

    const gradientId = `gradient-${symbol}-${Math.abs(hashString(symbol)) % 10000}`;

    return { linePath, areaPath, gradientId };
  }, [data, width, height, symbol]);

  if (data.length === 0) {
    return <div style={{ width, height }} className="bg-[#1a1a1f] rounded" />;
  }

  const isUp = currentPrice >= prevPrice;
  const color = isUp ? '#16DE93' : '#F6465D';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Gradient fill area */}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />
      {/* Smooth line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
