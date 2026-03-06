import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | IOBIT - Manage Your Assets',
  description: 'View and manage your crypto portfolio, positions, orders, and trade history on IOBIT trading platform.',
  openGraph: {
    title: 'Portfolio | IOBIT - Manage Your Assets',
    description: 'View and manage your crypto portfolio, positions, orders, and trade history on IOBIT trading platform.',
    type: 'website',
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
