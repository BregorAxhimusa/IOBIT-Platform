# IOBIT - Remaining Implementation Tasks

## ✅ What's DONE (100% Functional)

### Core Trading Platform
- ✅ Market data (real-time)
- ✅ Order book (real-time)
- ✅ Price chart (TradingView + real-time)
- ✅ Place orders (real wallet signing)
- ✅ Cancel orders (real wallet signing)
- ✅ Close positions (real wallet signing)
- ✅ Trade history (database + display)
- ✅ User positions (real-time from API)
- ✅ Open orders (real-time from API)
- ✅ Database (Prisma + PostgreSQL)
- ✅ WebSocket connections
- ✅ Error boundaries
- ✅ Loading states
- ✅ Keyboard shortcuts

---

## ⚠️ PARTIALLY IMPLEMENTED

### 1. Portfolio Page
**Current Status**: UI exists, using mock data

**What's Mock**:
```typescript
// src/app/portfolio/page.tsx (lines 16-22)
const portfolioValue = 10000;      // ❌ MOCK
const availableBalance = 5000;     // ❌ MOCK
const totalMargin = 2500;         // ❌ MOCK
const dailyPnl = 150;             // ❌ MOCK
const weeklyPnl = 420;            // ❌ MOCK
const monthlyPnl = 1250;          // ❌ MOCK
```

**What Needs Implementation**:

#### A. Fetch Real Account Balance
```typescript
// Create: src/hooks/use-account-balance.ts
// API: client.getUserState(address)
// Returns: { marginSummary, assetPositions, withdrawable }
```

#### B. Calculate Real Portfolio Value
```typescript
// Based on:
// - Available balance
// - Position values (size * markPrice)
// - Unrealized PnL
```

#### C. Historical PnL Data
```typescript
// Options:
// 1. Use Hyperliquid user fills API to calculate historical PnL
// 2. Store position snapshots in database daily
// 3. Calculate from trade history
```

#### D. Portfolio Value Chart
```typescript
// Create: src/components/portfolio/portfolio-chart.tsx
// Data source: Position snapshots from database
// Library: lightweight-charts (already installed)
```

---

## 📝 PLACEHOLDER PAGES (Mock Data)

These pages exist but use **hardcoded mock data** and don't integrate with Hyperliquid API:

### 2. Earn Page
**File**: `src/app/earn/page.tsx`

**Current**: Mock earn opportunities array
```typescript
const earnOpportunities: EarnOpportunity[] = [
  { asset: 'USDC', apy: 8.5, tvl: '$12.5M', ... }, // ❌ MOCK
  ...
];
```

**Needs**:
- Integrate with Hyperliquid vault API (if available)
- Or remove if Hyperliquid doesn't have earn features

### 3. Vaults Page
**File**: `src/app/vaults/page.tsx`

**Current**: Mock vault data

**Needs**:
- Check if Hyperliquid has vault functionality
- Implement deposit/withdraw if available
- Or remove page if not applicable

### 4. Staking Page
**File**: `src/app/staking/page.tsx`

**Current**: Mock staking options

**Needs**:
- Check if Hyperliquid has staking
- Implement stake/unstake if available
- Or remove page if not applicable

### 5. Referrals Page
**File**: `src/app/referrals/page.tsx`

**Current**: Mock referral data

**Needs**:
- Implement referral tracking system
- Backend API for referral codes
- Or remove if not part of MVP

### 6. Leaderboard Page
**File**: `src/app/leaderboard/page.tsx`

**Current**: Mock leaderboard array

**Needs**:
- Fetch real leaderboard from Hyperliquid API
- API endpoint: Check Hyperliquid docs for leaderboard
- Display real top traders

---

## 🎯 Recommended Implementation Order

### Phase 1: Portfolio Page (High Priority)
**Effort**: ~2-3 hours

1. Create `use-account-balance.ts` hook
   - Fetch from `client.getUserState(address)`
   - Parse margin summary and balances

