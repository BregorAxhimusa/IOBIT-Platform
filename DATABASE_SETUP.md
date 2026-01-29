# Database Setup Guide

## Prerequisites

You have already created a Supabase project with the following credentials:
- Database URL: `postgresql://postgres.hjnbyumbbcmkglrcvbxp:Jkl;12jkl;@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- API URL: `https://hjnbyumbbcmkglrcvbxp.supabase.co`
- API Key: (in your .env.local file)

## Step 1: Execute Migrations in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** from the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `/Users/bregor/Desktop/IOBIT/prisma/migrations/001_init.sql`
6. Click **Run** to execute the migration

## Step 2: Verify Tables

After running the migration, verify that the following tables were created:

- `User` - Stores wallet addresses and user data
- `UserPreferences` - User settings (theme, favorites, etc.)
- `Trade` - Historical trades
- `Order` - Order history
- `Position` - Position history
- `PositionSnapshot` - PnL snapshots for analytics

You can check this by going to **Table Editor** in Supabase.

## Step 3: Generate Prisma Client

In your local project, run:

```bash
npx prisma generate
```

This will generate the Prisma client based on your schema.

## Step 4: Test Database Connection

You can test the database connection by creating a simple API route:

Create `/Users/bregor/Desktop/IOBIT/src/app/api/test-db/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    // Test query
    const userCount = await prisma.user.count();
    return NextResponse.json({ success: true, userCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
```

Then visit: http://localhost:3000/api/test-db

## Step 5: Implement Database Queries

Example queries are located in `/Users/bregor/Desktop/IOBIT/src/lib/database/queries/`

### Save a Trade:

```typescript
import { prisma } from '@/lib/database/prisma';

async function saveTrade(data: {
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  size: string;
  fee: string;
}) {
  return await prisma.trade.create({
    data: {
      userId: data.userId,
      symbol: data.symbol,
      side: data.side,
      price: data.price,
      size: data.size,
      fee: data.fee,
      executedAt: new Date(),
    },
  });
}
```

### Get User Trades:

```typescript
async function getUserTrades(address: string, limit: number = 50) {
  const user = await prisma.user.findUnique({
    where: { address },
    include: {
      trades: {
        take: limit,
        orderBy: { executedAt: 'desc' },
      },
    },
  });

  return user?.trades || [];
}
```

## Step 6: Sync Data from Hyperliquid

You can create a background job or API route to periodically sync data from Hyperliquid to your database:

1. Fetch user trades from Hyperliquid API
2. Check if trade already exists in DB (by `hlTradeId`)
3. If not, save to database
4. Update position snapshots for analytics

## Environment Variables

Make sure your `.env.local` has:

```env
DATABASE_URL="postgresql://postgres.hjnbyumbbcmkglrcvbxp:Jkl;12jkl;@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.hjnbyumbbcmkglrcvbxp:Jkl;12jkl;@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

## Troubleshooting

### Connection Issues

If you can't connect to Supabase:
1. Check if your IP is allowed in Supabase settings
2. Verify the connection string is correct
3. Try using the DIRECT_URL instead of pooled connection for Prisma migrations

### Migration Errors

If migration fails:
1. Check the SQL syntax in the migration file
2. Make sure you're running it in the correct database
3. Check Supabase logs for detailed error messages

## Next Steps

Once the database is set up:
1. Implement user authentication (link wallet address to User table)
2. Save trades after execution
3. Track positions in database
4. Build analytics dashboards using historical data
