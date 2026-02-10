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
 * Create EIP-712 signature for vault deposit/withdraw
 */
export async function signVaultTransfer(
  walletClient: WalletClient,
  params: {
    vaultAddress: string;
    isDeposit: boolean;
    usd: number;
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
    vaultAddress: params.vaultAddress as `0x${string}`,
    action: params.isDeposit ? 'deposit' : 'withdraw',
    usd: BigInt(Math.floor(params.usd * 1e6)),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      VaultTransfer: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'vaultAddress', type: 'address' },
        { name: 'action', type: 'string' },
        { name: 'usd', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'VaultTransfer',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for creating a sub-account
 */
export async function signCreateSubAccount(
  walletClient: WalletClient,
  params: {
    name: string;
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
    name: params.name,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      CreateSubAccount: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'CreateSubAccount',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for sub-account transfer
 */
export async function signSubAccountTransfer(
  walletClient: WalletClient,
  params: {
    subAccountUser: string;
    isDeposit: boolean;
    usd: number;
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
    subAccountUser: params.subAccountUser as `0x${string}`,
    isDeposit: params.isDeposit,
    usd: BigInt(Math.floor(params.usd * 1e6)),
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      SubAccountTransfer: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'subAccountUser', type: 'address' },
        { name: 'isDeposit', type: 'bool' },
        { name: 'usd', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'SubAccountTransfer',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for approving an API agent
 */
export async function signApproveAgent(
  walletClient: WalletClient,
  params: {
    agentAddress: string;
    agentName: string | null;
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
    agentAddress: params.agentAddress as `0x${string}`,
    agentName: params.agentName || '',
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      ApproveAgent: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'agentAddress', type: 'address' },
        { name: 'agentName', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'ApproveAgent',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for token delegation
 */
export async function signTokenDelegate(
  walletClient: WalletClient,
  params: {
    validator: string;
    amount: string;
    isUndelegate: boolean;
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
    validator: params.validator as `0x${string}`,
    amount: params.amount,
    isUndelegate: params.isUndelegate,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      TokenDelegate: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'validator', type: 'address' },
        { name: 'amount', type: 'string' },
        { name: 'isUndelegate', type: 'bool' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'TokenDelegate',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for staking deposit (Spot -> Staking)
 */
export async function signStakingDeposit(
  walletClient: WalletClient,
  params: {
    amount: string;
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
    amount: params.amount,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      CDeposit: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'CDeposit',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for staking withdraw (Staking -> Spot)
 */
export async function signStakingWithdraw(
  walletClient: WalletClient,
  params: {
    amount: string;
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
    amount: params.amount,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      CWithdraw: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'CWithdraw',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for creating a referrer code
 */
export async function signCreateReferrerCode(
  walletClient: WalletClient,
  params: {
    code: string;
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
    code: params.code,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      CreateReferrerCode: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'CreateReferrerCode',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for setting a referrer
 */
export async function signSetReferrer(
  walletClient: WalletClient,
  params: {
    code: string;
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
    code: params.code,
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      SetReferrer: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'SetReferrer',
    message,
  });

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

/**
 * Create EIP-712 signature for claiming referral rewards
 */
export async function signClaimReferralRewards(
  walletClient: WalletClient,
  params: {
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
    nonce: BigInt(params.nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: getHyperliquidDomain(params.network),
    types: {
      ClaimReferralRewards: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'ClaimReferralRewards',
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
