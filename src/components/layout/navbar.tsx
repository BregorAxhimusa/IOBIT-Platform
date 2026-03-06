'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { AccountSwitcher } from '@/components/layout/account-switcher';

// Chain icons mapping
const CHAIN_ICONS: Record<number, { icon: string; name: string; color: string }> = {
  42161: { icon: '/iobit/chain/arb.svg', name: 'Arbitrum', color: '#28A0F0' },
  1: { icon: '/iobit/chain/etherium.svg', name: 'Ethereum', color: '#627EEA' },
};

// Main navigation links
const mainNavLinks = [
  { href: '/trade/BTC', label: 'Trade' },
  { href: '/market', label: 'Market' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/staking', label: 'Staking' },
  { href: '/earn', label: 'Earn' },
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
const airdropTexts = ['BIT', 'Airdrop', '25M'];

// Airdrop Button Component with typewriter effect
function AirdropButton({ onClick }: { onClick?: () => void }) {
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
      onClick={onClick}
      className="animate-rotating-border inline-block group"
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]"
        style={{
          background: 'linear-gradient(135deg, #0a1f1a 0%, #0f0f0f 50%, #0a1a1f 100%)'
        }}
      >
        <Image
          src="/iobit/bits/iconbits.svg"
          alt="BIT"
          width={14}
          height={14}
          className="group-hover:opacity-80 transition-opacity duration-300"
          style={{ width: 'auto', height: 'auto' }}
        />
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
        className="px-4 py-2 md:px-4 md:py-2 rounded-lg font-normal text-[10px] md:text-sm bg-white text-black"
        disabled
      >
        <span className="md:hidden">Connect</span>
        <span className="hidden md:inline">Connect Wallet</span>
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
        'rounded-lg font-normal transition-all',
        'px-4 py-2 md:px-4 md:py-2 text-[10px] md:text-sm',
        isConnected
          ? 'bg-[#111111] text-white border border-[#1a1a1f] hover:border-[#2a2a2f] hover:bg-[#1a1a1a]'
          : 'bg-white text-black hover:bg-gray-100'
      )}
    >
      <span className="md:hidden">{isConnected && address ? formatAddress(address, 3) : 'Connect'}</span>
      <span className="hidden md:inline">{isConnected && address ? formatAddress(address) : 'Connect Wallet'}</span>
    </button>
  );
}

// Chain Indicator Component
function ChainIndicator() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ChainIndicatorInner />;
}

// Inner component that uses AppKit hooks (only rendered on client)
function ChainIndicatorInner() {
  const { open } = useAppKit();
  const { caipNetwork } = useAppKitNetwork();
  const { isConnected } = useAppKitAccount();

  if (!isConnected || !caipNetwork) return null;

  const chainId = caipNetwork.id as number;
  const chainInfo = CHAIN_ICONS[chainId] || { icon: '', name: caipNetwork.name || 'Unknown', color: '#888888' };

  return (
    <button
      onClick={() => open({ view: 'Networks' })}
      className="p-1.5 md:p-2 rounded-lg bg-[#111111] border border-[#1a1a1f] hover:border-[#2a2a2f] hover:bg-[#1a1a1a] transition-all"
      title={`Switch Network (${chainInfo.name})`}
    >
      {chainInfo.icon && (
        <Image
          src={chainInfo.icon}
          alt={chainInfo.name}
          width={20}
          height={20}
          className="rounded-full w-5 min-w-5 max-w-5 h-5 min-h-5 max-h-5"
        />
      )}
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

  // Close mobile menu when pathname changes (after page transition completes)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Check if any "more" link is active
  const isMoreActive = moreLinks.some(link => pathname?.startsWith(link.href));

  return (
    <nav className="border-b border-[#1a1a1f] bg-[#0a0a0c] py-0 md:py-2 overflow-x-hidden" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side - Logo + Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/iobit/landingpage/logo.svg"
              alt="IOBIT"
              width={98}
              height={34}
              priority
              className="w-[98px] min-w-[98px] max-w-[98px] h-auto"
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
                    'px-3 py-1.5 text-[15px] font-normal rounded-lg transition-all',
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
                  'px-3 py-1.5 text-[15px] font-normal rounded-lg transition-all flex items-center gap-1',
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
                <div className="absolute top-full right-0 mt-3 w-48 bg-[#0a0a0a] border border-[#1a1a1f] shadow-xl z-50">
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
                            ? 'bg-[#29292B] text-[#16DE93]'
                            : 'text-white/70 hover:text-white'
                        )}
                      >
                        <Image
                          src={link.icon}
                          alt={link.label}
                          width={16}
                          height={16}
                          style={isActive ? { filter: 'brightness(0) saturate(100%) invert(78%) sepia(52%) saturate(652%) hue-rotate(97deg) brightness(92%) contrast(87%)' } : undefined}
                        />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Right Side - Wallet + Chain + Menu Button */}
        <div className="flex md:hidden items-center gap-1.5">
          <WalletButton />
          <ChainIndicator />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-0 rounded-lg transition-all"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Image
              src={mobileMenuOpen ? "/iobit/landingpage/close.svg" : "/iobit/landingpage/open.svg"}
              alt={mobileMenuOpen ? "Close menu" : "Open menu"}
              width={30}
              height={30}
            />
          </button>
        </div>

        {/* Desktop Right Side - Account Switcher + Wallet + Chain */}
        <div className="hidden md:flex items-center space-x-2">
          {isConnected && <AccountSwitcher />}
          <WalletButton />
          <ChainIndicator />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 border-t border-[#1a1a1f] bg-[#0a0a0c] overflow-y-auto z-[100]">
          <div className="px-0 py-4 space-y-2">
            {allNavLinks.map((link) => {
              // For Trade link, match any /trade/* route
              const isActive = link.label === 'Trade'
                ? pathname?.startsWith('/trade')
                : pathname?.startsWith(link.href);
              return (
                <div key={link.href} className="px-3 py-1">
                  <Link
                    href={link.href}
                    className={cn(
                      'inline-block px-3 py-1.5 text-base font-normal rounded-lg transition-all',
                      isActive
                        ? 'bg-white text-black'
                        : 'text-[#8A8A8E] hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
            {/* Divider */}
            <div className="border-b border-[#1a1a1f] my-2" />
            {/* Airdrop Button */}
            <div className="px-3 py-2">
              <AirdropButton />
            </div>
            {/* Divider */}
            <div className="border-b border-[#1a1a1f] my-2" />
            {/* IOBIT Branding */}
            <Link
              href="https://iobit.ai/"
              target="_blank"
              className="px-3 py-3 flex items-center gap-3"
            >
              <span className="text-3xl font-medium text-white">IOBIT</span>
              <Image
                src="/iobit/landingpage/vector-diagonal.png"
                alt="IOBIT"
                width={24}
                height={24}
              />
            </Link>
          </div>

          {/* Footer Links */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-6 space-y-3">
            <div className="flex items-center justify-between">
              <a
                href="/privacy"
                target="_blank"
                className="text-[#B2B3B7] text-sm hover:text-white transition-colors"
              >
                PRIVACY POLICY
              </a>
              <a
                href="/terms"
                target="_blank"
                className="text-[#B2B3B7] text-sm hover:text-white transition-colors"
              >
                TERMS OF SERVICE
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
