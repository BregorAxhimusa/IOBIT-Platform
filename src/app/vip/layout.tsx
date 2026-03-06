import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VIP Program | IOBIT - Exclusive Benefits',
  description: 'Join IOBIT VIP program for exclusive trading benefits, lower fees, and premium rewards.',
  openGraph: {
    title: 'VIP Program | IOBIT - Exclusive Benefits',
    description: 'Join IOBIT VIP program for exclusive trading benefits, lower fees, and premium rewards.',
    type: 'website',
  },
};

export default function VipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
