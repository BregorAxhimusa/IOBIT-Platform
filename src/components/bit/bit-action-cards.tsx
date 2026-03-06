'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
}

function ActionCard({ icon, title, subtitle, buttonText, buttonHref }: ActionCardProps) {
  return (
    <div className="flex-1 flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b md:border-b-0 md:border-r border-[#1a1a1f] last:border-b-0 last:border-r-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <Image
            src={icon}
            alt={title}
            width={24}
            height={24}
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </div>
        <div>
          <h3 className="text-white text-sm sm:text-base md:text-lg font-medium">{title}</h3>
          <p className="text-[#6b6b6b] text-[10px] sm:text-xs md:text-sm">{subtitle}</p>
        </div>
      </div>
      <Link
        href={buttonHref}
        className="bg-white text-black rounded-[5px] px-2.5 sm:px-4 md:px-6 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium hover:bg-white/90 transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  );
}

export function BitActionCards() {
  return (
    <div className="w-full border-t border-[#1a1a1f] bg-[#0a0a0c]">
      <div className="flex flex-col md:flex-row">
        <ActionCard
          icon="/iobit/bits/trade.svg"
          title="Trade"
          subtitle="Earn from Trading"
          buttonText="Trade Now"
          buttonHref="/trade/BTC"
        />
        <ActionCard
          icon="/iobit/bits/invite.svg"
          title="Invite"
          subtitle="Earn from Referrals"
          buttonText="Invite Now"
          buttonHref="/earn"
        />
        <ActionCard
          icon="/iobit/bits/vault.svg"
          title="Earn"
          subtitle="Earn from Vault"
          buttonText="Deposit Now"
          buttonHref="/earn"
        />
      </div>

      {/* Spacer */}
      <div className="py-6 sm:py-8 md:py-12 border-t border-[#1a1a1f]" />
    </div>
  );
}
