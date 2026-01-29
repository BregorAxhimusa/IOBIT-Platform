'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useWebSocket } from '@/hooks/use-websocket';
import { cn } from '@/lib/utils/cn';

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

interface PriceChartProps {
  symbol: string;
}

export function PriceChart({ symbol }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [isLoading, setIsLoading] = useState(true);
  const network = useNetworkStore((state) => state.network);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // WebSocket for real-time updates
  const { subscribeToTrades, unsubscribe } = useWebSocket();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#000000' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1F2937',
      },
      timeScale: {
        borderColor: '#1F2937',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Lightweight-charts v4.x API
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch candle data
  useEffect(() => {
    const fetchCandles = async () => {
      if (!seriesRef.current) return;

      setIsLoading(true);
      try {
        const client = getInfoClient(network);

        // Calculate time range for candles
        const endTime = Date.now();
        const candleCount = 500;

        // Calculate interval in milliseconds
        const intervalMs: Record<Timeframe, number> = {
          '1m': 60 * 1000,
          '5m': 5 * 60 * 1000,
          '15m': 15 * 60 * 1000,
          '1h': 60 * 60 * 1000,
          '4h': 4 * 60 * 60 * 1000,
          '1D': 24 * 60 * 60 * 1000,
        };

        const startTime = endTime - (candleCount * intervalMs[timeframe]);

        const candles = await client.getCandleSnapshot(symbol, timeframe, startTime, endTime);

        if (candles && candles.length > 0) {
          const formattedData: CandlestickData<Time>[] = candles.map((candle) => ({
            time: (candle.t / 1000) as Time,
            open: parseFloat(candle.o),
            high: parseFloat(candle.h),
            low: parseFloat(candle.l),
            close: parseFloat(candle.c),
          }));

          seriesRef.current.setData(formattedData);

          // Store the last candle for real-time updates
          if (formattedData.length > 0) {
            lastCandleRef.current = formattedData[formattedData.length - 1];
          }
        }
      } catch (error) {
        console.error('Failed to fetch candles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandles();
  }, [symbol, timeframe, network]);

  // Subscribe to real-time trades for chart updates
  useEffect(() => {
    if (!seriesRef.current || isLoading) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTrade = (data: any) => {
      try {
        if (data && Array.isArray(data) && data.length > 0) {
          const trade = data[0];
          const price = parseFloat(trade.px);
          const timestamp = Math.floor(trade.time / 1000) as Time;

          // Get timeframe interval in seconds
          const getIntervalSeconds = (tf: Timeframe): number => {
            const map: Record<Timeframe, number> = {
              '1m': 60,
              '5m': 300,
              '15m': 900,
              '1h': 3600,
              '4h': 14400,
              '1D': 86400,
            };
            return map[tf];
          };

          const intervalSeconds = getIntervalSeconds(timeframe);
          const candleTime = Math.floor(timestamp as number / intervalSeconds) * intervalSeconds as Time;

          // Update or create new candle
          if (!seriesRef.current) return;

          if (lastCandleRef.current && lastCandleRef.current.time === candleTime) {
            // Update existing candle
            const updatedCandle: CandlestickData<Time> = {
              ...lastCandleRef.current,
              high: Math.max(lastCandleRef.current.high, price),
              low: Math.min(lastCandleRef.current.low, price),
              close: price,
            };
            lastCandleRef.current = updatedCandle;
            seriesRef.current.update(updatedCandle);
          } else {
            // Create new candle
            const newCandle: CandlestickData<Time> = {
              time: candleTime,
              open: price,
              high: price,
              low: price,
              close: price,
            };
            lastCandleRef.current = newCandle;
            seriesRef.current.update(newCandle);
          }
        }
      } catch (error) {
        console.error('Error updating chart with trade:', error);
      }
    };

    const subscription = subscribeToTrades(symbol, handleTrade);

    return () => {
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [symbol, timeframe, isLoading, subscribeToTrades, unsubscribe]);

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-lg relative z-0">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">{symbol}/USD</h3>

        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded transition-colors',
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 z-10">
            <div className="text-gray-400 text-sm">Loading chart...</div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
