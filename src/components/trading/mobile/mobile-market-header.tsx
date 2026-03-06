'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { formatPrice, formatPercentage, formatCompactNumber } from '@/lib/utils/format';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileMarketHeaderProps {
  symbol: string;
  price: number;
  change24h: number;
  volume24h?: string;
  openInterest?: string;
  funding?: string;
  high24h?: number;
  low24h?: number;
  isSpot?: boolean;
  onSymbolClick?: () => void;
}

// Known symbols with coin icons
const SYMBOLS_WITH_ICONS = new Set([
  'AAVE', 'ADA', 'AERO', 'ALGO', 'APE', 'APT', 'AR', 'ARB', 'ATOM', 'AVAX',
  'AXS', 'BCH', 'BERA', 'BLUR', 'BLZ', 'BNB', 'BOME', 'BONK', 'BSV', 'BTC',
  'CAKE', 'CELO', 'COMP', 'CRV', 'DASH', 'DOGE', 'DOT', 'DYDX', 'DYM', 'EIGEN',
  'ENA', 'ENJ', 'ENS', 'EOS', 'ETC', 'ETH', 'ETHFI', 'FET', 'FIL', 'FTM',
  'FTT', 'FXS', 'GALA', 'GMT', 'GMX', 'GRT', 'HBAR', 'HYPE', 'ICP', 'IMX',
  'INJ', 'IO', 'IOTA', 'JTO', 'JUP', 'KAS', 'LDO', 'LINK', 'LTC', 'MANA',
  'MANTA', 'MATIC', 'MEME', 'MKR', 'MOVE', 'NEAR', 'NEO', 'NOT', 'OM', 'OMNI',
  'ONDO', 'OP', 'ORDI', 'PAXG', 'PENDLE', 'PENGU', 'PEOPLE', 'PEPE', 'PNUT',
  'POPCAT', 'PYTH', 'RENDER', 'RNDR', 'RSR', 'RUNE', 'SAGA', 'SAND', 'SEI',
  'SHIB', 'SNX', 'SOL', 'STRK', 'STX', 'SUI', 'SUSHI', 'TAO', 'TIA', 'TON',
  'TRUMP', 'TRX', 'UNI', 'USUAL', 'VET', 'VIRTUAL', 'W', 'WIF', 'WLD', 'XLM',
  'XMR', 'XRP', 'YGG', 'ZEC', 'ZETA', 'ZK', 'ZRO'
]);

export function MobileMarketHeader({
  symbol,
  price,
  change24h,
  volume24h,
  openInterest,
  funding,
  high24h,
  low24h,
  isSpot = false,
  onSymbolClick,
}: MobileMarketHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const isPositive = change24h >= 0;
  const baseSymbol = symbol.split('/')[0].split('-')[0];

  return (
    <div className="lg:hidden bg-[#0a0a0c] border-b border-[#1a1a1f]">
      {/* Main Header Row */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Symbol & Price */}
        <button
          onClick={onSymbolClick}
          className="flex items-center gap-2"
        >
          {SYMBOLS_WITH_ICONS.has(baseSymbol) && (
            <Image
              src={`/icons/coins/${baseSymbol}.png`}
              alt={baseSymbol}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full"
            />
          )}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1">
              <span className="text-white text-base font-medium">
                {isSpot ? symbol : `${baseSymbol}/USD`}
              </span>
              <ChevronDown className="w-4 h-4 text-[#56565B]" />
            </div>
            <span className="text-[10px] text-[#56565B]">Perpetual</span>
          </div>
        </button>

        {/* Right: Price & Change */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white text-lg font-medium tabular-nums">
              ${price > 0 ? formatPrice(price, price > 100 ? 2 : 4) : '--'}
            </div>
            <div
              className={cn(
                'text-xs font-medium tabular-nums',
                isPositive ? 'text-[#16DE93]' : 'text-[#f6465d]'
              )}
            >
              {isPositive ? '+' : ''}{formatPercentage(change24h)}
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-[#1a1a1f] text-[#56565B]"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Info */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#1a1a1f]">
          <div className="grid grid-cols-3 gap-3">
            {/* 24h Volume */}
            <div>
              <div className="text-[10px] text-[#56565B] uppercase">24h Vol</div>
              <div className="text-xs text-white tabular-nums">
                ${volume24h ? formatCompactNumber(volume24h) : '--'}
              </div>
            </div>

            {/* Open Interest */}
            {!isSpot && (
              <div>
                <div className="text-[10px] text-[#56565B] uppercase">Open Int.</div>
                <div className="text-xs text-white tabular-nums">
                  ${openInterest ? formatCompactNumber(openInterest) : '--'}
                </div>
              </div>
            )}

            {/* Funding Rate */}
            {!isSpot && funding && (
              <div>
                <div className="text-[10px] text-[#56565B] uppercase">Funding</div>
                <div
                  className={cn(
                    'text-xs tabular-nums',
                    parseFloat(funding) >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                  )}
                >
                  {(parseFloat(funding) * 100).toFixed(4)}%
                </div>
              </div>
            )}

            {/* 24h High */}
            {high24h && (
              <div>
                <div className="text-[10px] text-[#56565B] uppercase">24h High</div>
                <div className="text-xs text-[#16DE93] tabular-nums">
                  ${formatPrice(high24h, high24h > 100 ? 2 : 4)}
                </div>
              </div>
            )}

            {/* 24h Low */}
            {low24h && (
              <div>
                <div className="text-[10px] text-[#56565B] uppercase">24h Low</div>
                <div className="text-xs text-[#f6465d] tabular-nums">
                  ${formatPrice(low24h, low24h > 100 ? 2 : 4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
