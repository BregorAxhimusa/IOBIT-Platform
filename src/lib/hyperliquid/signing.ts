import { type WalletClient } from 'viem';
import type { Network } from '@/lib/utils/constants';

/**
 * Get EIP-712 Domain for Hyperliquid based on network
 */
const getHyperliquidDomain = (network: Network = 'mainnet') => ({
  name: 'Exchange',
  version: '1',
  chainId: network === 'mainnet' ? 42161 : 421614, // Arbitrum One for mainnet, Arbitrum Sepolia for testnet
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
});

/**
 * Create EIP-712 signature for placing an order
 */
export async function signPlaceOrder(
  walletClient: WalletClient,
  params: {
    coin: string;
    isBuy: boolean;
    size: number;
    limitPrice: number;
    reduceOnly: boolean;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    coin: params.coin,
    is_buy: params.isBuy,
    sz: BigInt(Math.floor(params.size * 1e8)), // Convert to 8 decimal fixed point
    limit_px: BigInt(Math.floor(params.limitPrice * 1e8)), // Convert to 8 decimal fixed point
    reduce_only: params.reduceOnly,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      Order: [
        { name: 'coin', type: 'string' },
        { name: 'is_buy', type: 'bool' },
        { name: 'sz', type: 'uint256' },
        { name: 'limit_px', type: 'uint256' },
        { name: 'reduce_only', type: 'bool' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'Order',
    message,
  });

  // Parse signature into r, s, v components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for canceling an order
 */
export async function signCancelOrder(
  walletClient: WalletClient,
  params: {
    coin: string;
    oid: number;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    coin: params.coin,
    oid: BigInt(params.oid),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      Cancel: [
        { name: 'coin', type: 'string' },
        { name: 'oid', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'Cancel',
    message,
  });

  // Parse signature into r, s, v components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for USD transfer (Perps ⇄ Spot)
 */
export async function signUsdTransfer(
  walletClient: WalletClient,
  params: {
    amount: number;
    toPerp: boolean;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
    destination: 'spot', // or 'perp' based on toPerp
    amount: BigInt(Math.floor(params.amount * 1e6)), // USDC has 6 decimals
    time: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      UsdTransfer: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'time', type: 'uint256' },
      ],
    },
    primaryType: 'UsdTransfer',
    message,
  });

  // Parse signature into r, s, v components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for withdrawal
 */
export async function signWithdraw(
  walletClient: WalletClient,
  params: {
    amount: number;
    destination: string;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
    destination: params.destination,
    amount: BigInt(Math.floor(params.amount * 1e6)), // USDC has 6 decimals
    time: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      Withdraw: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'time', type: 'uint256' },
      ],
    },
    primaryType: 'Withdraw',
    message,
  });

  // Parse signature into r, s, v components
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for TWAP order
 */
export async function signTwapOrder(
  walletClient: WalletClient,
  params: {
    coin: string;
    isBuy: boolean;
    size: number;
    durationMinutes: number;
    randomTiming: boolean;
    reduceOnly: boolean;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    coin: params.coin,
    is_buy: params.isBuy,
    sz: BigInt(Math.floor(params.size * 1e8)),
    duration_minutes: BigInt(params.durationMinutes),
    random_timing: params.randomTiming,
    reduce_only: params.reduceOnly,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      TwapOrder: [
        { name: 'coin', type: 'string' },
        { name: 'is_buy', type: 'bool' },
        { name: 'sz', type: 'uint256' },
        { name: 'duration_minutes', type: 'uint256' },
        { name: 'random_timing', type: 'bool' },
        { name: 'reduce_only', type: 'bool' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'TwapOrder',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for updating leverage
 */
export async function signUpdateLeverage(
  walletClient: WalletClient,
  params: {
    coin: string;
    isCross: boolean;
    leverage: number;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    coin: params.coin,
    is_cross: params.isCross,
    leverage: BigInt(params.leverage),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      UpdateLeverage: [
        { name: 'coin', type: 'string' },
        { name: 'is_cross', type: 'bool' },
        { name: 'leverage', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'UpdateLeverage',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for updating isolated margin
 */
export async function signUpdateIsolatedMargin(
  walletClient: WalletClient,
  params: {
    coin: string;
    isBuy: boolean;
    ntli: number; // notional value change
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    coin: params.coin,
    is_buy: params.isBuy,
    ntli: BigInt(Math.floor(params.ntli * 1e8)),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      UpdateIsolatedMargin: [
        { name: 'coin', type: 'string' },
        { name: 'is_buy', type: 'bool' },
        { name: 'ntli', type: 'int256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'UpdateIsolatedMargin',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for canceling a TWAP order
 */
export async function signTwapCancel(
  walletClient: WalletClient,
  params: {
    assetIndex: number;
    twapId: number;
    nonce: number;
    network?: Network;
  }
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account connected');
  }

  const message = {
    a: BigInt(params.assetIndex),
    t: BigInt(params.twapId),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      TwapCancel: [
        { name: 'a', type: 'uint256' },
        { name: 't', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'TwapCancel',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Generate a nonce for transactions
 */
export function generateNonce(): number {
  return Date.now();
}
