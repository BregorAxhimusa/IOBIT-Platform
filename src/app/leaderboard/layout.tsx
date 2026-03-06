import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | IOBIT - Top Traders',
  description: 'Discover the top traders ranked by PnL, volume, and ROI. Follow the best performers on IOBIT.',
  openGraph: {
    title: 'Leaderboard | IOBIT - Top Traders',
    description: 'Discover the top traders ranked by PnL, volume, and ROI. Follow the best performers on IOBIT.',
    type: 'website',
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
