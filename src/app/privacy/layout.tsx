import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | IOBIT',
  description: 'Read IOBIT privacy policy to understand how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy | IOBIT',
    description: 'Read IOBIT privacy policy to understand how we collect, use, and protect your personal information.',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
