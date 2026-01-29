import { NextRequest, NextResponse } from 'next/server';
import { bulkSaveTrades } from '@/lib/database/queries';
import { getInfoClient } from '@/lib/hyperliquid/info-client';

/**
 * POST /api/trades/sync
 * Sync user trades from Hyperliquid to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network = 'mainnet' } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Fetch trades from Hyperliquid
    const client = getInfoClient(network);
    const fills = await client.getUserFills(address);

    if (!Array.isArray(fills) || fills.length === 0) {
      return NextResponse.json({ message: 'No trades to sync', synced: 0 });
    }

    // Transform and save trades
    const trades = fills.map((fill: { coin: string; px: string; sz: string; side: string; time: number; closedPnl: string; fee: string; tid: number; hash: string }) => ({
      symbol: fill.coin,
      side: (fill.side.toLowerCase() === 'a' ? 'sell' : 'buy') as 'buy' | 'sell',
      price: fill.px,
      size: fill.sz,
      fee: fill.fee,
      hlTradeId: `${fill.tid}-${fill.hash}`,
      executedAt: new Date(fill.time),
      realizedPnl: fill.closedPnl !== '0' ? fill.closedPnl : undefined,
    }));

    const result = await bulkSaveTrades(address, trades);

    return NextResponse.json({
      message: `Synced ${result.created} trades`,
      synced: result.created,
      total: fills.length,
    });
  } catch (error) {
    console.error('Error syncing trades:', error);
    return NextResponse.json({ error: 'Failed to sync trades' }, { status: 500 });
  }
}
