'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// All local icon paths - SVG icons have priority, then downloaded PNGs
const LOCAL_ICONS: Record<string, string> = {
  // Original SVG icons (higher quality)
  BTC: '/iobit/chain/btc.svg',
  ETH: '/iobit/chain/etherium.svg',
  SOL: '/iobit/chain/solana.svg',
  DOGE: '/iobit/chain/dogecoin-doge-logo.svg',
  XRP: '/iobit/chain/xrp-xrp-logo.svg',
  BNB: '/iobit/chain/bnb.svg',
  ADA: '/iobit/chain/cardano-ada-logo.svg',
  AVAX: '/iobit/chain/avalanche-avax-logo.svg',
  DOT: '/iobit/chain/dot.svg',
  LINK: '/iobit/chain/chainlink-link-logo.svg',
  UNI: '/iobit/chain/uniswap-uni-logo.svg',
  ARB: '/iobit/chain/arb.svg',
  OP: '/iobit/chain/optimism-ethereum-op-logo.svg',
  MATIC: '/iobit/chain/matic.svg',
  PEPE: '/iobit/chain/pepe-pepe-logo.svg',
  NEAR: '/iobit/chain/near-protocol-near-logo.svg',
  ATOM: '/iobit/chain/cosmos-atom-logo.svg',
  LTC: '/iobit/chain/litecoin-ltc-logo.svg',
  AAVE: '/iobit/chain/aave-aave-logo.svg',
  GMX: '/iobit/chain/gmx-logo.svg',
  USDC: '/iobit/chain/usdc.svg',
  // Original PNG icons
  SHIB: '/iobit/chain/shib.png',
  SUI: '/iobit/chain/sui.png',
  APT: '/iobit/chain/apt.png',
  SEI: '/iobit/chain/sei.png',
  TIA: '/iobit/chain/tia.png',
  INJ: '/iobit/chain/inj.png',
  // Downloaded PNG icons from CDN
  '1INCH': '/iobit/chain/icons/1inch.png',
  ALGO: '/iobit/chain/icons/algo.png',
  ANKR: '/iobit/chain/icons/ankr.png',
  APE: '/iobit/chain/icons/ape.png',
  BAL: '/iobit/chain/icons/bal.png',
  BAND: '/iobit/chain/icons/band.png',
  BAT: '/iobit/chain/icons/bat.png',
  BCH: '/iobit/chain/icons/bch.png',
  BEAM: '/iobit/chain/icons/beam.png',
  CHZ: '/iobit/chain/icons/chz.png',
  COMP: '/iobit/chain/icons/comp.png',
  CRV: '/iobit/chain/icons/crv.png',
  DASH: '/iobit/chain/icons/dash.png',
  DCR: '/iobit/chain/icons/dcr.png',
  ENJ: '/iobit/chain/icons/enj.png',
  EOS: '/iobit/chain/icons/eos.png',
  ETC: '/iobit/chain/icons/etc.png',
  FIL: '/iobit/chain/icons/fil.png',
  GAS: '/iobit/chain/icons/gas.png',
  GMT: '/iobit/chain/icons/gmt.png',
  GRT: '/iobit/chain/icons/grt.png',
  ICP: '/iobit/chain/icons/icp.png',
  IOST: '/iobit/chain/icons/iost.png',
  IOTX: '/iobit/chain/icons/iotx.png',
  KNC: '/iobit/chain/icons/knc.png',
  KSM: '/iobit/chain/icons/ksm.png',
  LPT: '/iobit/chain/icons/lpt.png',
  LRC: '/iobit/chain/icons/lrc.png',
  MANA: '/iobit/chain/icons/mana.png',
  MKR: '/iobit/chain/icons/mkr.png',
  NEO: '/iobit/chain/icons/neo.png',
  NKN: '/iobit/chain/icons/nkn.png',
  ONE: '/iobit/chain/icons/one.png',
  ONT: '/iobit/chain/icons/ont.png',
  OXT: '/iobit/chain/icons/oxt.png',
  QTUM: '/iobit/chain/icons/qtum.png',
  RLC: '/iobit/chain/icons/rlc.png',
  RVN: '/iobit/chain/icons/rvn.png',
  SAND: '/iobit/chain/icons/sand.png',
  SC: '/iobit/chain/icons/sc.png',
  SNX: '/iobit/chain/icons/snx.png',
  STORJ: '/iobit/chain/icons/storj.png',
  STX: '/iobit/chain/icons/stx.png',
  SUSHI: '/iobit/chain/icons/sushi.png',
  SYS: '/iobit/chain/icons/sys.png',
  THETA: '/iobit/chain/icons/theta.png',
  TRX: '/iobit/chain/icons/trx.png',
  VET: '/iobit/chain/icons/vet.png',
  WAVES: '/iobit/chain/icons/waves.png',
  WBTC: '/iobit/chain/icons/wbtc.png',
  XLM: '/iobit/chain/icons/xlm.png',
  XMR: '/iobit/chain/icons/xmr.png',
  XTZ: '/iobit/chain/icons/xtz.png',
  YFI: '/iobit/chain/icons/yfi.png',
  ZEC: '/iobit/chain/icons/zec.png',
  ZEN: '/iobit/chain/icons/zen.png',
  ZIL: '/iobit/chain/icons/zil.png',
  ZRX: '/iobit/chain/icons/zrx.png',
};

