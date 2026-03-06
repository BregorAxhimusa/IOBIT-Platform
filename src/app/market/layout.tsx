import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market | IOBIT - Crypto Market Overview',
  description: 'Explore real-time cryptocurrency market data, prices, volumes, and trends. Track perpetual and spot markets on IOBIT.',
  openGraph: {
    title: 'Market | IOBIT - Crypto Market Overview',
    description: 'Explore real-time cryptocurrency market data, prices, volumes, and trends. Track perpetual and spot markets on IOBIT.',
    type: 'website',
  },
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
