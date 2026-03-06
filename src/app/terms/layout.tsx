import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | IOBIT',
  description: 'Read IOBIT terms of service to understand the rules and guidelines for using our trading platform.',
  openGraph: {
    title: 'Terms of Service | IOBIT',
    description: 'Read IOBIT terms of service to understand the rules and guidelines for using our trading platform.',
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
