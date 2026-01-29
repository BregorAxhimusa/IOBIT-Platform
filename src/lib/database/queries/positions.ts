import { prisma } from '../prisma';
import { getOrCreateUser } from './users';

/**
 * Save or update a position
 */
export async function upsertPosition(data: {
  address: string;
  symbol: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  leverage: number;
  unrealizedPnl?: string;
  realizedPnl?: string;
  liquidationPrice?: string;
  marginUsed?: string;
  hlPositionId?: string;
}) {
  const user = await getOrCreateUser(data.address);

  const existingPosition = await prisma.position.findFirst({
    where: {
      userId: user.id,
      symbol: data.symbol,
      side: data.side,
      closedAt: null,
    },
  });

  if (existingPosition) {
    // Update existing position
    return await prisma.position.update({
      where: { id: existingPosition.id },
      data: {
        size: data.size,
        entryPrice: data.entryPrice,
        leverage: data.leverage,
        unrealizedPnL: data.unrealizedPnl,
        realizedPnL: data.realizedPnl,
        liquidationPrice: data.liquidationPrice,
        margin: data.marginUsed || '0',
        updatedAt: new Date(),
      },
    });
  }

  // Create new position
  return await prisma.position.create({
    data: {
      userId: user.id,
      symbol: data.symbol,
      side: data.side,
      size: data.size,
      entryPrice: data.entryPrice,
      leverage: data.leverage,
      unrealizedPnL: data.unrealizedPnl,
      realizedPnL: data.realizedPnl,
      liquidationPrice: data.liquidationPrice,
      margin: data.marginUsed || '0',
      hlPositionId: data.hlPositionId,
      openedAt: new Date(),
    },
  });
}

/**
 * Close a position
 */
export async function closePosition(
  address: string,
  symbol: string,
  side: 'long' | 'short',
  closedPnl?: string
) {
  const user = await getOrCreateUser(address);

  const position = await prisma.position.findFirst({
    where: {
      userId: user.id,
      symbol,
      side,
      closedAt: null,
    },
  });

  if (!position) {
    throw new Error('Position not found');
  }

  return await prisma.position.update({
    where: { id: position.id },
    data: {
      closedAt: new Date(),
      realizedPnL: closedPnl || position.unrealizedPnL,
    },
  });
}

/**
 * Get user's open positions
 */
export async function getOpenPositions(address: string, symbol?: string) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    userId: user.id,
    closedAt: null,
  };

  if (symbol) where.symbol = symbol;

  return await prisma.position.findMany({
    where,
    orderBy: { openedAt: 'desc' },
  });
}

/**
 * Get user's closed positions (history)
 */
export async function getClosedPositions(
  address: string,
  options?: {
    limit?: number;
    offset?: number;
    symbol?: string;
  }
) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    userId: user.id,
    closedAt: { not: null },
  };

  if (options?.symbol) where.symbol = options.symbol;

  const positions = await prisma.position.findMany({
    where,
    orderBy: { closedAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  const total = await prisma.position.count({ where });

  return { positions, total };
}

/**
 * Save position snapshot for analytics
 */
export async function savePositionSnapshot(data: {
  address: string;
  symbol: string;
  side: 'long' | 'short';
  size: string;
  markPrice: string;
  unrealizedPnL: string;
  positionId?: string;
}) {
  return await prisma.positionSnapshot.create({
    data: {
      positionId: data.positionId || 'unknown',
      markPrice: data.markPrice,
      unrealizedPnL: data.unrealizedPnL,
      margin: '0', // TODO: Add margin to function parameter
      snapshotAt: new Date(),
    },
  });
}
/**
 * Get position snapshots for analytics/charting
 */
export async function getPositionSnapshots(
  address: string,
  options?: {
    symbol?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { userId: user.id };

  if (options?.symbol) where.symbol = options.symbol;

  if (options?.startDate || options?.endDate) {
    where.snapshotAt = {};
    if (options.startDate) where.snapshotAt.gte = options.startDate;
    if (options.endDate) where.snapshotAt.lte = options.endDate;
  }

  return await prisma.positionSnapshot.findMany({
    where,
    orderBy: { snapshotAt: 'asc' },
    take: options?.limit || 1000,
  });
}

/**
 * Get position statistics
 */
export async function getPositionStats(address: string) {
  const user = await getOrCreateUser(address);

  const openPositions = await prisma.position.findMany({
    where: { userId: user.id, closedAt: null },
  });

  const closedPositions = await prisma.position.findMany({
    where: { userId: user.id, closedAt: { not: null } },
  });

  const totalUnrealizedPnl = openPositions.reduce(
    (sum, p) => sum + (p.unrealizedPnL ? Number(p.unrealizedPnL) : 0),
    0
  );

  const totalRealizedPnl = closedPositions.reduce(
    (sum, p) => sum + (p.realizedPnL ? Number(p.realizedPnL) : 0),
    0
  );

  const winningTrades = closedPositions.filter(
    (p) => p.realizedPnL && Number(p.realizedPnL) > 0
  ).length;

  const losingTrades = closedPositions.filter(
    (p) => p.realizedPnL && Number(p.realizedPnL) < 0
  ).length;

  const winRate = closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0;

  return {
    openPositionsCount: openPositions.length,
    closedPositionsCount: closedPositions.length,
    totalUnrealizedPnl,
    totalRealizedPnl,
    winningTrades,
    losingTrades,
    winRate,
  };
}
