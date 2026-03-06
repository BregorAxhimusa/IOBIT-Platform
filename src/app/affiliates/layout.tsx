import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliates | IOBIT - Partner Program',
  description: 'Become an IOBIT affiliate and earn commissions by referring traders. Join our partner program today.',
  openGraph: {
    title: 'Affiliates | IOBIT - Partner Program',
    description: 'Become an IOBIT affiliate and earn commissions by referring traders. Join our partner program today.',
    type: 'website',
  },
};

export default function AffiliatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
