'use client';

import { useEffect, useRef, memo } from 'react';

interface PriceChartProps {
  symbol: string;
}

// Declare TradingView on window
declare global {
  interface Window {
    TradingView?: {
      widget: new (config: unknown) => unknown;
    };
  }
}

function PriceChartComponent({ symbol }: PriceChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<unknown>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    // Capture the container element for cleanup
    const containerElement = container.current;

    // Detect mobile for responsive config
    const isMobile = window.innerWidth < 768;

    // Extract base symbol (e.g., BTC from BTC-USD, BTCUSD, BTC/USD)
    const baseSymbol = symbol
      .replace('-USD', '')
      .replace('/USD', '')
      .replace(/USD$/i, '')
      .replace(/USDT$/i, '');

    // Map some symbols to their TradingView equivalents
    const symbolMappings: Record<string, string> = {
      'HYPE': 'HYPERLIQUID:HYPE',
      'PURR': 'HYPERLIQUID:PURR',
    };

    // Use mapping if available, otherwise default to Binance
    const tradingViewSymbol = symbolMappings[baseSymbol] || `BINANCE:${baseSymbol}USDT`;

    // Remove existing script if present
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_TRADINGVIEW_CDN || 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.type = 'text/javascript';
    scriptRef.current = script;

    // Inject CSS for TradingView after it loads
    const injectTradingViewStyles = () => {
      const styleId = 'tradingview-custom-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          #widget-container,
          #tradingview_advanced,
          .tradingview-widget-container,
          .tradingview-widget-container iframe {
            background: #0a0a0c !important;
            border-color: #1a1a1f !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    script.onload = () => {
      if (window.TradingView && container.current) {
        // Clear container
        container.current.innerHTML = '';

        // Inject styles after TradingView loads
        injectTradingViewStyles();

        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: tradingViewSymbol,
          interval: isMobile ? '60' : '15',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview_advanced',

          // Width and height
          width: '100%',
          height: '100%',

          // Toolbar background - make it visible
          toolbar_bg: '#0a0a0a',

          // Responsive toolbar visibility
          hide_top_toolbar: false,
          hide_legend: isMobile,
          hide_side_toolbar: isMobile,
          hide_volume: false,

          // Enable features based on screen size
          enabled_features: [
            ...(isMobile ? [] : ['left_toolbar']),
            'control_bar',
            'timeframes_toolbar',
            'header_widget',
            'header_resolutions',
            'header_chart_type',
            'header_settings',
            ...(isMobile ? [] : ['header_compare', 'header_undo_redo']),
            'header_screenshot',
            'header_fullscreen_button',
            'header_symbol_search',
            'use_localstorage_for_settings',
          ],

          disabled_features: [
            ...(isMobile ? ['left_toolbar', 'header_compare', 'header_undo_redo'] : []),
          ],

          // Studies/Indicators to load by default
          studies: [],

          // Override colors to match our theme
          overrides: {
            'paneProperties.background': '#0a0a0c',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': '#1F2937',
            'paneProperties.horzGridProperties.color': '#1F2937',
            'paneProperties.legendProperties.showStudyArguments': true,
            'paneProperties.legendProperties.showStudyTitles': true,
            'paneProperties.legendProperties.showStudyValues': true,
            'paneProperties.legendProperties.showSeriesTitle': true,
            'paneProperties.legendProperties.showSeriesOHLC': true,

            'mainSeriesProperties.candleStyle.upColor': '#16DE93',
            'mainSeriesProperties.candleStyle.downColor': '#f6465d',
            'mainSeriesProperties.candleStyle.borderUpColor': '#16DE93',
            'mainSeriesProperties.candleStyle.borderDownColor': '#f6465d',
            'mainSeriesProperties.candleStyle.wickUpColor': '#16DE93',
            'mainSeriesProperties.candleStyle.wickDownColor': '#f6465d',

            'mainSeriesProperties.hollowCandleStyle.upColor': '#16DE93',
            'mainSeriesProperties.hollowCandleStyle.downColor': '#f6465d',
            'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#16DE93',
            'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#f6465d',
            'mainSeriesProperties.hollowCandleStyle.wickUpColor': '#16DE93',
            'mainSeriesProperties.hollowCandleStyle.wickDownColor': '#f6465d',

            'mainSeriesProperties.haStyle.upColor': '#16DE93',
            'mainSeriesProperties.haStyle.downColor': '#f6465d',
            'mainSeriesProperties.haStyle.borderUpColor': '#16DE93',
            'mainSeriesProperties.haStyle.borderDownColor': '#f6465d',
            'mainSeriesProperties.haStyle.wickUpColor': '#16DE93',
            'mainSeriesProperties.haStyle.wickDownColor': '#f6465d',

            'mainSeriesProperties.barStyle.upColor': '#16DE93',
            'mainSeriesProperties.barStyle.downColor': '#f6465d',

            'mainSeriesProperties.lineStyle.color': '#3B82F6',
            'mainSeriesProperties.lineStyle.linewidth': 2,

            'mainSeriesProperties.areaStyle.color1': 'rgba(59, 130, 246, 0.28)',
            'mainSeriesProperties.areaStyle.color2': 'rgba(59, 130, 246, 0.05)',
            'mainSeriesProperties.areaStyle.linecolor': '#3B82F6',
            'mainSeriesProperties.areaStyle.linewidth': 2,

            'scalesProperties.textColor': '#9CA3AF',
            'scalesProperties.lineColor': '#1F2937',
            'scalesProperties.fontSize': isMobile ? 10 : 12,
          },

          // Studies overrides (indicators styling)
          studies_overrides: {
            'volume.volume.color.0': 'rgba(246, 70, 93, 0.5)',
            'volume.volume.color.1': 'rgba(22, 222, 147, 0.5)',
            'volume.volume.transparency': 50,
            'volume.volume ma.color': '#3B82F6',
            'volume.volume ma.transparency': 30,
            'volume.volume ma.linewidth': 2,
          },

          // Loading screen
          loading_screen: {
            backgroundColor: '#0a0a0c',
            foregroundColor: '#16DE93',
          },

          // Custom CSS
          custom_css_url: '',
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
      if (containerElement) {
        containerElement.innerHTML = '';
      }
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [symbol]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0c] rounded-lg overflow-hidden border border-[#1a1a1f]">
      <div
        ref={container}
        id="tradingview_advanced"
        className="absolute inset-0"
      />
    </div>
  );
}

export const PriceChart = memo(PriceChartComponent);
