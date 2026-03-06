'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// CDN URL for cryptocurrency icons (fallback for missing local icons)
const CRYPTO_ICONS_CDN = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color';

// All local icon paths - Use /icons/coins/ folder as primary source
const LOCAL_ICONS: Record<string, string> = {
  // Main coins from /icons/coins/ folder
  AAVE: '/icons/coins/AAVE.png',
  ADA: '/icons/coins/ADA.png',
  AERO: '/icons/coins/AERO.png',
  ALGO: '/icons/coins/ALGO.png',
  APE: '/icons/coins/APE.png',
  APT: '/icons/coins/APT.png',
  AR: '/icons/coins/AR.png',
  ARB: '/icons/coins/ARB.png',
  ATOM: '/icons/coins/ATOM.png',
  AVAX: '/icons/coins/AVAX.png',
  AXS: '/icons/coins/AXS.png',
  BCH: '/icons/coins/BCH.png',
  BERA: '/icons/coins/BERA.png',
  BLUR: '/icons/coins/BLUR.png',
  BLZ: '/icons/coins/BLZ.png',
  BNB: '/icons/coins/BNB.png',
  BOME: '/icons/coins/BOME.png',
  BONK: '/icons/coins/BONK.png',
  BSV: '/icons/coins/BSV.png',
  BTC: '/icons/coins/BTC.png',
  CAKE: '/icons/coins/CAKE.png',
  CELO: '/icons/coins/CELO.png',
  COMP: '/icons/coins/COMP.png',
  CRV: '/icons/coins/CRV.png',
  DASH: '/icons/coins/DASH.png',
  DOGE: '/icons/coins/DOGE.png',
  DOT: '/icons/coins/DOT.png',
  DYDX: '/icons/coins/DYDX.png',
  DYM: '/icons/coins/DYM.png',
  EIGEN: '/icons/coins/EIGEN.png',
  ENA: '/icons/coins/ENA.png',
  ENJ: '/icons/coins/ENJ.png',
  ENS: '/icons/coins/ENS.png',
  EOS: '/icons/coins/EOS.png',
  ETC: '/icons/coins/ETC.png',
  ETH: '/icons/coins/ETH.png',
  ETHFI: '/icons/coins/ETHFI.png',
  FET: '/icons/coins/FET.png',
  FIL: '/icons/coins/FIL.png',
  FTM: '/icons/coins/FTM.png',
  FTT: '/icons/coins/FTT.png',
  FXS: '/icons/coins/FXS.png',
  GALA: '/icons/coins/GALA.png',
  GMT: '/icons/coins/GMT.png',
  GMX: '/icons/coins/GMX.png',
  GRT: '/icons/coins/GRT.png',
  HBAR: '/icons/coins/HBAR.png',
  HYPE: '/icons/coins/HYPE.png',
  ICP: '/icons/coins/ICP.png',
  IMX: '/icons/coins/IMX.png',
  INJ: '/icons/coins/INJ.png',
  IO: '/icons/coins/IO.png',
  IOTA: '/icons/coins/IOTA.png',
  JTO: '/icons/coins/JTO.png',
  JUP: '/icons/coins/JUP.png',
  KAS: '/icons/coins/KAS.png',
  LDO: '/icons/coins/LDO.png',
  LINK: '/icons/coins/LINK.png',
  LTC: '/icons/coins/LTC.png',
  MANA: '/icons/coins/MANA.png',
  MANTA: '/icons/coins/MANTA.png',
  MATIC: '/icons/coins/MATIC.png',
  MEME: '/icons/coins/MEME.png',
  MKR: '/icons/coins/MKR.png',
  MOVE: '/icons/coins/MOVE.png',
  NEAR: '/icons/coins/NEAR.png',
  NEO: '/icons/coins/NEO.png',
  NOT: '/icons/coins/NOT.png',
  OM: '/icons/coins/OM.png',
  OMNI: '/icons/coins/OMNI.png',
  ONDO: '/icons/coins/ONDO.png',
  OP: '/icons/coins/OP.png',
  ORDI: '/icons/coins/ORDI.png',
  PAXG: '/icons/coins/PAXG.png',
  PENDLE: '/icons/coins/PENDLE.png',
  PENGU: '/icons/coins/PENGU.png',
  PEOPLE: '/icons/coins/PEOPLE.png',
  PEPE: '/icons/coins/PEPE.png',
  PNUT: '/icons/coins/PNUT.png',
  POPCAT: '/icons/coins/POPCAT.png',
  PYTH: '/icons/coins/PYTH.png',
  RENDER: '/icons/coins/RENDER.png',
  RNDR: '/icons/coins/RNDR.png',
  RSR: '/icons/coins/RSR.png',
  RUNE: '/icons/coins/RUNE.png',
  SAGA: '/icons/coins/SAGA.png',
  SAND: '/icons/coins/SAND.png',
  SEI: '/icons/coins/SEI.png',
  SHIB: '/icons/coins/SHIB.png',
  SNX: '/icons/coins/SNX.png',
  SOL: '/icons/coins/SOL.png',
  STRK: '/icons/coins/STRK.png',
  STX: '/icons/coins/STX.png',
  SUI: '/icons/coins/SUI.png',
  SUSHI: '/icons/coins/SUSHI.png',
  TAO: '/icons/coins/TAO.png',
  TIA: '/icons/coins/TIA.png',
  TON: '/icons/coins/TON.png',
  TRUMP: '/icons/coins/TRUMP.png',
  TRX: '/icons/coins/TRX.png',
  UNI: '/icons/coins/UNI.png',
  USUAL: '/icons/coins/USUAL.png',
  VET: '/icons/coins/VET.png',
  VIRTUAL: '/icons/coins/VIRTUAL.png',
  W: '/icons/coins/W.png',
  WIF: '/icons/coins/WIF.png',
  WLD: '/icons/coins/WLD.png',
  XLM: '/icons/coins/XLM.png',
  XMR: '/icons/coins/XMR.png',
  XRP: '/icons/coins/XRP.png',
  YGG: '/icons/coins/YGG.png',
  ZEC: '/icons/coins/ZEC.png',
  ZETA: '/icons/coins/ZETA.png',
  ZK: '/icons/coins/ZK.png',
  ZRO: '/icons/coins/ZRO.png',
  // Additional icons from /iobit/chain/ folder
  USDC: '/iobit/chain/usdc.svg',
  // Legacy icons from /iobit/chain/icons/ folder
  '1INCH': '/iobit/chain/icons/1inch.png',
  ANKR: '/iobit/chain/icons/ankr.png',
  BAL: '/iobit/chain/icons/bal.png',
  BAND: '/iobit/chain/icons/band.png',
  BAT: '/iobit/chain/icons/bat.png',
  BEAM: '/iobit/chain/icons/beam.png',
  CHZ: '/iobit/chain/icons/chz.png',
  DCR: '/iobit/chain/icons/dcr.png',
  GAS: '/iobit/chain/icons/gas.png',
  IOST: '/iobit/chain/icons/iost.png',
  IOTX: '/iobit/chain/icons/iotx.png',
  KNC: '/iobit/chain/icons/knc.png',
  KSM: '/iobit/chain/icons/ksm.png',
  LPT: '/iobit/chain/icons/lpt.png',
  LRC: '/iobit/chain/icons/lrc.png',
  NKN: '/iobit/chain/icons/nkn.png',
  ONE: '/iobit/chain/icons/one.png',
  ONT: '/iobit/chain/icons/ont.png',
  OXT: '/iobit/chain/icons/oxt.png',
  QTUM: '/iobit/chain/icons/qtum.png',
  RLC: '/iobit/chain/icons/rlc.png',
  RVN: '/iobit/chain/icons/rvn.png',
  SC: '/iobit/chain/icons/sc.png',
  STORJ: '/iobit/chain/icons/storj.png',
  SYS: '/iobit/chain/icons/sys.png',
  THETA: '/iobit/chain/icons/theta.png',
  WAVES: '/iobit/chain/icons/waves.png',
  WBTC: '/iobit/chain/icons/wbtc.png',
  XTZ: '/iobit/chain/icons/xtz.png',
  YFI: '/iobit/chain/icons/yfi.png',
  ZEN: '/iobit/chain/icons/zen.png',
  ZIL: '/iobit/chain/icons/zil.png',
  ZRX: '/iobit/chain/icons/zrx.png',
};

