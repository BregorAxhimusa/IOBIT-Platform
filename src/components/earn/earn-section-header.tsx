'use client';

import Image from 'next/image';

interface EarnSectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export function EarnSectionHeader({ badge, title, subtitle }: EarnSectionHeaderProps) {
  return (
    <div className="text-left">
      {/* Badge */}
      {badge && (
        <span className="inline-flex items-center gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg w-fit text-[10px] md:text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px] mb-4 md:mb-6">
          <Image
            src="/iobit/landingpage/faq.svg"
            alt=""
            width={14}
            height={14}
            className="w-3 h-3 md:w-3.5 md:h-3.5"
          />
          {badge}
        </span>
      )}

      {/* Title */}
      <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium mb-3 md:mb-4">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[#6b6b6b] text-xs md:text-sm leading-relaxed max-w-md">
          {subtitle}
        </p>
      )}
    </div>
  );
}
