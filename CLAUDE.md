# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript type check
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client after schema changes
npx prisma studio    # Open Prisma GUI for database
```

## Architecture Overview

This is an **IOBIT** - a crypto perpetual trading platform built with Next.js 15 that integrates with the **Hyperliquid DEX** API. The platform supports both mainnet and testnet, with wallet-based authentication via EIP-712 signatures.

### Path Alias
- `@/*` maps to `./src/*`

### Core Data Flow

1. **Wallet Connection**: Reown AppKit (WalletConnect) via wagmi in `src/context/index.tsx` and `src/config/index.tsx`
2. **Network Selection**: `useNetworkStore` (persisted) switches between Hyperliquid mainnet/testnet APIs
3. **Account Context**: `useAccountStore` manages master wallet, sub-accounts, and API wallets for trading
4. **Market Data**: `HyperliquidInfoClient` (read-only) fetches prices, orderbooks, positions, balances
5. **Trading Operations**: `HyperliquidExchangeClient` (write) places/cancels orders, requires EIP-712 signatures from `signing.ts`

### Key Directories

- **`src/lib/hyperliquid/`** - Core Hyperliquid integration:
  - `info-client.ts` - Read-only API (market data, user state, vaults, staking)
  - `exchange-client.ts` - Write API (orders, transfers, staking operations)
  - `signing.ts` - EIP-712 signature functions for all exchange operations
  - `types.ts` - TypeScript interfaces for Hyperliquid data

- **`src/store/`** - Zustand stores (most are persisted to localStorage):
  - `network-store.ts` - mainnet/testnet selection
  - `account-store.ts` - trading context (master/sub-account/API wallet)
  - `trading-store.ts` - order form state
  - `market-store.ts`, `orderbook-store.ts`, `positions-store.ts`, etc.

- **`src/hooks/`** - React hooks wrapping Hyperliquid operations:
  - `use-place-order.ts`, `use-cancel-order.ts`, `use-close-position.ts`
  - `use-trading-context.ts` - combines account store with wallet for correct trading address
  - `use-market-data.ts`, `use-orderbook.ts`, `use-websocket.ts` for real-time data

### Trading Context Pattern

When placing orders, the system uses a "trading context" that can be:
- **Master wallet** - direct trading with connected wallet
- **Sub-account** - separate account under master, uses `vaultAddress` parameter
- **API wallet** - approved trading agent

Use `useAccountStore.getFetchAddress()` to get the correct address for fetching data and `getVaultAddress()` for the vault parameter in exchange calls.

### Hyperliquid API Notes

- All exchange operations require EIP-712 signatures (see `signing.ts`)
- Coin symbols use short names: "BTC", "ETH", "SOL" (not "BTC-USD")
- Asset indices in exchange client map coins to numeric IDs
- Spot trading uses index offset of 10000 (`SPOT_ASSET_INDEX_OFFSET`)
- Prices use 8 decimal fixed-point, USDC amounts use 6 decimals

## Environment Variables Required

```
DATABASE_URL                         # PostgreSQL connection (Supabase)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID # WalletConnect/Reown project ID
```

## Database

Uses Prisma with PostgreSQL (Supabase). Schema in `prisma/schema.prisma` includes:
- User, UserPreferences
- Trade, Order, Position (with Hyperliquid ID tracking)
- PositionSnapshot for PnL history

## CI Pipeline

GitHub Actions runs on push to main/development:
1. `npm ci` - Install dependencies
2. `npm run lint` - ESLint
3. `npx tsc --noEmit` - Type check
4. `npm run build` - Build