// Fallback colors for coins
const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  DOGE: '#C2A633',
  XRP: '#23292F',
  BNB: '#F3BA2F',
  ADA: '#0033AD',
  AVAX: '#E84142',
  DOT: '#E6007A',
  LINK: '#2A5ADA',
  UNI: '#FF007A',
  ARB: '#28A0F0',
  OP: '#FF0420',
  MATIC: '#8247E5',
  PEPE: '#479F53',
  SHIB: '#FFA409',
  NEAR: '#00C08B',
  SUI: '#4DA2FF',
  APT: '#06D6A0',
  SEI: '#9B1C1C',
  TIA: '#7C3AED',
  INJ: '#00F2FE',
  ATOM: '#2E3148',
  LTC: '#BFBBBB',
  AAVE: '#B6509E',
  GMX: '#2D42FC',
  USDC: '#2775CA',
  ALGO: '#000000',
  FIL: '#0090FF',
  SAND: '#04ADEF',
  MANA: '#FF2D55',
  AXS: '#0055D5',
  ENJ: '#7866D5',
  CHZ: '#CD0124',
  GRT: '#6747ED',
  SNX: '#00D1FF',
  CRV: '#40649F',
  COMP: '#00D395',
  MKR: '#1AAB9B',
  YFI: '#006AE3',
  SUSHI: '#FA52A0',
  BAL: '#1E1E1E',
  WBTC: '#F09242',
  THETA: '#2AB8E6',
  VET: '#15BDFF',
  TRX: '#FF0013',
  XLM: '#000000',
  EOS: '#000000',
  XMR: '#FF6600',
  ZEC: '#ECB244',
  DASH: '#008CE7',
  ETC: '#328332',
  BCH: '#8DC351',
  NEO: '#00E599',
  KSM: '#000000',
  ICP: '#29ABE2',
  STX: '#5546FF',
  WAVES: '#0055FF',
};

// Generate a consistent color from symbol
function generateColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

interface CoinIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: { container: 'w-6 h-6', text: 'text-[8px]', imageSize: 24 },
  md: { container: 'w-8 h-8', text: 'text-[10px]', imageSize: 32 },
  lg: { container: 'w-10 w-10', text: 'text-xs', imageSize: 40 },
  xl: { container: 'w-12 h-12', text: 'text-sm', imageSize: 48 },
};

export function CoinIcon({ symbol, size = 'md', className }: CoinIconProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  // Check for local icon
  const localIconPath = LOCAL_ICONS[symbol];

  // If we have a local icon and no error, use it
  if (localIconPath && !imageError) {
    return (
      <div className={cn(
        sizeConfig.container,
        'rounded-full overflow-hidden flex-shrink-0 bg-[#1a1a1f]',
        className
      )}>
        <Image
          src={localIconPath}
          alt={symbol}
          width={sizeConfig.imageSize}
          height={sizeConfig.imageSize}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback to colored circle with initials
  const bgColor = COIN_COLORS[symbol] || generateColor(symbol);
  return (
    <div
      className={cn(
        sizeConfig.container,
        'rounded-full flex items-center justify-center text-white font-bold flex-shrink-0',
        sizeConfig.text,
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

// Export for backwards compatibility
export const COIN_ICONS = LOCAL_ICONS;
export { COIN_COLORS };

// Helper to check if a coin has a local icon
export function hasCoinIcon(symbol: string): boolean {
  return symbol in LOCAL_ICONS;
}

// Helper to get coin color
export function getCoinColor(symbol: string): string {
  return COIN_COLORS[symbol] || generateColor(symbol);
}
