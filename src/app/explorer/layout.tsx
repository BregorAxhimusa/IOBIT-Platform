import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorer | IOBIT - Blockchain Explorer',
  description: 'Explore blocks, transactions, and on-chain activity on IOBIT blockchain explorer.',
  openGraph: {
    title: 'Explorer | IOBIT - Blockchain Explorer',
    description: 'Explore blocks, transactions, and on-chain activity on IOBIT blockchain explorer.',
    type: 'website',
  },
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
