# IOBIT - Advanced Crypto Trading Platform

A professional perpetual and spot trading platform built with Next.js 15, integrated with the [Hyperliquid DEX](https://hyperliquid.xyz) API. Wallet-based authentication via EIP-712 signatures, real-time market data, and full on-chain trading.

## Features

- **Real-time Trading** - Place market, limit, stop, and advanced orders (TWAP, Scale)
- **Perpetual & Spot Markets** - Trade both perpetual futures and spot markets
- **Session Agent Signing** - One-time wallet approval, then all trades sign locally (no popups)
- **Portfolio Management** - Track positions, orders, trade history, and PnL
- **Vaults** - Invest in managed trading vaults
- **Staking** - Delegate HYPE tokens to validators
- **Referral System** - Create and manage referral codes
- **Sub-Accounts** - Separate trading accounts with isolated balances
- **API Wallets** - Authorize external wallets for automated trading
- **Mainnet & Testnet** - Switch between networks from the UI

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Reown AppKit** - Wallet connection (WalletConnect)
- **wagmi / viem** - React hooks for Ethereum & EIP-712 signing
- **Zustand** - State management (persisted stores)
- **TanStack Query** - Data fetching & caching
- **TradingView** - Advanced price charts

### Hyperliquid Integration
- **Info Client** - Read-only API (market data, positions, balances, vaults, staking)
- **Exchange Client** - Write API (orders, cancels, transfers, leverage)
- **EIP-712 Signing** - All exchange operations require typed signatures
- **Session Agent** - Local keypair approved once, signs L1 actions without wallet popups
- **WebSocket** - Real-time orderbook, trades, and price updates

## Project Structure

```
IOBIT-Platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── trade/[symbol]/     # Trading page
│   │   ├── portfolio/          # Portfolio page
│   │   ├── vaults/             # Vaults page
│   │   ├── staking/            # Staking page
│   │   ├── referrals/          # Referrals page
│   │   ├── leaderboard/        # Leaderboard page
│   │   └── settings/           # Settings & accounts pages
│   ├── components/             # React components
│   │   ├── layout/             # Navbar, Footer, Modals
│   │   ├── trading/            # Trading panel, chart, positions, orderbook
│   │   ├── vaults/             # Vault components
│   │   ├── staking/            # Staking components
│   │   ├── referrals/          # Referral components
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-place-order.ts  # Order placement with signing
│   │   ├── use-close-position.ts # Position closing
│   │   ├── use-session-agent.ts  # Session agent management
│   │   └── ...                 # Market data, balance, websocket hooks
│   ├── lib/                    # Utilities and API clients
│   │   ├── hyperliquid/        # Hyperliquid API integration
│   │   │   ├── info-client.ts  # Read-only API client
│   │   │   ├── exchange-client.ts # Write API client
│   │   │   ├── signing.ts      # EIP-712 signature functions
│   │   │   ├── session-agent.ts # Local agent key management
│   │   │   └── types.ts        # TypeScript interfaces
│   │   └── utils/              # Constants, formatting, helpers
│   ├── store/                  # Zustand state stores
│   └── context/                # React context (wallet providers)
└── public/                     # Static assets
```

## Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type check
```

## Environment Variables

All configuration is managed through `.env.local`. See `.env.example` for the full list.

```env
# Wallet Providers - WalletConnect/Reown
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"

# Hyperliquid API Endpoints
NEXT_PUBLIC_HYPERLIQUID_MAINNET_API="https://api.hyperliquid.xyz"
NEXT_PUBLIC_HYPERLIQUID_TESTNET_API="https://api.hyperliquid-testnet.xyz"
NEXT_PUBLIC_HYPERLIQUID_MAINNET_WS="wss://api.hyperliquid.xyz/ws"
NEXT_PUBLIC_HYPERLIQUID_TESTNET_WS="wss://api.hyperliquid-testnet.xyz/ws"
NEXT_PUBLIC_HYPERLIQUID_STATS_API="https://stats-data.hyperliquid.xyz"

# Contract Addresses (Arbitrum)
NEXT_PUBLIC_HYPERLIQUID_BRIDGE_ADDRESS="0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7"
NEXT_PUBLIC_USDC_MAINNET_ADDRESS="0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
NEXT_PUBLIC_USDC_TESTNET_ADDRESS="0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"

# App Metadata
NEXT_PUBLIC_APP_URL="https://app.iobit.ai"
NEXT_PUBLIC_APP_ICON="https://avatars.githubusercontent.com/u/179229932"

# External Services
NEXT_PUBLIC_TRADINGVIEW_CDN="https://s3.tradingview.com/tv.js"
NEXT_PUBLIC_HYPERLIQUID_TESTNET_APP="https://app.hyperliquid-testnet.xyz"
NEXT_PUBLIC_REFERRAL_BASE_URL="https://app.hyperliquid.xyz/join"
```

## Hyperliquid API Reference

### REST Endpoints

All requests are POST to `{BASE_URL}/info` or `{BASE_URL}/exchange`.

#### Info API (Read-Only)

| Type | Description |
|------|-------------|
| `allMids` | All mid prices for all markets |
| `meta` | Asset metadata (symbols, decimals, max leverage) |
| `metaAndAssetCtxs` | Metadata + market context (mark, mid, funding, OI) |
| `l2Book` | Order book for a specific coin |
| `candleSnapshot` | OHLCV candle data |
| `clearinghouseState` | User positions, balances, margin |
| `frontendOpenOrders` | User open orders |
| `userFills` | User trade history |
| `userFillsByTime` | User fills with time range (paginated) |
| `userFunding` | Funding payments received |
| `userNonFundingLedgerUpdates` | Deposits, withdrawals, transfers |
| `spotMeta` | Spot market metadata |
| `spotMetaAndAssetCtxs` | Spot metadata + price context |
| `spotClearinghouseState` | User spot balances |
| `vaultDetails` | Vault info and positions |
| `vaultSummaries` | All vault summaries |
| `userVaultEquities` | User equity in vaults |
| `subAccounts` | Sub-accounts for a user |
| `extraAgents` | API wallets for a user |
| `referral` | Referral info and stats |
| `validatorSummaries` | Staking validator list |
| `delegations` | User delegations |
| `delegatorSummary` | User staking state |
| `userFees` | User fee tier and rates |
| `historicalOrders` | Order history |

#### Exchange API (Write - requires EIP-712 signature)

| Action | Description |
|--------|-------------|
| `order` | Place order (market, limit, stop) |
| `cancel` | Cancel order by OID |
| `cancelByCloid` | Cancel order by client order ID |
| `updateLeverage` | Set leverage for a coin |
| `updateIsolatedMargin` | Adjust isolated margin |
| `usdSend` | Transfer USDC between accounts |
| `withdraw3` | Withdraw USDC to Arbitrum |
| `vaultTransfer` | Deposit/withdraw from vault |
| `setReferrer` | Set referral code |
| `createSubAccount` | Create a sub-account |
| `subAccountTransfer` | Transfer between sub-accounts |
| `approveAgent` | Approve a session/API agent |
| `approveBuilderFee` | Approve builder fee |
| `tokenDelegate` | Delegate HYPE to validator |

### Stats Data API

| Endpoint | Description |
|----------|-------------|
| `/{Network}/vaults` | Vault performance data |
| `/{Network}/leaderboard` | Trading leaderboard |

### WebSocket

Connect to `wss://api.hyperliquid.xyz/ws` and subscribe:

```json
{"method": "subscribe", "subscription": {"type": "allMids"}}
{"method": "subscribe", "subscription": {"type": "l2Book", "coin": "BTC"}}
{"method": "subscribe", "subscription": {"type": "trades", "coin": "BTC"}}
{"method": "subscribe", "subscription": {"type": "userEvents", "user": "0x..."}}
```

## Resources

- [Hyperliquid Docs](https://hyperliquid.gitbook.io/hyperliquid-docs)
- [Hyperliquid API Examples](https://github.com/hyperliquid-dex/hyperliquid-python-sdk)
- [Reown AppKit](https://docs.reown.com/appkit/next/core/installation)
- [Next.js Docs](https://nextjs.org/docs)

## License

MIT License

---

Built with [Next.js](https://nextjs.org) and [Hyperliquid](https://hyperliquid.xyz)
