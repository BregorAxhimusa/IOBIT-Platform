import { SPOT_ASSET_INDEX_OFFSET } from './constants';
import type { SpotMeta, SpotAssetCtx } from '@/lib/hyperliquid/types';

/**
 * Spot assets use index = 10000 + spotMeta.universe[i].index
 */
export function getSpotAssetIndex(spotPairIndex: number): number {
  return SPOT_ASSET_INDEX_OFFSET + spotPairIndex;
}

/**
 * Convert spot pair index to coin name format for API
 */
export function getSpotCoinName(spotPairIndex: number): string {
  return `@${spotPairIndex}`;
}

/**
 * Check if an asset index refers to a spot asset
 */
export function isSpotAsset(assetIndex: number): boolean {
  return assetIndex >= SPOT_ASSET_INDEX_OFFSET;
}

/**
 * Parse spot pair name for display
 * e.g. "PURR/USDC" → { base: "PURR", quote: "USDC" }
 */
export function parseSpotPairName(pairName: string): {
  base: string;
  quote: string;
} {
  const [base, quote] = pairName.split('/');
  return { base: base || pairName, quote: quote || 'USDC' };
}

/**
 * Get the spot price for a token from asset contexts
 */
export function getSpotPrice(
  tokenIndex: number,
  spotMeta: SpotMeta | null,
  spotAssetCtxs: SpotAssetCtx[]
): number {
  if (!spotMeta) return 0;

  // Find which pair has this token as base
  const pairIdx = spotMeta.universe.findIndex(
    (p) => p.tokens[0] === tokenIndex
  );
  if (pairIdx === -1) return 0;

  const ctx = spotAssetCtxs[pairIdx];
  if (!ctx) return 0;

  return parseFloat(ctx.midPx) || parseFloat(ctx.markPx) || 0;
}

/**
 * Detect if a URL symbol is a spot market
 * e.g. "PURR-USDC" → true, "BTC" → false
 */
export function isSpotSymbol(symbol: string): boolean {
  return symbol.includes('-') && symbol.endsWith('USDC');
}

/**
 * Convert URL symbol to display format
 * "PURR-USDC" → "PURR/USDC", "BTC" → "BTC"
 */
export function symbolToDisplay(symbol: string): string {
  if (isSpotSymbol(symbol)) {
    return symbol.replace('-', '/');
  }
  return symbol;
}

/**
 * Convert display format to URL format
 * "PURR/USDC" → "PURR-USDC"
 */
export function displayToSymbol(display: string): string {
  return display.replace('/', '-');
}
