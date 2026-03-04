'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { AccountSwitcher } from '@/components/layout/account-switcher';

// Main navigation links
const mainNavLinks = [
  { href: '/trade/BTC', label: 'Trade' },
  { href: '/market', label: 'Market' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/staking', label: 'Staking' },
  { href: '/vaults', label: 'Earn' },
];

// More dropdown links
const moreLinks = [
  { href: '/vip', label: 'VIP', icon: '/iobit/more/vip.svg' },
  { href: '/affiliates', label: 'Affiliates', icon: '/iobit/more/affiliate.svg' },
  { href: '/explorer', label: 'Explorer', icon: '/iobit/more/explorer.svg' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '/iobit/more/leaderboard.svg' },
];

// All links for mobile menu
const allNavLinks = [...mainNavLinks, ...moreLinks];

// Airdrop texts that rotate with typewriter effect
const airdropTexts = ['BIT', 'AIRDROP', '25M'];

// Airdrop Button Component with typewriter effect
function AirdropButton() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentWord = airdropTexts[textIndex];

    if (isTyping) {
      // Typing effect - add one letter at a time
      if (displayText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Word complete, wait then start deleting
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect - remove one letter at a time
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        // Move to next word
        setTextIndex((prev) => (prev + 1) % airdropTexts.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, textIndex]);

  return (
    <Link
      href="/bit"
      className="animate-rotating-border inline-block group"
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-all"
        style={{
          background: 'linear-gradient(135deg, #0a1f1a 0%, #0f0f0f 50%, #0a1a1f 100%)'
        }}
      >
        <svg className="w-3.5 h-3.5 text-[#17DD92] group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="w-[70px] text-[15px] font-normal text-[#17DD92] group-hover:text-white transition-colors duration-300">
          {displayText}<span className="animate-pulse">|</span>
        </span>
      </div>
    </Link>
  );
}

// Wallet Button Component
function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client to avoid SSR issues with AppKit
  if (!mounted) {
    return (
      <button
        className="px-4 py-2 rounded-lg font-normal text-sm bg-white text-black"
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  return <WalletButtonInner />;
}

// Inner component that uses AppKit hooks (only rendered on client)
function WalletButtonInner() {
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
        'px-4 py-2 rounded-lg font-normal text-sm transition-all',
        isConnected
          ? 'bg-[#111111] text-white border border-[#1a1a1f] hover:border-[#2a2a2f] hover:bg-[#1a1a1a]'
          : 'bg-white text-black hover:bg-gray-100'
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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if any "more" link is active
  const isMoreActive = moreLinks.some(link => pathname?.startsWith(link.href));

  return (
    <nav className="border-b border-[#1a1a1f] bg-[#0a0a0c]" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side - Logo + Navigation Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/iobit/landingpage/logo.svg"
              alt="IOBIT"
              width={98}
              height={34}
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavLinks.map((link) => {
              // For Trade link, match any /trade/* route
              const isActive = link.label === 'Trade'
                ? pathname?.startsWith('/trade')
                : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 text-sm font-normal rounded-lg transition-all',
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Airdrop Button */}
            <AirdropButton />

            {/* More Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={cn(
                  'px-3 py-1.5 text-sm font-normal rounded-lg transition-all flex items-center gap-1',
                  isMoreActive
                    ? 'bg-white text-black'
                    : moreDropdownOpen
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                )}
              >
                More
                <svg
                  className={cn('w-3 h-3 transition-transform', moreDropdownOpen && 'rotate-180')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {moreDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0a] border border-[#1a1a1f] rounded-xl shadow-xl z-50 py-2">
                  {moreLinks.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-all',
                          isActive
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white'
                        )}
                      >
                        <Image src={link.icon} alt={link.label} width={16} height={16} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "md:hidden p-2 rounded-lg transition-all",
            mobileMenuOpen
              ? "bg-white text-black"
              : "text-white/70 hover:text-white"
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

        {/* Right Side - Account Switcher + Settings + Wallet */}
        <div className="hidden md:flex items-center space-x-2">
          {isConnected && <AccountSwitcher />}
          {isConnected && (
            <Link
              href="/settings"
              className={cn(
                'p-2 rounded-lg transition-all',
                pathname?.startsWith('/settings')
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
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
        <div className="md:hidden border-t border-[#1a1a1f] bg-[#0a0a0c] max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-3 py-2 space-y-1">
            {allNavLinks.map((link) => {
              // For Trade link, match any /trade/* route
              const isActive = link.label === 'Trade'
                ? pathname?.startsWith('/trade')
                : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-2 text-xs font-normal rounded-lg transition-all',
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {'icon' in link && <Image src={(link as { icon: string }).icon} alt={link.label} width={14} height={14} />}
                  {link.label}
                </Link>
              );
            })}
            {isConnected && (
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-2.5 py-2 text-xs font-normal rounded-lg transition-all',
                  pathname?.startsWith('/settings')
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:text-white'
                )}
              >
                Settings
              </Link>
            )}
            {/* Airdrop Button in Mobile */}
            <div className="px-2.5 py-2">
              <AirdropButton />
            </div>
            {/* Account Switcher in Mobile */}
            {isConnected && (
              <div className="px-2.5 py-2">
                <AccountSwitcher />
              </div>
            )}
            {/* Wallet Button in Mobile */}
            <div className="pt-1.5 border-t border-[#1a1a1f] mt-1.5 px-2.5">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
