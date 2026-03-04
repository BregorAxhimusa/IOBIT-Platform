'use client';

import { useState, useEffect, useCallback } from 'react';

// CoinGecko symbol mapping (Hyperliquid symbol -> CoinGecko ID)
const SYMBOL_TO_COINGECKO: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  BNB: 'binancecoin',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ARB: 'arbitrum',
  OP: 'optimism',
  MATIC: 'matic-network',
  PEPE: 'pepe',
  NEAR: 'near',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  AAVE: 'aave',
  GMX: 'gmx',
  SHIB: 'shiba-inu',
  SUI: 'sui',
  APT: 'aptos',
  SEI: 'sei-network',
  TIA: 'celestia',
  INJ: 'injective-protocol',
  FIL: 'filecoin',
  IMX: 'immutable-x',
  RENDER: 'render-token',
  STX: 'stacks',
  MKR: 'maker',
  RUNE: 'thorchain',
  FTM: 'fantom',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',
  GALA: 'gala',
  ENS: 'ethereum-name-service',
  CRV: 'curve-dao-token',
  LDO: 'lido-dao',
  APE: 'apecoin',
  BLUR: 'blur',
  WLD: 'worldcoin-wld',
  JTO: 'jito-governance-token',
  PYTH: 'pyth-network',
  JUP: 'jupiter-exchange-solana',
  W: 'wormhole',
  ENA: 'ethena',
  STRK: 'starknet',
  DYM: 'dymension',
  PENDLE: 'pendle',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
  ORDI: 'ordinals',
  SATS: '1000sats',
  TRX: 'tron',
  TON: 'the-open-network',
  HBAR: 'hedera-hashgraph',
  VET: 'vechain',
  ALGO: 'algorand',
  XLM: 'stellar',
  ETC: 'ethereum-classic',
  BCH: 'bitcoin-cash',
  ICP: 'internet-computer',
  FET: 'fetch-ai',
  RNDR: 'render-token',
  GRT: 'the-graph',
  THETA: 'theta-token',
  XTZ: 'tezos',
  EOS: 'eos',
  FLOW: 'flow',
  KAVA: 'kava',
  NEO: 'neo',
  EGLD: 'elrond-erd-2',
  MINA: 'mina-protocol',
  SNX: 'havven',
  CAKE: 'pancakeswap-token',
  '1INCH': '1inch',
  COMP: 'compound-governance-token',
  YFI: 'yearn-finance',
  BAL: 'balancer',
  SUSHI: 'sushi',
  ZRX: '0x',
  KNC: 'kyber-network-crystal',
  DYDX: 'dydx',
};

export interface MarketCapData {
  [symbol: string]: {
    marketCap: number;
    marketCapRank: number;
  };
}

const CACHE_KEY = 'iobit-market-cap-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: MarketCapData;
  timestamp: number;
}

function getFromCache(): MarketCapData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CacheData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCache(data: MarketCapData): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CacheData = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
}

export function useMarketCap() {
  const [marketCaps, setMarketCaps] = useState<MarketCapData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketCaps = useCallback(async () => {
    // Check cache first
    const cached = getFromCache();
    if (cached) {
      setMarketCaps(cached);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all CoinGecko IDs
      const ids = Object.values(SYMBOL_TO_COINGECKO).join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&sparkline=false`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: {
        id: string;
        symbol: string;
        market_cap: number;
        market_cap_rank: number;
      }[] = await response.json();

      // Build reverse mapping (CoinGecko ID -> Hyperliquid symbol)
      const geckoToSymbol: Record<string, string> = {};
      for (const [symbol, geckoId] of Object.entries(SYMBOL_TO_COINGECKO)) {
        geckoToSymbol[geckoId] = symbol;
      }

      // Map data to our format
      const result: MarketCapData = {};
      for (const coin of data) {
        const symbol = geckoToSymbol[coin.id];
        if (symbol) {
          result[symbol] = {
            marketCap: coin.market_cap || 0,
            marketCapRank: coin.market_cap_rank || 0,
          };
        }
      }

      setMarketCaps(result);
      setCache(result);
    } catch (err) {
      console.error('Error fetching market caps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market caps');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketCaps();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketCaps, CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchMarketCaps]);

  const getMarketCap = useCallback((symbol: string): number => {
    return marketCaps[symbol]?.marketCap || 0;
  }, [marketCaps]);

  return {
    marketCaps,
    isLoading,
    error,
    getMarketCap,
    refetch: fetchMarketCaps,
  };
}

// Helper to check if we have market cap mapping for a symbol
export function hasMarketCapMapping(symbol: string): boolean {
  return symbol in SYMBOL_TO_COINGECKO;
}
