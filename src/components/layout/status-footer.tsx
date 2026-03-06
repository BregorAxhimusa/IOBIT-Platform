'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMarketStore } from '@/store/market-store';
import { cn } from '@/lib/utils/cn';
import { CoinIcon, hasCoinIcon } from '@/components/ui/coin-icon';

function TickerItem({ symbol, price, change }: { symbol: string; price: string; change: number }) {
  const isPositive = change >= 0;
  // Extract coin symbol (remove USD suffix)
  const coinSymbol = symbol.replace(/USD$/, '');
  return (
    <span className="inline-flex items-center gap-2 px-4 whitespace-nowrap">
      <CoinIcon symbol={coinSymbol} size="sm" />
      <span className="text-white text-xs">{symbol}</span>
      <span className={cn(
        'text-xs',
        isPositive ? 'text-[#16DE93]' : 'text-[#F6465D]'
      )}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
      <span className="text-white/50 text-xs">{price}</span>
    </span>
  );
}

export function StatusFooter() {
  const pathname = usePathname();
  const markets = useMarketStore((s) => s.markets);
  const allMarkets = Array.from(markets.values());

  // Hide footer on /earn, /bit, /vip, and /affiliates pages
  if (pathname?.startsWith('/earn') || pathname?.startsWith('/bit') || pathname?.startsWith('/vip') || pathname?.startsWith('/affiliates')) {
    return null;
  }

  // Get top markets by volume for the ticker - only coins with icons
  const tickerMarkets = allMarkets
    .filter(m => hasCoinIcon(m.symbol)) // Only show coins that have icons
    .sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h))
    .slice(0, 20)
    .map(m => {
      const priceStr = String(m.price);
      const decimals = priceStr.includes('.') ? Math.min(5, priceStr.split('.')[1]?.length || 2) : 2;
      return {
        symbol: `${m.symbol}USD`,
        price: parseFloat(priceStr).toFixed(decimals),
        change: m.change24h || 0,
      };
    });

  return (
    <footer className="hidden lg:block bg-[#0a0a0c] border-t border-b border-[#1a1a1f]">
      {/* Main row */}
      <div className="flex items-center justify-between">
        {/* Left: Operational Status */}
        <div className="flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-5 shrink-0 border-r border-[#1a1a1f]">
        <Image
          src="/iobit/landingpage/operational.svg"
          alt=""
          width={16}
          height={16}
          style={{ width: 'auto', height: 'auto' }}
        />
        <span className="text-white text-xs font-medium">Operational</span>
      </div>

      {/* Second Icon */}
      <div className="flex items-center px-4 py-5 shrink-0 border-r border-[#1a1a1f]">
        <Image
          src="/iobit/landingpage/operational1.svg"
          alt=""
          width={16}
          height={16}
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>

      {/* Middle: Ticker */}
      <div className="flex-1 overflow-hidden relative mx-0">
        <div className="ticker-scroll">
          {tickerMarkets.length > 0 ? (
            <>
              {/* Duplicate content for seamless infinite loop */}
              <div className="ticker-content">
                {tickerMarkets.map((market) => (
                  <TickerItem
                    key={`a-${market.symbol}`}
                    symbol={market.symbol}
                    price={market.price}
                    change={market.change}
                  />
                ))}
              </div>
              <div className="ticker-content">
                {tickerMarkets.map((market) => (
                  <TickerItem
                    key={`b-${market.symbol}`}
                    symbol={market.symbol}
                    price={market.price}
                    change={market.change}
                  />
                ))}
              </div>
            </>
          ) : (
            <span className="text-white/30 text-xs">Loading market data...</span>
          )}
        </div>
      </div>

        {/* Right: Copyright - hidden on mobile */}
        <div className="hidden sm:block px-4 py-4 shrink-0 border-l border-[#1a1a1f]">
          <span className="text-white/40 text-xs">@{new Date().getFullYear()} IOBit® - All Rights Reserved</span>
        </div>
      </div>

      {/* Mobile Copyright - full width, shown only on mobile */}
      <div className="sm:hidden px-4 py-3 border-t border-[#1a1a1f] text-center">
        <span className="text-white/40 text-xs">@{new Date().getFullYear()} IOBit® - All Rights Reserved</span>
      </div>

      <style jsx>{`
        .ticker-scroll {
          display: flex;
          width: max-content;
          animation: ticker 40s linear infinite;
          will-change: transform;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        .ticker-content {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </footer>
  );
}
