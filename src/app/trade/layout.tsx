import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade | IOBIT - Advanced Crypto Trading',
  description: 'Trade cryptocurrencies with advanced tools, real-time charts, and deep liquidity on IOBIT powered by Hyperliquid.',
  openGraph: {
    title: 'Trade | IOBIT - Advanced Crypto Trading',
    description: 'Trade cryptocurrencies with advanced tools, real-time charts, and deep liquidity on IOBIT powered by Hyperliquid.',
    type: 'website',
  },
};

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
