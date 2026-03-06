import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BIT Token | IOBIT - 25M Airdrop',
  description: 'Discover BIT token - the native token of IOBIT ecosystem. Participate in the 25M BIT airdrop and earn rewards.',
  openGraph: {
    title: 'BIT Token | IOBIT - 25M Airdrop',
    description: 'Discover BIT token - the native token of IOBIT ecosystem. Participate in the 25M BIT airdrop and earn rewards.',
    type: 'website',
  },
};

export default function BitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
