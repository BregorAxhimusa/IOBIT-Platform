'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { AccountSwitcher } from '@/components/layout/account-switcher';

const navLinks = [
  { href: '/trade/BTC', label: 'Trade' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/staking', label: 'Staking' },
  { href: '/vaults', label: 'Vaults' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/referrals', label: 'Referrals' },
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
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            IOBIT
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

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

        {/* Right Side - Account Switcher + Settings + Wallet */}
        <div className="flex items-center space-x-3">
          {isConnected && <AccountSwitcher />}
          {isConnected && (
            <Link
              href="/settings"
              className={cn(
                'p-2 rounded-lg transition-colors',
                pathname?.startsWith('/settings')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
              title="Account Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          )}
          <WalletButton />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {isConnected && (
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname?.startsWith('/settings')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                )}
              >
                Settings
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
