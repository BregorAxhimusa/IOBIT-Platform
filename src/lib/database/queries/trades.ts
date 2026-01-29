import { prisma } from '../prisma';
import { getOrCreateUser } from './users';

/**
 * Save a trade to the database
 */
export async function saveTrade(data: {
  address: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  size: string;
  fee: string;
  hlTradeId?: string;
  orderId?: string;
  realizedPnl?: string;
  executedAt?: Date;
}) {
  const user = await getOrCreateUser(data.address);

  return await prisma.trade.create({
    data: {
      userId: user.id,
      symbol: data.symbol,
      side: data.side,
      price: data.price,
      size: data.size,
      value: (parseFloat(data.price) * parseFloat(data.size)).toString(),
      fee: data.fee,
      hlTradeId: data.hlTradeId,
      orderId: data.orderId,
      executedAt: data.executedAt || new Date(),
    },
  });
}

/**
 * Get user trades with pagination
 */
export async function getUserTrades(
  address: string,
  options?: {
    limit?: number;
    offset?: number;
    symbol?: string;
    side?: 'buy' | 'sell';
    startDate?: Date;
    endDate?: Date;
  }
) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { userId: user.id };

  if (options?.symbol) {
    where.symbol = options.symbol;
  }

  if (options?.side) {
    where.side = options.side;
  }

  if (options?.startDate || options?.endDate) {
    where.executedAt = {};
    if (options.startDate) {
      where.executedAt.gte = options.startDate;
    }
    if (options.endDate) {
      where.executedAt.lte = options.endDate;
    }
  }

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { executedAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  const total = await prisma.trade.count({ where });

  return { trades, total };
}

/**
 * Get trade by Hyperliquid trade ID
 */
export async function getTradeByHlId(hlTradeId: string) {
  return await prisma.trade.findFirst({
    where: { hlTradeId },
  });
}

/**
 * Check if trade exists
 */
export async function tradeExists(hlTradeId: string) {
  const trade = await getTradeByHlId(hlTradeId);
  return !!trade;
}

/**
 * Bulk save trades (for syncing)
 */
export async function bulkSaveTrades(
  address: string,
  trades: Array<{
    symbol: string;
    side: 'buy' | 'sell';
    price: string;
    size: string;
    fee: string;
    hlTradeId: string;
    executedAt: Date;
    realizedPnl?: string;
  }>
) {
  const user = await getOrCreateUser(address);

  // Filter out trades that already exist
  const existingTradeIds = await prisma.trade.findMany({
    where: {
      hlTradeId: { in: trades.map((t) => t.hlTradeId) },
    },
    select: { hlTradeId: true },
  });

  const existingIds = new Set(existingTradeIds.map((t) => t.hlTradeId));
  const newTrades = trades.filter((t) => !existingIds.has(t.hlTradeId));

  if (newTrades.length === 0) {
    return { created: 0 };
  }

  await prisma.trade.createMany({
    data: newTrades.map((trade) => ({
      userId: user.id,
      symbol: trade.symbol,
      side: trade.side,
      price: trade.price,
      size: trade.size,
      value: (parseFloat(trade.price) * parseFloat(trade.size)).toString(),
      fee: trade.fee,
      hlTradeId: trade.hlTradeId,
      executedAt: trade.executedAt,
    })),
  });

  return { created: newTrades.length };
}

/**
 * Get trade statistics for a user
 */
export async function getTradeStats(address: string, symbol?: string) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { userId: user.id };
  if (symbol) where.symbol = symbol;

  const trades = await prisma.trade.findMany({ where });

  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, t) => sum + Number(t.value), 0);
  const totalFees = trades.reduce((sum, t) => sum + Number(t.fee), 0);

  const buyTrades = trades.filter((t) => t.side === 'buy').length;
  const sellTrades = trades.filter((t) => t.side === 'sell').length;

  return {
    totalTrades,
    buyTrades,
    sellTrades,
    totalVolume,
    totalFees,
  };
}
