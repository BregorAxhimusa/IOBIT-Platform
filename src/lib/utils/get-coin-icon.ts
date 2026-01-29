/**
 * Returns the path to a coin's icon
 * @param symbol - The coin symbol (e.g., 'BTC', 'ETH')
 * @returns Path to the icon, or default icon if not found
 */
export function getCoinIcon(symbol: string): string {
  // List of available coin icons (48 total)
  const availableIcons = [
    // Major Coins
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'LTC', 'ADA', 'DOT',

    // Layer 1/Layer 2
    'AVAX', 'MATIC', 'ATOM', 'ARB', 'OP', 'NEAR', 'FTM', 'ALGO',
    'BCH', 'ETC', 'XLM', 'VET', 'FIL', 'EOS', 'STX',

    // DeFi & Apps
    'LINK', 'UNI', 'APT', 'SUI', 'AAVE', 'CRV', 'SUSHI', 'GRT',
    'ENJ', 'SAND', 'MANA', 'IMX', 'PENDLE',

    // Trending & Meme
    'WIF', 'PEPE', 'SHIB', 'BONK',

    // Other
    'SEI', 'INJ', 'TIA', 'HBAR', 'JUP', 'RUNE', 'ORDI'
  ];

  const upperSymbol = symbol.toUpperCase();

  if (availableIcons.includes(upperSymbol)) {
    return `/icons/coins/${upperSymbol}.png`;
  }

  return '/icons/coins/default.png';
}
