'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EarningsChart, AffiliateSteps, AffiliatesFaq } from '@/components/affiliates';
import { SiteFooter } from '@/components/layout/site-footer';

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white page-enter overflow-hidden">
      {/* Section 1: Hero */}
      <div className="w-full border-b border-[#1a1a1f]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20 border-b lg:border-b-0 lg:border-r border-[#1a1a1f] flex flex-col justify-center">
            {/* AFFILIATES Badge */}
            <span className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px] mb-4 md:mb-6">
              <Image
                src="/iobit/landingpage/owned.svg"
                alt=""
                width={14}
                height={14}
                className="w-3 h-3 md:w-3.5 md:h-3.5"
              />
              AFFILIATES
            </span>

            {/* Title */}
            <h1 className="text-[26px] sm:text-[36px] md:text-[46px] lg:text-[56px] font-normal leading-tight mb-4 md:mb-6">
              Begin your journey now! Complete tasks to earn.
            </h1>

            {/* Description */}
            <p className="text-[#9B9A9F] text-sm sm:text-base md:text-lg max-w-md mb-6 md:mb-8 leading-relaxed">
              Are you an influencer or a content creator who shares a passion for crypto? Turn your influence into affluence and earn money by joining the IOBit Affiliate Program!
            </p>

            {/* CTA Button */}
            <Link
              href="/referrals"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-sm sm:text-base font-medium rounded-lg hover:bg-white/90 transition-colors w-fit"
            >
              Start Earning
            </Link>
          </div>

          {/* Right Column - Earnings Chart */}
          <div className="flex items-center justify-center bg-[#0a0a0c]">
            <EarningsChart />
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="py-4 md:py-8 lg:py-12" />

      {/* Section 2: Steps */}
      <AffiliateSteps />

      {/* Section 3: FAQ */}
      <AffiliatesFaq />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
