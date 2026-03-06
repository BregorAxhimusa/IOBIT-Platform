'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { SiteFooter } from '@/components/layout/site-footer';

// VIP Tiers data
const VIP_TIERS = [
  { tier: 'Non-VIP', volume: '< $5,000,000', maker: '0.015%', taker: '0.038%', icon: null },
  { tier: 'VIP 1', volume: '>= $5,000,000', maker: '0.013%', taker: '0.036%', icon: '/iobit/bits/green.svg' },
  { tier: 'VIP 2', volume: '>= $15,000,000', maker: '0.011%', taker: '0.034%', icon: '/iobit/bits/green.svg' },
  { tier: 'VIP 3', volume: '>= $45,000,000', maker: '0.008%', taker: '0.032%', icon: '/iobit/bits/green.svg' },
  { tier: 'VIP 4', volume: '>= $130,000,000', maker: '0.005%', taker: '0.030%', icon: '/iobit/bits/green.svg' },
  { tier: 'VIP 5', volume: '>= $400,000,000', maker: '0.000%', taker: '0.028%', icon: '/iobit/bits/silver.svg' },
  { tier: 'VIP 6', volume: '>= $800,000,000', maker: '0.000%', taker: '0.026%', icon: '/iobit/bits/silver.svg' },
  { tier: 'VIP 7', volume: '>= $1,000,000,000', maker: '0.000%', taker: '0.024%', icon: '/iobit/bits/silver.svg' },
  { tier: 'VIP 8', volume: '>= $2,000,000,000', maker: '0.000%', taker: '0.022%', icon: '/iobit/bits/gold.svg' },
  { tier: 'VIP 9', volume: '>= $4,000,000,000', maker: '0.000%', taker: '0.020%', icon: '/iobit/bits/gold.svg' },
];

