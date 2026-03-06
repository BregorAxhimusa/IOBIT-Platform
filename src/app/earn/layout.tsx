import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earn | IOBIT - Earn Rewards & Rebates',
  description: 'Earn passive income through trading rebates, vault rewards, and referral commissions on IOBIT.',
  openGraph: {
    title: 'Earn | IOBIT - Earn Rewards & Rebates',
    description: 'Earn passive income through trading rebates, vault rewards, and referral commissions on IOBIT.',
    type: 'website',
  },
};

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
