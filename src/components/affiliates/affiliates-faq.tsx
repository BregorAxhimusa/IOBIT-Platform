'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is the IOBit Affiliate Program?',
    answer:
      'The IOBit Affiliate Program allows you to earn rewards by referring new traders to our platform. When someone signs up using your unique referral link and starts trading, you earn a percentage of their trading fees as commission.',
  },
  {
    question: 'How much can I earn as an affiliate?',
    answer:
      'Your earnings depend on the trading volume of your referrals. On average, affiliates with 120 active traders earn approximately $3,950 USDT per month. The more traders you refer, the higher your potential earnings.',
  },
  {
    question: 'How do I get my referral link?',
    answer:
      'After connecting your wallet, navigate to the Referral Page in your account menu. Your unique referral link will be displayed there, and you can copy it with one click to share across your networks.',
  },
  {
    question: 'When do I receive my affiliate rewards?',
    answer:
      'Affiliate rewards are calculated in real-time and credited to your wallet automatically. You can track your earnings on the Referral Page and withdraw them at any time with no minimum threshold.',
  },
  {
    question: 'Is there a limit to how many people I can refer?',
    answer:
      'No, there is no limit! You can refer as many traders as you want. The more active traders you bring to IOBit, the more you earn. We encourage our affiliates to grow their networks as much as possible.',
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#1a1a1f] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 text-left group"
      >
        <span
          className={cn(
            'text-sm md:text-base font-medium pr-4 transition-colors',
            isOpen ? 'text-[#16DE93]' : 'text-white group-hover:text-[#16DE93]'
          )}
        >
          {item.question}
        </span>
        {/* Plus/Minus Icon */}
        <span
          className={cn(
            'w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 transition-colors',
            isOpen ? 'text-[#16DE93]' : 'text-[#6b6b6b]'
          )}
        >
          {isOpen ? (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          ) : (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </span>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-48 pb-4 md:pb-5' : 'max-h-0'
        )}
      >
        <p className="px-4 sm:px-6 md:px-8 lg:px-12 text-[#a0a0a5] text-[11px] sm:text-xs md:text-sm leading-relaxed pr-6 sm:pr-8">{item.answer}</p>
      </div>
    </div>
  );
}

export function AffiliatesFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full border-t border-[#1a1a1f] bg-[#0a0a0c]">
      {/* Container with vertical borders */}
      <div className="max-w-6xl mx-auto border-l border-r border-[#1a1a1f]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Header */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-10 lg:py-4 border-b lg:border-b-0 lg:border-r border-[#1a1a1f]">
            <div className="text-left">
              {/* Badge */}
              <span
                className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px] mb-4 md:mb-6"
                style={{ backgroundColor: 'rgba(0, 98, 81, 0.15)' }}
              >
                <Image
                  src="/iobit/landingpage/faq.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="w-3 h-3 md:w-3.5 md:h-3.5"
                />
                FAQ
              </span>

              {/* Title */}
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium mb-3 md:mb-4">
                Frequently asked questions.
              </h2>

              {/* Subtitle */}
              <p className="text-[#6b6b6b] text-xs md:text-sm leading-relaxed max-w-md">
                Find everything you need to know about the IOBit Affiliate Program, from payouts to referral tracking.
              </p>
            </div>
          </div>

          {/* Right Side - FAQ Accordion */}
          <div>
            {FAQ_ITEMS.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="py-4 md:py-8 lg:py-12 border-t border-[#1a1a1f]" />
    </div>
  );
}
