import { prisma } from '../prisma';

/**
 * Get or create user by wallet address
 */
export async function getOrCreateUser(address: string) {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
  });

  if (user) {
    return user;
  }

  // Create new user
  return await prisma.user.create({
    data: {
      address: address.toLowerCase(),
    },
  });
}

/**
 * Get user by address
 */
export async function getUserByAddress(address: string) {
  return await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
    include: {
      preferences: true,
    },
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  address: string,
  preferences: {
    theme?: string;
    defaultLeverage?: number;
    favorites?: string[];
    chartType?: string;
    slippageTolerance?: number;
  }
) {
  const user = await getOrCreateUser(address);

  return await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: preferences,
    create: {
      userId: user.id,
      ...preferences,
    },
  });
}

/**
 * Get user preferences
 */
export async function getUserPreferences(address: string) {
  const user = await getUserByAddress(address);
  if (!user) return null;

  return await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });
}
