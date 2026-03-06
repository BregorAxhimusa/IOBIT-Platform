'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface Step {
  title: string;
  description: string;
  image: string;
}

const STEPS: Step[] = [
  {
    title: 'Connect Your Wallet',
    description:
      "To start using IOBIT's multichain platform, you'll first need to connect your crypto wallet. This step ensures secure access and links your wallet address to the platform. Simply click on \"Connect Wallet\" at the top of the page, choose your preferred wallet (MetaMask, WalletConnect, or others), and approve the connection.",
    image: '/iobit/landingpage/connectwallet.svg',
  },
  {
    title: 'Access the Referral Page',
    description:
      "Once your wallet is connected, head over to the Referral Page in your account menu. Here, you'll find all the tools to manage your referral program, including performance stats, bonus details, and your personalized referral link.",
    image: '/iobit/landingpage/referralpage.svg',
  },
  {
    title: 'Start Earning Rewards',
    description:
      "From the app, you can copy your unique referral link with just one click. Share it with friends, communities, or social media to invite others to join IOBIT. Every time someone signs up and trades using your link, you'll earn rewards directly to your wallet.",
    image: '/iobit/landingpage/earningpage.svg',
  },
];

export function AffiliateSteps() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="w-full border-t border-[#1a1a1f]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#1a1a1f] bg-[#111113] min-h-[220px] sm:min-h-[280px] md:min-h-[380px] lg:min-h-[500px] overflow-hidden">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-all duration-500',
                activeStep === index
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95 pointer-events-none'
              )}
            >
              <Image
                src={step.image}
                alt={step.title}
                width={500}
                height={500}
                className="max-w-full max-h-full object-contain"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Right: Steps accordion */}
        <div className="flex flex-col">
          {STEPS.map((step, index) => (
            <div
              key={index}
              onClick={() => setActiveStep(index)}
              className={cn(
                'border-b border-[#1a1a1f] last:border-b-0 cursor-pointer transition-all duration-300 group',
                activeStep === index ? 'bg-white/5' : 'hover:bg-white/[0.02]'
              )}
            >
              <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
                {/* Step badge - visible when active or on hover */}
                <span
                  className={cn(
                    'inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg text-[10px] md:text-xs text-[#16DE93] mb-3 md:mb-4 transition-all duration-300',
                    'shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]',
                    activeStep === index
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  )}
                  style={{ backgroundColor: 'rgba(0, 98, 81, 0.15)' }}
                >
                  STEP {index + 1}
                </span>

                {/* Title */}
                <h3
                  className={cn(
                    'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4 transition-colors duration-300',
                    activeStep === index
                      ? 'text-[#DDDDE5]'
                      : 'text-[#4D4D4F] group-hover:text-[#DDDDE5]'
                  )}
                >
                  {step.title}
                </h3>

                {/* Description - only visible when active */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    activeStep === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <p className="text-[#9B9A9F] text-xs sm:text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="py-4 md:py-8 lg:py-12 border-t border-[#1a1a1f]" />
    </div>
  );
}
