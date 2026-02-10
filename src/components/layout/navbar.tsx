'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';

const navLinks = [
  { href: '/trade/BTC', label: 'Trade' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/vaults', label: 'Vaults' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

// Wallet Button Component
function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <button
      onClick={() => open()}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        isConnected
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      )}
    >
      {isConnected && address ? formatAddress(address) : 'Connect Wallet'}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            IOBIT
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side - Wallet Connection */}
        <div className="flex items-center space-x-4">
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
