'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, Time } from 'lightweight-charts';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useWebSocket } from '@/hooks/use-websocket';
import { cn } from '@/lib/utils/cn';
import {
  Maximize2,
  Minimize2,
  BarChart3,
  TrendingUp,
  Activity,
  BarChart4,
  BarChart2,
  Settings
} from 'lucide-react';

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
type ChartType = 'candlestick' | 'line' | 'area' | 'bars';

interface PriceChartProps {
  symbol: string;
}

interface CandleData {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

export function PriceChart({ symbol }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Bar'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const network = useNetworkStore((state) => state.network);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);
  const candleDataRef = useRef<CandleData[]>([]);

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // WebSocket for real-time updates
  const { subscribeToTrades, unsubscribe } = useWebSocket();

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!fullscreenContainerRef.current) return;

    if (!isFullscreen) {
      if (fullscreenContainerRef.current.requestFullscreen) {
        fullscreenContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

    chartRef.current = chart;

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

  // Update chart series when chart type changes
  useEffect(() => {
    if (!chartRef.current || candleDataRef.current.length === 0) return;

    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    // Create new series based on chart type
    let newSeries: ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Bar'>;

    switch (chartType) {
      case 'candlestick':
        newSeries = chartRef.current.addCandlestickSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        });
        break;
      case 'line':
        newSeries = chartRef.current.addLineSeries({
          color: '#3B82F6',
          lineWidth: 2,
        });
        break;
      case 'area':
        newSeries = chartRef.current.addAreaSeries({
          topColor: 'rgba(59, 130, 246, 0.4)',
          bottomColor: 'rgba(59, 130, 246, 0.0)',
          lineColor: '#3B82F6',
          lineWidth: 2,
        });
        break;
      case 'bars':
        newSeries = chartRef.current.addBarSeries({
          upColor: '#10B981',
          downColor: '#EF4444',
        });
        break;
    }

    seriesRef.current = newSeries;

    // Convert and set data based on chart type
    const candles = candleDataRef.current;
    if (chartType === 'candlestick' || chartType === 'bars') {
      const formattedData: CandlestickData<Time>[] = candles.map((candle) => ({
        time: (candle.t / 1000) as Time,
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c),
      }));
      newSeries.setData(formattedData);
      if (formattedData.length > 0) {
        lastCandleRef.current = formattedData[formattedData.length - 1];
      }
    } else {
      // For line and area charts, use close price
      const formattedData: LineData<Time>[] = candles.map((candle) => ({
        time: (candle.t / 1000) as Time,
        value: parseFloat(candle.c),
      }));
      newSeries.setData(formattedData);
      if (candles.length > 0) {
        const lastCandle = candles[candles.length - 1];
        lastCandleRef.current = {
          time: (lastCandle.t / 1000) as Time,
          open: parseFloat(lastCandle.o),
          high: parseFloat(lastCandle.h),
          low: parseFloat(lastCandle.l),
          close: parseFloat(lastCandle.c),
        };
      }
    }
  }, [chartType]);

  // Update volume series when showVolume changes
  useEffect(() => {
    if (!chartRef.current || candleDataRef.current.length === 0) return;

    // Remove existing volume series if it exists
    if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData: HistogramData<Time>[] = candleDataRef.current.map((candle) => ({
        time: (candle.t / 1000) as Time,
        value: parseFloat(candle.v),
        color: parseFloat(candle.c) >= parseFloat(candle.o) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }
  }, [showVolume]);

  // Fetch candle data
  useEffect(() => {
    const fetchCandles = async () => {
      if (!chartRef.current) return;

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
          // Store raw candle data
          candleDataRef.current = candles;

          // Remove existing series
          if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
            seriesRef.current = null;
          }

          // Remove existing volume series
          if (volumeSeriesRef.current) {
            chartRef.current.removeSeries(volumeSeriesRef.current);
            volumeSeriesRef.current = null;
          }

          // Create price series based on chart type
          let newSeries: ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Bar'>;

          switch (chartType) {
            case 'candlestick':
              newSeries = chartRef.current.addCandlestickSeries({
                upColor: '#10B981',
                downColor: '#EF4444',
                borderVisible: false,
                wickUpColor: '#10B981',
                wickDownColor: '#EF4444',
              });
              break;
            case 'line':
              newSeries = chartRef.current.addLineSeries({
                color: '#3B82F6',
                lineWidth: 2,
              });
              break;
            case 'area':
              newSeries = chartRef.current.addAreaSeries({
                topColor: 'rgba(59, 130, 246, 0.4)',
                bottomColor: 'rgba(59, 130, 246, 0.0)',
                lineColor: '#3B82F6',
                lineWidth: 2,
              });
              break;
            case 'bars':
              newSeries = chartRef.current.addBarSeries({
                upColor: '#10B981',
                downColor: '#EF4444',
              });
              break;
          }

          seriesRef.current = newSeries;

          // Set data based on chart type
          if (chartType === 'candlestick' || chartType === 'bars') {
            const formattedData: CandlestickData<Time>[] = candles.map((candle) => ({
              time: (candle.t / 1000) as Time,
              open: parseFloat(candle.o),
              high: parseFloat(candle.h),
              low: parseFloat(candle.l),
              close: parseFloat(candle.c),
            }));
            newSeries.setData(formattedData);
            if (formattedData.length > 0) {
              lastCandleRef.current = formattedData[formattedData.length - 1];
            }
          } else {
            const formattedData: LineData<Time>[] = candles.map((candle) => ({
              time: (candle.t / 1000) as Time,
              value: parseFloat(candle.c),
            }));
            newSeries.setData(formattedData);
            if (candles.length > 0) {
              const lastCandle = candles[candles.length - 1];
              lastCandleRef.current = {
                time: (lastCandle.t / 1000) as Time,
                open: parseFloat(lastCandle.o),
                high: parseFloat(lastCandle.h),
                low: parseFloat(lastCandle.l),
                close: parseFloat(lastCandle.c),
              };
            }
          }

          // Add volume series if enabled
          if (showVolume) {
            const volumeSeries = chartRef.current.addHistogramSeries({
              color: '#26a69a',
              priceFormat: {
                type: 'volume',
              },
              priceScaleId: '',
            });

            volumeSeries.priceScale().applyOptions({
              scaleMargins: {
                top: 0.8,
                bottom: 0,
              },
            });

            const volumeData: HistogramData<Time>[] = candles.map((candle) => ({
              time: (candle.t / 1000) as Time,
              value: parseFloat(candle.v),
              color: parseFloat(candle.c) >= parseFloat(candle.o) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
            }));

            volumeSeries.setData(volumeData);
            volumeSeriesRef.current = volumeSeries;
          }
        }
      } catch (error) {
        console.error('Failed to fetch candles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandles();
  }, [symbol, timeframe, network, chartType, showVolume]);

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

          if (chartType === 'candlestick' || chartType === 'bars') {
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
          } else {
            // For line and area charts
            const lineData: LineData<Time> = {
              time: candleTime,
              value: price,
            };
            seriesRef.current.update(lineData);

            // Update last candle ref for consistency
            if (lastCandleRef.current && lastCandleRef.current.time === candleTime) {
              lastCandleRef.current = {
                ...lastCandleRef.current,
                high: Math.max(lastCandleRef.current.high, price),
                low: Math.min(lastCandleRef.current.low, price),
                close: price,
              };
            } else {
              lastCandleRef.current = {
                time: candleTime,
                open: price,
                high: price,
                low: price,
                close: price,
              };
            }
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
  }, [symbol, timeframe, isLoading, subscribeToTrades, unsubscribe, chartType]);

  const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'candlestick', icon: <BarChart4 className="w-4 h-4" />, label: 'Candlestick' },
    { type: 'bars', icon: <BarChart2 className="w-4 h-4" />, label: 'Bars' },
    { type: 'line', icon: <TrendingUp className="w-4 h-4" />, label: 'Line' },
    { type: 'area', icon: <Activity className="w-4 h-4" />, label: 'Area' },
  ];

  return (
    <div
      ref={fullscreenContainerRef}
      className={cn(
        'flex flex-col bg-gray-950 border border-gray-800 rounded-lg relative z-0',
        isFullscreen ? 'h-screen w-screen' : 'h-full'
      )}
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-wrap gap-3">
        {/* Symbol */}
        <h3 className="text-sm font-semibold text-white">{symbol}/USD</h3>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1">
            {chartTypes.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                title={label}
                className={cn(
                  'p-2 rounded transition-colors',
                  chartType === type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-700" />

          {/* Volume Toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            title="Toggle Volume"
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors',
              showVolume
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Volume
          </button>

          {/* Settings (Placeholder) */}
          <button
            title="Settings"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-700" />

          {/* Timeframe Selector */}
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