2. Update Portfolio page to use real data
   - Replace mock values with API data
   - Calculate portfolio value dynamically

3. Implement portfolio chart
   - Use position snapshots from database
   - Or calculate from trade history

**Impact**: Portfolio page becomes fully functional

---

### Phase 2: Additional Pages (Medium Priority)
**Effort**: ~4-6 hours (depending on API availability)

#### Option A: If Hyperliquid has these features
1. Research Hyperliquid API docs for:
   - Vault endpoints
   - Staking endpoints
   - Leaderboard endpoints

2. Implement real integrations for each page

#### Option B: If features don't exist
1. Remove placeholder pages
2. Update navigation to hide unavailable features
3. Focus on core trading functionality

**Recommended**: Start with **Option B** (remove placeholders) for MVP, add later if needed

---

### Phase 3: Testing & Polish (High Priority)
**Effort**: ~2-3 hours

1. End-to-end testing
   - Test all trading flows
   - Test wallet integration
   - Test real order placement on testnet

2. Performance optimization
   - Check WebSocket connection stability
   - Optimize re-renders
   - Check bundle size

3. Bug fixes
   - Fix any discovered issues
   - Handle edge cases

---

## 📋 Task Checklist

### Must-Have (For Production)
- [ ] Portfolio page with real account balance
- [ ] Portfolio page with real PnL calculation
- [ ] Remove or implement Earn page
- [ ] Remove or implement Vaults page
- [ ] Remove or implement Staking page
- [ ] Remove or implement Referrals page
- [ ] Remove or implement Leaderboard page
- [ ] End-to-end testing on testnet
- [ ] Handle WebSocket disconnections gracefully
- [ ] Error handling for all API calls

### Nice-to-Have (Post-MVP)
- [ ] Portfolio value chart with historical data
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Order history export (CSV)
- [ ] Trading performance analytics
- [ ] Mobile responsive improvements
- [ ] Dark/light theme toggle
- [ ] User settings/preferences UI

---

## 🚀 Quick Win: Remove Placeholder Pages

**Fastest path to clean MVP** (30 minutes):

1. **Remove placeholder pages**:
```bash
rm src/app/earn/page.tsx
rm src/app/vaults/page.tsx
rm src/app/staking/page.tsx
rm src/app/referrals/page.tsx
```

2. **Keep leaderboard** but add note:
```typescript
// src/app/leaderboard/page.tsx
<div className="text-center py-12">
  <p className="text-gray-400">
    Leaderboard coming soon
  </p>
</div>
```

3. **Update navigation**:
```typescript
// src/components/layout/navbar.tsx
// Comment out or remove links to removed pages
```

**Result**: Clean, focused trading platform without half-implemented features

---

## 📊 Current Completion Status

```
Core Trading:        ████████████████████  100% ✅
Portfolio:           ████████░░░░░░░░░░░░   40% ⚠️
Additional Pages:    ██░░░░░░░░░░░░░░░░░░   10% 📝
Testing/Polish:      ████████░░░░░░░░░░░░   40% ⚠️

OVERALL:             ████████████░░░░░░░░   60%
```

---

## 💡 Recommendation

### For MVP (Minimum Viable Product):

1. **Fix Portfolio page** (real data) - 2-3 hours
2. **Remove placeholder pages** - 30 minutes
3. **End-to-end testing** - 2 hours
4. **Deploy** - 1 hour

**Total**: ~6 hours to production-ready MVP

### For Full Implementation:

1. Complete Portfolio page fully
2. Research Hyperliquid API for additional features
3. Implement only features that exist in Hyperliquid
4. Comprehensive testing

**Total**: ~15-20 hours

---

## 🎯 Next Action

**Your choice**:

1. **Quick MVP** (6 hours):
   - Fix Portfolio
   - Remove placeholders
   - Test & deploy

2. **Full Implementation** (15-20 hours):
   - Complete all pages
   - Research & implement all features
   - Full testing

Which approach do you prefer?
