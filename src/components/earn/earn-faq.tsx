'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { EarnSectionHeader } from './earn-section-header';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is IOBit?',
    answer:
      'IOBit is a revolutionary multi-chain token launcher and trading platform owned by its community. It allows users to create, launch, and trade tokens across multiple blockchains seamlessly.',
  },
  {
    question: "How does IOBit's multi-chain system work?",
    answer:
      "IOBit's multi-chain system operates across multiple blockchains simultaneously. Users can create tokens on one chain and trade them on another, with unified pricing and liquidity pools that work together seamlessly.",
  },
  {
    question: 'Can I create my own token on IOBit?',
    answer:
      'Yes! IOBit provides a user-friendly interface for creating and launching your own tokens across multiple blockchains. The platform handles the technical complexities, making token creation accessible to everyone.',
  },
  {
    question: 'How does the community benefit from IOBit?',
    answer:
      "As a community-owned platform, IOBit shares revenue with its users. Community members have governance rights and benefit from the platform's growth through various reward mechanisms and token distributions.",
  },
  {
    question: 'What makes IOBit different from other exchanges?',
    answer:
      "IOBit stands out with its multi-chain token creation capabilities, community ownership model, unified pricing across chains, and integrated trading engine. It's not just an exchange but a complete Web3 ecosystem.",
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#1a1a1f] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 md:px-8 lg:px-12 py-4 md:py-5 text-left group"
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
        <p className="px-6 md:px-8 lg:px-12 text-[#a0a0a5] text-xs md:text-sm leading-relaxed pr-8">{item.answer}</p>
      </div>
    </div>
  );
}

export function EarnFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full border-t border-[#1a1a1f] bg-[#0a0a0c]">
      {/* Container with vertical borders */}
      <div className="max-w-6xl mx-auto border-l border-r border-[#1a1a1f]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Header */}
          <div className="px-6 md:px-8 lg:px-12 py-6 md:py-10 lg:py-4 border-b lg:border-b-0 lg:border-r border-[#1a1a1f]">
            <EarnSectionHeader
              badge="FAQ"
              title="Frequently asked questions."
              subtitle="Find everything you need to know about IOBit, from security to supported assets."
            />
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
      <div className="py-8 md:py-12 border-t border-[#1a1a1f]" />
    </div>
  );
}
