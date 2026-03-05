'use client';

import Image from 'next/image';
import Link from 'next/link';

const NAVIGATION_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Create', href: '/create' },
  { label: 'Features', href: '/features' },
  { label: 'Process', href: '/process' },
];

const PRODUCT_LINKS = [
  { label: 'Docs', href: '/docs' },
  { label: 'Launch App', href: '/launch' },
  { label: 'Create Token', href: '/create-token' },
  { label: 'Start Trading', href: '/trade/BTC' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#0a0a0c]">
      {/* Main Footer Content */}
      <div className="border-t border-[#1a1a1f]">
        <div className="max-w-6xl mx-auto border-l border-r border-[#1a1a1f]">
          {/* Logo & Description - Full width on mobile */}
          <div className="px-4 md:px-6 lg:px-8 py-6 lg:py-8 border-b border-[#1a1a1f] lg:border-b-0 flex flex-col items-center lg:items-start lg:hidden">
            <div className="mb-4">
              <Image
                src="/iobit/landingpage/logo.svg"
                alt="IOBit"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-[#6b6b6b] text-xs leading-relaxed mb-4 text-center">
              Built for transparency, powered by community, designed for Web3 growth.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/iobit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/iobit/landingpage/twitter.svg"
                  alt="Twitter"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://t.me/iobit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/iobit/landingpage/telegram.svg"
                  alt="Telegram"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </a>
            </div>
          </div>

          {/* Desktop: 4 column grid / Mobile: Navigation & Product side by side */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#1a1a1f] lg:border-b-0">
            {/* Logo & Description - Desktop only */}
            <div className="hidden lg:block py-8 px-8 pr-8 border-r border-[#1a1a1f]">
              <div className="mb-4">
                <Image
                  src="/iobit/landingpage/logo.svg"
                  alt="IOBit"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-6">
                Built for transparency, powered by community, designed for Web3 growth.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/iobit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/iobit/landingpage/twitter.svg"
                    alt="Twitter"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
                <a
                  href="https://t.me/iobit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/iobit/landingpage/telegram.svg"
                    alt="Telegram"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-6 lg:py-8 px-4 lg:px-8 border-r border-[#1a1a1f]">
              <h4 className="text-[#16DE93] text-[10px] md:text-xs font-medium uppercase tracking-wider mb-4 md:mb-6">
                Navigation
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {NAVIGATION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#a0a0a5] text-xs md:text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Links */}
            <div className="py-6 lg:py-8 px-4 lg:px-8 lg:border-r border-[#1a1a1f]">
              <h4 className="text-[#16DE93] text-[10px] md:text-xs font-medium uppercase tracking-wider mb-4 md:mb-6">
                Product
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#a0a0a5] text-xs md:text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links - Desktop only in grid */}
            <div className="hidden lg:block py-8 px-8">
              <h4 className="text-[#16DE93] text-xs font-medium uppercase tracking-wider mb-6">
                Legal
              </h4>
              <ul className="space-y-3">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#a0a0a5] text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal Links - Mobile only, full width */}
          <div className="lg:hidden py-6 px-4">
            <h4 className="text-[#16DE93] text-[10px] font-medium uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#a0a0a5] text-xs hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="py-6 sm:py-8 md:py-12 border-t sm:border-b border-[#1a1a1f]" />

      {/* Large Background Logo Section */}
      <div className="relative overflow-hidden border-t lg:border-t-0 border-[#1a1a1f] max-w-6xl mx-auto border-l border-r">
        <div className="py-10 md:py-14 lg:py-20 flex items-center justify-center">
          {/* Large Logo Image */}
          <Image
            src="/iobit/landingpage/BIGlogopng.png"
            alt="IOBit"
            width={1200}
            height={576}
            className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-5xl transition-all duration-500 ease-in-out hover:scale-105 cursor-pointer"
          />

        </div>
        {/* Center Triangle Icon - positioned at bottom of section */}
        <div
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 translate-y-1/2 group cursor-pointer z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border border-[#2a2a2f] bg-[#0a0a0c] flex items-center justify-center">
            <Image
              src="/iobit/landingpage/triangle.svg"
              alt=""
              width={24}
              height={24}
              className="w-[14px] h-[14px] sm:w-[24px] sm:h-[24px] transition-all duration-300 group-hover:scale-110 group-hover:brightness-125 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1a1a1f]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5 flex flex-col items-center justify-center lg:flex-row lg:justify-between gap-3 border-l border-r border-[#1a1a1f]">
          {/* Copyright */}
          <p className="text-[#6b6b6b] text-[10px] md:text-xs uppercase tracking-wider text-center">
            ©{new Date().getFullYear()} IOBit® - All Rights Reserved.
          </p>

          {/* Legal Links - Desktop only */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[#6b6b6b] text-xs uppercase tracking-wider hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[#6b6b6b] text-xs uppercase tracking-wider hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
