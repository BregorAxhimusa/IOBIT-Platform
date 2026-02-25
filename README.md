# IOBIT - Advanced Crypto Trading Platform

A professional trading platform built with Next.js 15 and integrated with Hyperliquid API.

## Features

- **Real-time Trading** - Place market, limit, stop, and advanced orders (TWAP, Scale)
- **Perpetual & Spot Markets** - Trade both perpetual futures and spot markets
- **Portfolio Management** - Track positions, orders, trade history, and PnL
- **Vaults** - Invest in managed trading vaults
- **Staking** - Delegate HYPE tokens to validators
- **Referral System** - Create and manage referral codes
- **Sub-Accounts** - Separate trading accounts with isolated balances
- **API Wallets** - Authorize external wallets for automated trading

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your credentials:

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
- **wagmi** - React hooks for Ethereum
- **Zustand** - State management
- **TanStack Query** - Data fetching & caching

### Backend & API
- **Next.js API Routes** - Backend endpoints
- **Hyperliquid SDK** - Trading API integration
- **PostgreSQL** (Supabase) - Database

### Additional Libraries
- **TradingView Lightweight Charts** - Price charts
- **react-hot-toast** - Notifications
- **date-fns** - Date formatting

## Project Structure

```
IOBIT-Platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── trade/[symbol]/    # Trading page
│   │   ├── portfolio/         # Portfolio page
│   │   ├── vaults/            # Vaults page
│   │   ├── staking/           # Staking page
│   │   ├── referrals/         # Referrals page
│   │   ├── leaderboard/       # Leaderboard page
│   │   └── settings/          # Settings pages
│   ├── components/            # React components
│   │   ├── layout/            # Navbar, Footer, Modals
│   │   ├── trading/           # Trading components
│   │   ├── vaults/            # Vault components
│   │   ├── staking/           # Staking components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and API clients
│   │   ├── hyperliquid/       # Hyperliquid API client
│   │   └── utils/             # Utility functions
│   └── store/                 # Zustand state stores
├── public/                    # Static assets
└── prisma/                    # Database schema
```

## Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Environment Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Wallet Connection (WalletConnect/Reown)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="..."

# Optional: Alchemy RPC
NEXT_PUBLIC_ALCHEMY_ID="..."
```

## Resources

- [Hyperliquid Docs](https://hyperliquid.gitbook.io/hyperliquid-docs)
- [Reown AppKit](https://docs.reown.com/appkit/next/core/installation)
- [Next.js Docs](https://nextjs.org/docs)

## License

MIT License

---

Built with Next.js and Hyperliquid
