'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useMarketData } from '@/hooks/use-market-data';
import { PortfolioSidebar, type PortfolioRoute } from '@/components/portfolio/portfolio-sidebar';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { OrdersPage } from '@/components/portfolio/orders-page';
import { FundsPage } from '@/components/portfolio/funds-page';
import { TransfersPage } from '@/components/portfolio/transfers-page';

// Connect wallet button component that safely uses AppKit hooks
function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-white/90 text-black text-sm sm:text-base font-medium transition-colors"
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  return <ConnectWalletButtonInner />;
}

function ConnectWalletButtonInner() {
  const { open } = useAppKit();

  return (
    <button
      onClick={() => open()}
      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-white/90 text-black text-sm sm:text-base font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}

export default function PortfolioPage() {
  const { isConnected } = useAppKitAccount();
  const [activeRoute, setActiveRoute] = useState<PortfolioRoute>('overview');

  // Initialize market data for StatusFooter
  useMarketData();

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-[90vh] bg-[#0a0a0c] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-normal text-white mb-3 sm:mb-4">Portfolio</h1>
          <p className="text-[#8A8A8E] text-sm sm:text-base mb-4 sm:mb-6">Connect your wallet to view your portfolio</p>
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  // Render content based on active route
  const renderContent = () => {
    switch (activeRoute) {
      case 'overview':
        return <PortfolioOverview />;
      case 'orders':
        return <OrdersPage />;
      case 'funds':
        return <FundsPage />;
      case 'transfers':
        return <TransfersPage />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div className="min-h-[90vh] bg-[#0a0a0c] page-enter">
      {/* Mobile Sidebar (dropdown at top) */}
      <div className="lg:hidden">
        <PortfolioSidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <PortfolioSidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[90vh]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
