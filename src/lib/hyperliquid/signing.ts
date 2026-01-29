import { type WalletClient } from 'viem';

/**
 * EIP-712 Domain for Hyperliquid
 */
const HYPERLIQUID_DOMAIN = {
  name: 'Exchange',
  version: '1',
  chainId: 421614, // Arbitrum Goerli for testnet, 42161 for mainnet
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
};

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
    domain: HYPERLIQUID_DOMAIN,
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
    domain: HYPERLIQUID_DOMAIN,
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
 * Generate a nonce for transactions
 */
export function generateNonce(): number {
  return Date.now();
}
