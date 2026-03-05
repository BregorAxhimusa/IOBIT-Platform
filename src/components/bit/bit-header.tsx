'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

const SLIDES = [
  {
    id: 'airdrop',
    label: 'AIRDROP',
    title: '50M USD Airdrop',
    description: 'Claim your share of the BIT Token Airdrop.',
    statLabel: 'Total Points Generated',
    statValue: '3,871,420',
  },
  {
    id: 'rewards',
    label: 'BIT REWARDS',
    title: 'Earn Points. Get BIT',
    description: 'Points = BIT Rewards',
    actions: [
      { icon: '/iobit/bits/trade.svg', label: 'Trade' },
      { icon: '/iobit/bits/invite.svg', label: 'Invite' },
      { icon: '/iobit/bits/vault.svg', label: 'Earn' },
    ],
  },
  {
    id: 'launch',
    label: 'TOKEN LAUNCH',
    title: 'BIT Token Launch',
    description: 'TGE starts once we hit $100B volume',
    statLabel: 'Total Volume',
    statValue: '$20,871,420',
  },
];

export function BitHeader() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isDesktop]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative w-full bg-[#0a0a0c] overflow-hidden border-b border-[#1a1a1f]">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-32">
          {/* Left Side - Content */}
          <div className="flex-1 px-4 md:px-8 lg:px-16 py-6 md:py-12 lg:border-r lg:border-[#1a1a1f] lg:h-[400px]">
            {/* Label */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
                <Image
                  src="/iobit/bits/green.svg"
                  alt={slide.label}
                  width={14}
                  height={14}
                />
                {slide.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[50px] xl:text-[50px] 2xl:text-[50px] leading-tight font-bold text-[#16DE93] mb-3">
              {slide.title}
            </h1>

            {/* Description */}
            <p
              className="text-base sm:text-lg md:text-xl lg:text-[24px] xl:text-[24px] 2xl:text-[24px] leading-tight font-normal mb-6"
              style={{
                background: 'linear-gradient(90deg, rgb(163, 163, 171) 1%, rgb(188, 188, 197) 9%, rgb(242, 242, 242) 25%, rgb(255, 255, 255) 50%, rgb(242, 242, 242) 73%, rgb(188, 188, 197) 90%, rgb(163, 163, 171) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 8px',
              }}
            >
              {slide.description}
            </p>

            {/* Stat or Actions */}
            {slide.statLabel && (
              <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 md:gap-8 px-4 sm:px-6 py-3 sm:py-4 bg-[#0d0d0f] border border-[#1a1a1f] rounded-lg">
                <span className="text-white text-sm sm:text-base md:text-xl font-normal">{slide.statLabel}</span>
                <span className="text-white text-xl sm:text-2xl md:text-4xl font-bold">{slide.statValue}</span>
              </div>
            )}

            {slide.actions && (
              <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
                {slide.actions.map((action) => (
                  <div key={action.label} className="flex items-center gap-2">
                    <Image
                      src={action.icon}
                      alt={action.label}
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                    <span className="text-white text-base sm:text-lg md:text-2xl font-semibold">{action.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Illustrations */}
          <div className="hidden lg:flex flex-1 items-center justify-center h-[400px]">
            {/* Slide 1: Parachutes */}
            {currentSlide === 0 && (
              <div className="flex items-center gap-8 lg:gap-16">
                <div className="relative w-32 h-40 lg:w-40 lg:h-48 animate-bounce-slow">
                  <Image
                    src="/iobit/bits/airdrop1.svg"
                    alt="Airdrop Parachute"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-32 h-40 lg:w-40 lg:h-48 animate-bounce-slow animation-delay-500">
                  <Image
                    src="/iobit/bits/airdrop2.svg"
                    alt="Airdrop Parachute"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Slide 2: Circles */}
            {currentSlide === 1 && (
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                {/* Animated concentric circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-32 h-32 lg:w-40 lg:h-40 rounded-full border border-white/30 animate-ripple"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                {/* Center image */}
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 z-10">
                  <Image
                    src="/iobit/bits/bits1.svg"
                    alt="BIT Rewards"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Slide 3: Rocket */}
            {currentSlide === 2 && (
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 animate-float">
                <Image
                  src="/iobit/bits/token.svg"
                  alt="Token Launch"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-2 lg:bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'w-8 h-1 rounded-sm transition-all',
                currentSlide === index
                  ? 'bg-[#16DE93]'
                  : 'bg-[#2a2a2f] hover:bg-[#3a3a3f]'
              )}
            />
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(0) translateX(10px);
          }
          75% {
            transform: translateY(10px) translateX(5px);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        :global(.animate-bounce-slow) {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        :global(.animate-spin-slow) {
          animation: spin-slow 20s linear infinite;
        }
        :global(.animate-float) {
          animation: float 4s ease-in-out infinite;
        }
        :global(.animate-pulse-slow) {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        :global(.animation-delay-300) {
          animation-delay: 0.3s;
        }
        :global(.animation-delay-500) {
          animation-delay: 0.5s;
        }
        :global(.animation-delay-600) {
          animation-delay: 0.6s;
        }
        :global(.animation-delay-900) {
          animation-delay: 0.9s;
        }
        :global(.animation-delay-1000) {
          animation-delay: 1s;
        }
        :global(.animation-delay-1200) {
          animation-delay: 1.2s;
        }
        :global(.animation-delay-1500) {
          animation-delay: 1.5s;
        }
        :global(.animation-delay-1800) {
          animation-delay: 1.8s;
        }
        :global(.animation-delay-2100) {
          animation-delay: 2.1s;
        }
        :global(.animate-ripple) {
          animation: ripple 3s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
