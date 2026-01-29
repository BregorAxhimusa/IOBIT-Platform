# Coin Icons

This directory contains icons for cryptocurrency trading pairs used in the IOBIT platform.

## Available Icons (26 coins)

- **Major Coins**: BTC, ETH, SOL, BNB, XRP, DOGE, LTC, ADA, DOT
- **Layer 1/2**: AVAX, MATIC, ATOM, ARB, OP, NEAR, FTM
- **DeFi/Apps**: LINK, UNI, APT, SUI
- **Trending**: WIF, PEPE, SEI, INJ, TIA

## Adding New Icons

1. Download the icon from [CryptoLogos](https://cryptologos.cc/) or similar source:
   ```bash
   cd public/icons/coins
   curl -L -o SYMBOL.png "https://cryptologos.cc/logos/symbol-name-logo.png?v=029"
   ```

2. Update the available icons list in `/src/lib/utils/get-coin-icon.ts`:
   ```typescript
   const availableIcons = [
     'BTC', 'ETH', // ... existing coins
     'NEWSYMBOL'  // add new symbol here
   ];
   ```

3. Icon specifications:
   - Format: PNG
   - Recommended size: 200x200px or larger
   - File naming: UPPERCASE (e.g., `BTC.png`, `ETH.png`)

## Fallback

If a coin icon is not available, the system will automatically use `default.png` (Bitcoin icon).

## Usage

Icons are automatically displayed in:
- Market Info Bar (top left)
- Markets Dropdown Menu
- Any component using `getCoinIcon(symbol)` utility function

## Notes

- Icons are loaded from the `/public/icons/coins/` directory
- Next.js Image component is used for optimized loading
- Icons are displayed as 20x20px (dropdown) and 28x28px (main symbol)