export default function VipPage() {
  // Mock user data - replace with real data from API
  const userTier = 'Non-VIP';
  const userVolume = 10;
  const targetVolume = 5000000;
  const progressPercent = (userVolume / targetVolume) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white page-enter overflow-hidden">
      {/* Section 1: Hero */}
      <div className="w-full border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-10 md:py-16 lg:py-20 lg:border-r border-white/10 flex flex-col justify-center">
            {/* VIP Badge */}
            <span className="inline-flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 md:py-2 px-2.5 sm:px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
              <Image
                src="/iobit/bits/bitreward.svg"
                alt=""
                width={14}
                height={14}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
              />
              VIP
            </span>

            {/* Title */}
            <h1 className="text-[32px] sm:text-[50px] md:text-[70px] lg:text-[100px] font-bold leading-tight">
              IOBit <span className="text-[#16DE93] italic">VIP</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#A0A0A0] text-base sm:text-lg md:text-xl lg:text-2xl max-w-md">
              Unlock exclusive benefits
              <br />
              become a VIP trader today.
            </p>
          </div>

          {/* Right Column - VIP Card */}
          <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-10 md:py-16 lg:py-20 bg-[#111113]">
            {/* Mobile: Image with float animation */}
            <div className="lg:hidden animate-float">
              <Image
                src="/iobit/more/vip.png"
                alt="VIP Card"
                width={400}
                height={300}
                className="w-full max-w-[280px] sm:max-w-sm"
              />
            </div>
            {/* Desktop: iframe */}
            <div className="hidden lg:block w-full aspect-[4/3]">
              <iframe
                src="/iobit/more/vip.html"
                className="w-full h-full border-0 scale-110"
                title="VIP Card"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Current Status */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Your Tier */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8 lg:py-10 lg:border-r border-[#1a1a1f]">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-1 sm:mb-2">
              Your Tier <span className="text-[#8A8A8E] italic">{userTier}</span>
            </h2>
            <p className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6">
              Enjoy a lower transaction rate for higher VIP tiers.
            </p>

            {/* Divider */}
            <div className="border-t border-[#1a1a1f] mb-4 sm:mb-6" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Transaction Fee Rate */}
              <div>
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 sm:mb-3 md:mb-4">Transaction Fee Rate</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm">Maker</span>
                    <p className="text-white text-xs sm:text-sm md:text-base font-medium">0.015 %</p>
                  </div>
                  <div>
                    <span className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm">Taker</span>
                    <p className="text-white text-xs sm:text-sm md:text-base font-medium">0.038 %</p>
                  </div>
                </div>
              </div>

              {/* Your VIP Journey */}
              <div>
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 sm:mb-3 md:mb-4">Your VIP Journey</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm">Duration of VIP status</span>
                    <p className="text-white text-xs sm:text-sm md:text-base font-medium">0 Days</p>
                  </div>
                  <div>
                    <span className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm">Accumulated savings through VIP rates</span>
                    <p className="text-white text-xs sm:text-sm md:text-base font-medium">$0.000000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upgrade Section */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-6 md:py-8 lg:py-10 border-t lg:border-t-0 border-[#1a1a1f]">
            {/* Header with Trade Now button */}
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h3 className="text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-normal">Upgrade to</h3>
              <Link
                href="/trade/BTC"
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-white text-black text-[10px] sm:text-xs md:text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Trade Now
              </Link>
            </div>

            {/* Giant VIP 1 text */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="flex items-end gap-1 sm:gap-2">
                <span className="text-[50px] sm:text-[80px] md:text-[120px] lg:text-[160px] font-bold italic text-[#16DE93] leading-none">
                  VIP 1
                </span>
                <span className="text-[#8A8A8E] text-sm sm:text-lg md:text-xl lg:text-2xl italic pb-1 sm:pb-2 md:pb-4">out of 9</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <p className="text-[#8A8A8E] text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">
                Trading volume in the past 30 days
              </p>
              <div className="flex items-baseline gap-0 mb-1 sm:mb-2">
                <span className="text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-medium">
                  ${userVolume.toLocaleString()}
                </span>
                <span className="text-[#8A8A8E] text-sm sm:text-base md:text-lg">/${targetVolume.toLocaleString()}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-[rgba(86,86,91,0.3)] overflow-hidden">
                <div
                  className="h-full bg-[#16DE93] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Banner */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5">
          <p className="text-white text-xs sm:text-sm md:text-base font-medium italic">
            The higher your VIP tier, the greater your rewards
          </p>
          <p className="text-white text-xs sm:text-sm md:text-base font-medium mt-1.5 sm:mt-0">
            Enjoy Lower Fees
          </p>
        </div>
      </div>

      {/* Section 4: VIP Tiers Table */}
      <div className="w-full overflow-x-auto scrollbar-dark">
        <table className="w-full min-w-[500px] text-[10px] sm:text-xs md:text-xs lg:text-sm">
          <thead>
            <tr className="border-b border-[#1a1a1f]">
              <th className="text-left text-[#8A8A8E] font-medium py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 lg:px-12">
                VIP Tier
              </th>
              <th className="text-left text-[#8A8A8E] font-medium py-2.5 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4">
                30-Day Trading Volume
              </th>
              <th className="text-right text-[#8A8A8E] font-medium py-2.5 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4">Maker</th>
              <th className="text-right text-[#8A8A8E] font-medium py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 lg:px-12">
                Taker
              </th>
            </tr>
          </thead>
          <tbody>
            {VIP_TIERS.map((tier, index) => (
              <tr
                key={tier.tier}
                className={cn(
                  index < VIP_TIERS.length - 1 ? 'border-b border-[#1a1a1f]' : '',
                  index === 0 ? 'text-[#B2B3B7]' : ''
                )}
              >
                <td className="py-2 sm:py-2.5 md:py-3 lg:py-4 px-3 sm:px-4 md:px-6 lg:px-12">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {tier.icon && (
                      <Image
                        src={tier.icon}
                        alt=""
                        width={16}
                        height={16}
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                      />
                    )}
                    <span className="text-white">
                      {tier.tier}
                    </span>
                  </div>
                </td>
                <td className="py-2 sm:py-2.5 md:py-3 lg:py-4 px-2 sm:px-3 md:px-4 text-[#B2B3B7]">{tier.volume}</td>
                <td className="py-2 sm:py-2.5 md:py-3 lg:py-4 px-2 sm:px-3 md:px-4 text-right text-[#B2B3B7]">{tier.maker}</td>
                <td className="py-2 sm:py-2.5 md:py-3 lg:py-4 px-3 sm:px-4 md:px-6 lg:px-12 text-right text-[#B2B3B7]">
                  {tier.taker}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spacer */}
      <div className="py-6 sm:py-8 md:py-12 border-t border-[#1a1a1f]" />

      {/* Site Footer */}
      <SiteFooter />

      {/* Float animation styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.05);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
