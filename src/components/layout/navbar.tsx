'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { AccountSwitcher } from '@/components/layout/account-switcher';
import { useNetworkStore } from '@/store/network-store';

const navLinks = [
  { href: '/trade/BTC', label: 'Trade' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/staking', label: 'Staking' },
  { href: '/vaults', label: 'Vaults' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/referrals', label: 'Referrals' },
];

// Network Toggle Component
function NetworkToggle() {
  const { switchNetwork, isTestnet } = useNetworkStore();

  return (
    <button
      onClick={switchNetwork}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5',
        isTestnet
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
      )}
      title={`Switch to ${isTestnet ? 'Mainnet' : 'Testnet'}`}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        isTestnet ? 'bg-amber-400' : 'bg-emerald-400'
      )} />
      {isTestnet ? 'TESTNET' : 'MAINNET'}
    </button>
  );
}

// Wallet Button Component
function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  return (
    <button
      onClick={() => {
        if (isConnected) {
          open({ view: 'Account' });
        } else {
          open();
        }
      }}
      className={cn(
        'px-4 py-2 rounded-xl font-semibold text-sm transition-all border',
        isConnected
          ? 'bg-[#111111] text-white border-white/20 hover:border-white/40 hover:bg-[#1a1a1a]'
          : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/20'
      )}
    >
      {isConnected && address ? formatAddress(address) : 'Connect Wallet'}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAppKitAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-white/20 bg-[#0f0f0f]" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side - Logo + Navigation Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-cyan-300 transition-all">
              IOBIT
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-[#111111]/50 rounded-xl p-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all relative',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "md:hidden p-2 rounded-lg transition-all border",
            mobileMenuOpen
              ? "text-teal-400 bg-teal-500/10 border-teal-500/30"
              : "text-white/70 hover:text-white hover:bg-white/5 border-white/10"
          )}
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

        {/* Right Side - Network Toggle + Account Switcher + Settings + Wallet */}
        <div className="hidden md:flex items-center space-x-2">
          <NetworkToggle />
          {isConnected && <AccountSwitcher />}
          {isConnected && (
            <Link
              href="/settings"
              className={cn(
                'p-2 rounded-lg transition-all border',
                pathname?.startsWith('/settings')
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-white/10 hover:border-white/20'
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
        <div className="md:hidden border-t border-white/20 bg-[#0f0f0f]">
          <div className="px-4 py-3 space-y-1">
            {/* Network Toggle in Mobile */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              <span className="text-sm text-gray-400">Network</span>
              <NetworkToggle />
            </div>
            <div className="border-b border-white/10 my-2" />
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : 'text-white hover:bg-white/5 border border-transparent'
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
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                  pathname?.startsWith('/settings')
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                Settings
              </Link>
            )}
            {/* Wallet Button in Mobile */}
            <div className="pt-2 border-t border-white/10 mt-2">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
