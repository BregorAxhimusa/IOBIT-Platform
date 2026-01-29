# IOBIT - Advanced Crypto Trading Platform

Një platformë profesionale tregtimi e ndërtuar me Next.js 14 dhe të integruar me Hyperliquid API.

## 🚀 Setup

### 1. Instalo Dependencies

```bash
npm install
```

### 2. Konfiguro Environment Variables

Skedari `.env.local` është tashmë i konfiguruar me credentials e Supabase dhe WalletConnect Project ID.

### 3. Setup Database (Supabase)

Ekzekuto SQL migrations në Supabase Dashboard:

1. Shko te [Supabase Dashboard](https://supabase.com/dashboard)
2. Hap projektin: `oxwhedlqknkcaqbiguni`
3. SQL Editor → New Query
4. Kopjo përmbajtjen e file [prisma/migrations/001_init.sql](prisma/migrations/001_init.sql)
5. Ekzekuto SQL query-në

### 4. Start Development Server

```bash
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000) në browser.

---

## 📁 Struktura e Projektit

```
IOBIT/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # Reusable UI components
│   ├── config/                # Wagmi config
│   ├── context/               # AppKit context provider
│   ├── lib/
│   │   ├── database/          # Prisma client
│   │   └── utils/             # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # SQL migrations
└── public/                    # Static assets
```

---

## 🔧 Tech Stack

### Frontend
- **Next.js 15** - React framework me App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Reown AppKit** (WalletConnect) - Wallet connection
- **wagmi** - React hooks për Ethereum
- **Zustand** - State management
- **React Query** - Data fetching & caching

### Backend & API
- **Next.js API Routes** - Backend endpoints
- **@nktkas/hyperliquid** - Hyperliquid SDK
- **Prisma** - ORM për database
- **PostgreSQL** (Supabase) - Database

### Additional Libraries
- **TradingView Lightweight Charts** - Price charts
- **clsx** - Conditional classnames
- **date-fns** - Date formatting
- **react-hot-toast** - Notifications

---

## 🌐 Environment Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Wallet Connection (WalletConnect/Reown)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="..."

# Hyperliquid API (public, nuk kërkon key)
# Mainnet: https://api.hyperliquid.xyz
# Testnet: https://api.hyperliquid-testnet.xyz
```

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build për production
npm run start        # Start production server

# Linting & Type Checking
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma studio    # Open Prisma Studio (GUI për database)
```

---

## 🔗 Resources

- **Hyperliquid Docs**: https://hyperliquid.gitbook.io/hyperliquid-docs
- **Reown AppKit**: https://docs.reown.com/appkit/next/core/installation
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎯 Development Roadmap

### ✅ Faza 1: Setup Fillestar (Completed)
- [x] Next.js project initialization
- [x] Wallet connection (Reown AppKit)
- [x] Database schema & migrations
- [x] Basic layout & navigation

### 🚧 Faza 2: Market Data & WebSocket (In Progress)
- [ ] Hyperliquid SDK integration
- [ ] WebSocket connection
- [ ] Real-time market data
- [ ] Trading page routing

### 📅 Faza 3-10 (Planned)
- Order Book & Recent Trades
- TradingView Chart Integration
- Trading Panel & Order Placement
- Positions & Orders Management
- Trade History & Database Integration
- Portfolio Page
- Additional Features (Earn, Vaults, Staking, etc.)
- Testing & Deployment

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and Hyperliquid
