import { prisma } from '../prisma';
import { getOrCreateUser } from './users';

/**
 * Save an order to the database
 */
export async function saveOrder(data: {
  address: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: string;
  size: string;
  filledSize?: string;
  status: 'open' | 'filled' | 'cancelled' | 'rejected';
  hlOrderId?: string;
  reduceOnly?: boolean;
  postOnly?: boolean;
  timeInForce?: string;
}) {
  const user = await getOrCreateUser(data.address);

  return await prisma.order.create({
    data: {
      userId: user.id,
      symbol: data.symbol,
      side: data.side,
      type: data.type,
      price: data.price,
      size: data.size,
      filledSize: data.filledSize || '0',
      status: data.status,
      hlOrderId: data.hlOrderId,
      reduceOnly: data.reduceOnly,
      postOnly: data.postOnly,
      timeInForce: data.timeInForce,
      placedAt: new Date(),
    },
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  hlOrderId: string,
  status: 'open' | 'filled' | 'cancelled' | 'rejected',
  filledSize?: string
) {
  const data: Record<string, string | Date> = { status };
  if (filledSize) data.filledSize = filledSize;
  if (status === 'filled' || status === 'cancelled') {
    // Timestamp handled by updatedAt
  }

  return await prisma.order.updateMany({
    where: { hlOrderId },
    data,
  });
}

/**
 * Get user's open orders
 */
export async function getOpenOrders(address: string, symbol?: string) {
  const user = await getOrCreateUser(address);

  const where: Record<string, string> = {
    userId: user.id,
    status: 'open',
  };

  if (symbol) where.symbol = symbol;

  return await prisma.order.findMany({
    where,
    orderBy: { placedAt: 'desc' },
  });
}

/**
 * Get user's order history
 */
export async function getOrderHistory(
  address: string,
  options?: {
    limit?: number;
    offset?: number;
    symbol?: string;
    status?: 'filled' | 'cancelled' | 'rejected';
  }
) {
  const user = await getOrCreateUser(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    userId: user.id,
    status: { in: ['filled', 'cancelled', 'rejected'] },
  };

  if (options?.symbol) where.symbol = options.symbol;
  if (options?.status) where.status = options.status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  const total = await prisma.order.count({ where });

  return { orders, total };
}

/**
 * Get order by Hyperliquid order ID
 */
export async function getOrderByHlId(hlOrderId: string) {
  return await prisma.order.findFirst({
    where: { hlOrderId },
  });
}

/**
 * Cancel order
 */
export async function cancelOrder(hlOrderId: string) {
  return await updateOrderStatus(hlOrderId, 'cancelled');
}

/**
 * Get order statistics
 */
export async function getOrderStats(address: string, symbol?: string) {
  const user = await getOrCreateUser(address);

  const where: Record<string, string> = { userId: user.id };
  if (symbol) where.symbol = symbol;

  const orders = await prisma.order.findMany({ where });

  const totalOrders = orders.length;
  const openOrders = orders.filter((o) => o.status === 'open').length;
  const filledOrders = orders.filter((o) => o.status === 'filled').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  const rejectedOrders = orders.filter((o) => o.status === 'rejected').length;

  const fillRate = totalOrders > 0 ? (filledOrders / totalOrders) * 100 : 0;

  return {
    totalOrders,
    openOrders,
    filledOrders,
    cancelledOrders,
    rejectedOrders,
    fillRate,
  };
}
