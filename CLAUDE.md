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

1. **Wallet Connection**: Reown AppKit (WalletConnect) via wagmi in `src/context/index.tsx` and `src/config/index.tsx`. Default network is Arbitrum (not Ethereum mainnet) because Hyperliquid uses Arbitrum for wallet connections.
2. **Network Selection**: `useNetworkStore` (persisted) switches between Hyperliquid mainnet/testnet APIs
3. **Account Context**: `useAccountStore` manages master wallet, sub-accounts, and API wallets for trading
4. **Market Data**: `HyperliquidInfoClient` (read-only) fetches prices, orderbooks, positions, balances
5. **Trading Operations**: `HyperliquidExchangeClient` (write) places/cancels orders, requires EIP-712 signatures from `signing.ts`

### Key Directories

- **`src/lib/hyperliquid/`** - Core Hyperliquid integration:
  - `info-client.ts` - Read-only API (market data, user state, vaults, staking)
  - `exchange-client.ts` - Write API (orders, transfers, staking operations)
  - `signing.ts` - EIP-712 signature functions for all exchange operations
  - `session-agent.ts` - Local agent key management (see Session Agent section)
  - `types.ts` - TypeScript interfaces for Hyperliquid data

- **`src/store/`** - Zustand stores:
  - **Persisted** (localStorage): `network-store.ts`, `account-store.ts`, `favorites-store.ts`
  - **Ephemeral** (in-memory): `trading-store.ts`, `market-store.ts`, `orderbook-store.ts`, `positions-store.ts`, `orders-store.ts`, `trades-store.ts`, `spot-store.ts`, `vault-store.ts`

- **`src/hooks/`** - React hooks wrapping Hyperliquid operations:
  - `use-place-order.ts`, `use-cancel-order.ts`, `use-close-position.ts`
  - `use-trading-context.ts` - combines account store with wallet for correct trading address
  - `use-market-data.ts`, `use-orderbook.ts`, `use-websocket.ts` for real-time data

- **`src/lib/database/`** - Prisma integration:
  - `prisma.ts` - Singleton client (uses `globalThis` pattern for Next.js HMR)
  - Query modules: `users.ts`, `orders.ts`, `positions.ts`, `trades.ts`

- **`src/components/`** - Organized by feature: `trading/`, `portfolio/`, `vaults/`, `staking/`, `referrals/`, `accounts/`, `layout/`, `settings/`, `ui/`

### TradingView Integration

Charts use TradingView widget loaded from CDN (`NEXT_PUBLIC_TRADINGVIEW_CDN`). The chart component lives in `src/components/trading/` and connects to Hyperliquid's data feed.

### EIP-712 Signing Domains

Three distinct signing domains exist in `signing.ts` — this is critical to understand when modifying trading operations:

1. **Non-L1 actions** (transfers, withdrawals): Domain name `"Exchange"`, Arbitrum chainId (42161 mainnet / 421614 testnet), signed by user's wallet
2. **User-signed actions** (approveAgent, approveBuilderFee): Domain name `"HyperliquidSignTransaction"`, Arbitrum chainId, signed by user's wallet
3. **L1 actions** (orders, cancels, leverage, TWAP): Domain name `"Exchange"`, chainId `1337`, signed by session agent's local private key (not the user's wallet)

### Session Agent Pattern

MetaMask rejects L1 actions because the wallet is on Arbitrum (42161) but L1 requires chainId 1337. The session agent solves this:

1. Generate a local keypair (`session-agent.ts`)
2. User's wallet approves the agent once (non-L1 domain, so MetaMask accepts it)
3. All subsequent L1 actions are signed locally with the agent's private key — no wallet popups

Key details:
- Stored in `sessionStorage` (not localStorage) with key `iobit-session-agent-v2`
- Expires after 24 hours
- Validated per wallet address — switching wallets invalidates the agent
- Singleton: `sessionAgent` exported from `session-agent.ts`

### Trading Context Pattern

When placing orders, the system uses a "trading context" that can be:
- **Master wallet** (`type: 'master'`) - direct trading with connected wallet
- **Sub-account** (`type: 'subaccount'`) - separate account under master, uses `vaultAddress` parameter
- **API wallet** - approved trading agent

Use `useAccountStore.getFetchAddress()` to get the correct address for fetching data and `getVaultAddress()` for the vault parameter in exchange calls.

### Order Placement Flow

1. Parse and validate size/price from user input
2. Round size to asset's `szDecimals` (from market metadata)
3. Minimum order value: $10
4. Time-in-force conversion: uppercase to capitalized (`GTC` → `Gtc`, `IOC` → `Ioc`, `ALO` → `Alo`). Market orders always use IOC.
5. Sign with session agent via `signPlaceOrder()`
6. Send via `exchangeClient.placeOrder()`
7. Invalidate TanStack Query keys for positions, orders, and balance

### Hyperliquid API Notes

- All exchange operations require EIP-712 signatures (see `signing.ts`)
- REST: POST to `{BASE_URL}/info` (read) or `{BASE_URL}/exchange` (write)
- Coin symbols use short names: "BTC", "ETH", "SOL" (not "BTC-USD")
- Asset indices in exchange client map coins to numeric IDs (BTC=0, ETH=1, SOL=2, etc.)
- Spot trading uses index offset of 10000 (`SPOT_ASSET_INDEX_OFFSET`)
- Prices use 8 decimal fixed-point, USDC amounts use 6 decimals
- `floatToWire()` strips trailing zeros for price/size formatting
- `roundPrice()` rounds to 5 significant figures

### Spot vs Perpetual

- Spot symbols identified by `isSpotSymbol()` helper in `src/lib/utils/spot-helpers.ts`
- Market type tracked in stores as `'perp'` or `'spot'`
- Spot uses separate metadata endpoints (`spotMeta`, `spotMetaAndAssetCtxs`, `spotClearinghouseState`)
- Display names converted via `symbolToDisplay()`

## Pages

- `/trade/[symbol]` - Trading page for a specific market (e.g., `/trade/BTC`)
- `/market` - Market overview with all available assets
- `/portfolio` - User positions, orders, and trade history
- `/vaults` and `/vaults/[address]` - Managed trading vaults
- `/staking` - HYPE token delegation
- `/referrals` - Referral code management
- `/leaderboard` - Trading leaderboard
- `/settings` and `/settings/accounts` - User preferences and sub-accounts

## API Routes

- `GET /api/user?address=0x...` - Fetch user by wallet address
- `POST /api/user` - Create or get user (called on wallet connect)
- `POST /api/user/preferences` - Update user preferences
- `POST /api/trades/sync` - Sync trade history from Hyperliquid

## Environment Variables Required

```
DATABASE_URL                         # PostgreSQL connection (Supabase) — server-only
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID # WalletConnect/Reown project ID
```

All other config (API endpoints, contract addresses, app metadata) is in `.env.example` — copy to `.env.local`.

## Database

Uses Prisma with PostgreSQL (Supabase). Schema in `prisma/schema.prisma` includes:
- User, UserPreferences
- Trade, Order, Position (with Hyperliquid ID tracking)
- PositionSnapshot for PnL history

Prisma client uses a `globalThis` singleton in `src/lib/database/prisma.ts` to survive Next.js HMR in development.

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push to main/development/testing-local and PRs against main/development. Tests against Node 18.x and 20.x matrix:

1. `npm ci` - Install dependencies
2. `npm run lint` - ESLint
3. `npx tsc --noEmit` - Type check
4. `npm run build` - Build
5. `npm audit --audit-level=moderate` - Security check (separate job, non-blocking)

No test suite currently configured (`npm test --if-present` with `continue-on-error`).
