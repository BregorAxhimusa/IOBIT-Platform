import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staking | IOBIT - Stake BIT Tokens',
  description: 'Stake BIT tokens to earn rewards and help secure the IOBIT network. Delegate to validators and earn passive income.',
  openGraph: {
    title: 'Staking | IOBIT - Stake BIT Tokens',
    description: 'Stake BIT tokens to earn rewards and help secure the IOBIT network. Delegate to validators and earn passive income.',
    type: 'website',
  },
};

export default function StakingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
