import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referrals | IOBIT - Refer & Earn',
  description: 'Invite friends to IOBIT and earn rewards. Share your referral code and get trading fee rebates.',
  openGraph: {
    title: 'Referrals | IOBIT - Refer & Earn',
    description: 'Invite friends to IOBIT and earn rewards. Share your referral code and get trading fee rebates.',
    type: 'website',
  },
};

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