// Coins that have CDN icons available (lowercase symbol -> CDN filename)
const CDN_ICONS: Record<string, string> = {
  // Popular coins with CDN icons
  ftm: 'ftm',
  ton: 'ton',
  floki: 'floki',
  wif: 'wif',
  bonk: 'bonk',
  meme: 'meme',
  dydx: 'dydx',
  jup: 'jup',
  ray: 'ray',
  pendle: 'pendle',
  ena: 'ena',
  cake: 'cake',
  rune: 'rune',
  ldo: 'ldo',
  fxs: 'fxs',
  axs: 'axs',
  gala: 'gala',
  ilv: 'ilv',
  blur: 'blur',
  ondo: 'ondo',
  pyth: 'pyth',
  render: 'rndr',
  hnt: 'hnt',
  imx: 'imx',
  mnt: 'mnt',
  zk: 'zk',
  strk: 'strk',
  ordi: 'ordi',
  w: 'w',
  jto: 'jto',
  paxg: 'paxg',
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
  // Additional popular coins
  FTM: '#1969FF',
  TON: '#0098EA',
  HYPE: '#16DE93',
  FLOKI: '#F7931A',
  WIF: '#A855F7',
  BONK: '#F97316',
  MEME: '#EC4899',
  NEIRO: '#8B5CF6',
  POPCAT: '#F59E0B',
  MEW: '#10B981',
  TRUMP: '#DC2626',
  FARTCOIN: '#84CC16',
  AI16Z: '#6366F1',
  DYDX: '#6966FF',
  JUP: '#18B665',
  RAY: '#5DFCD3',
  ORCA: '#FFD700',
  PENDLE: '#16A34A',
  ENA: '#8B5CF6',
  CAKE: '#D1884F',
  RUNE: '#33FF99',
  LDO: '#00A3FF',
  FXS: '#000000',
  ETHFI: '#6366F1',
  GALA: '#000000',
  ILV: '#A855F7',
  RONIN: '#1673F0',
  PIXEL: '#E879F9',
  PORTAL: '#8B5CF6',
  BLUR: '#FF6B00',
  ONDO: '#1E40AF',
  ORDI: '#F97316',
  SATS: '#F7931A',
  PYTH: '#E879F9',
  JITO: '#10B981',
  JTO: '#10B981',
  W: '#8B5CF6',
  RENDER: '#000000',
  HNT: '#474DFF',
  IMX: '#17BEBB',
  MNT: '#000000',
  ZK: '#8B8DFC',
  STRK: '#EC796B',
  MANTA: '#1E3A5F',
  BLAST: '#FCFC03',
  BASE: '#0052FF',
  METIS: '#00D2FF',
  PURR: '#FF69B4',
  MOG: '#FF6B00',
  TURBO: '#00D4AA',
  BRETT: '#0066FF',
  SPX6900: '#FF4500',
  MYRO: '#FFD700',
  // New coins
  INIT: '#4F46E5',
  LIT: '#EC4899',
  RESOLV: '#DC2626',
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
  const [cdnError, setCdnError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  // Check for local icon
  const localIconPath = LOCAL_ICONS[symbol];

  // Check for CDN icon
  const cdnIconKey = symbol.toLowerCase();
  const cdnIconFile = CDN_ICONS[cdnIconKey];
  const cdnIconUrl = cdnIconFile ? `${CRYPTO_ICONS_CDN}/${cdnIconFile}.png` : null;

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

  // Try CDN icon as fallback
  if (cdnIconUrl && !cdnError) {
    return (
      <div className={cn(
        sizeConfig.container,
        'rounded-full overflow-hidden flex-shrink-0 bg-[#1a1a1f]',
        className
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cdnIconUrl}
          alt={symbol}
          width={sizeConfig.imageSize}
          height={sizeConfig.imageSize}
          className="w-full h-full object-contain"
          onError={() => setCdnError(true)}
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

// Helper to check if a coin has a local icon or CDN icon
export function hasCoinIcon(symbol: string): boolean {
  return symbol in LOCAL_ICONS || symbol.toLowerCase() in CDN_ICONS;
}

// Helper to get coin color
export function getCoinColor(symbol: string): string {
  return COIN_COLORS[symbol] || generateColor(symbol);
}
