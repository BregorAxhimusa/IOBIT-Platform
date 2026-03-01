import { type WalletClient, keccak256 } from 'viem';
import { encode } from '@msgpack/msgpack';
import type { Network } from '@/lib/utils/constants';
import { sessionAgent } from './session-agent';

/**
 * EIP-712 Domain for non-L1 actions (transfers, withdrawals, etc.)
 * Uses Arbitrum chain ID
 */
const getHyperliquidDomain = (network: Network = 'mainnet') => ({
  name: 'Exchange',
  version: '1',
  chainId: network === 'mainnet' ? 42161 : 421614,
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
});

/**
 * EIP-712 Domain for user-signed actions (approveAgent, approveBuilderFee)
 * Uses "HyperliquidSignTransaction" as the domain name.
 * The chainId must match the wallet's active chain so MetaMask accepts it.
 * The API payload's signatureChainId field tells the server which chainId was used.
 */
const getUserSignedActionDomain = (network: Network = 'mainnet') => ({
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: network === 'mainnet' ? 42161 : 421614,
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
});

/**
 * EIP-712 Domain for L1 actions (orders, cancels, leverage, twap)
 * Uses Hyperliquid L1 chain ID (1337) - signed by session agent's local private key
 */
const getL1Domain = () => ({
  name: 'Exchange',
  version: '1',
  chainId: 1337,
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
});

/**
 * Remove trailing zeros from a number string for Hyperliquid price/size formatting
 */
export function floatToWire(value: number): string {
  const str = value.toFixed(8);
  if (!str.includes('.')) return str;
  return str.replace(/\.?0+$/, '');
}

/**
 * Round a size to the correct number of decimals for a Hyperliquid asset.
 * Each asset has a specific szDecimals value from the meta endpoint.
 */
export function roundSize(size: number, szDecimals: number): number {
  const factor = Math.pow(10, szDecimals);
  return Math.round(size * factor) / factor;
}

/**
 * Round a price to 5 significant figures as required by Hyperliquid.
 */
export function roundPrice(price: number): number {
  if (price === 0) return 0;
  const digits = Math.floor(Math.log10(Math.abs(price))) + 1;
  const factor = Math.pow(10, 5 - digits);
  return Math.round(price * factor) / factor;
}

/**
 * Compute phantom agent connectionId by hashing the action with msgpack
 */
function computeActionHash(
  action: Record<string, unknown>,
  nonce: number,
  vaultAddress?: string
): `0x${string}` {
  // Encode action with msgpack
  const msgpackBytes = encode(action);

  // Build the data: msgpack bytes + nonce (8 bytes BE) + vault flag
  const nonceBytes = new Uint8Array(8);
  const view = new DataView(nonceBytes.buffer);
  // Write nonce as 64-bit big-endian
  view.setUint32(0, Math.floor(nonce / 0x100000000));
  view.setUint32(4, nonce % 0x100000000);

  let combined: Uint8Array;
  if (vaultAddress && vaultAddress !== '0x0000000000000000000000000000000000000000') {
    // With vault: msgpack + nonce + 1 byte (1) + 20 bytes address
    const addressBytes = hexToBytes(vaultAddress);
    combined = new Uint8Array(msgpackBytes.length + 8 + 1 + 20);
    combined.set(msgpackBytes, 0);
    combined.set(nonceBytes, msgpackBytes.length);
    combined[msgpackBytes.length + 8] = 1;
    combined.set(addressBytes, msgpackBytes.length + 9);
  } else {
    // Without vault: msgpack + nonce + 1 byte (0)
    combined = new Uint8Array(msgpackBytes.length + 8 + 1);
    combined.set(msgpackBytes, 0);
    combined.set(nonceBytes, msgpackBytes.length);
    combined[msgpackBytes.length + 8] = 0;
  }

  return keccak256(combined);
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Sign an L1 action using Hyperliquid phantom agent approach.
 *
 * Uses the session agent's local private key for signing with chainId 1337.
 * MetaMask rejects chainId 1337 (not the active chain), so we sign locally
 * with an approved agent key instead. The agent must be approved first via
 * the user's wallet (non-L1 action, Arbitrum chainId).
 */
async function signL1Action(
  _walletClient: WalletClient,
  action: Record<string, unknown>,
  nonce: number,
  network: Network = 'mainnet',
  vaultAddress?: string,
): Promise<{ r: string; s: string; v: number }> {
  const agentAccount = sessionAgent.getAccount();
  if (!agentAccount) {
    throw new Error(
      'Trading session not active. Please enable trading first.'
    );
  }

  const connectionId = computeActionHash(action, nonce, vaultAddress);

  // Sign with session agent's private key using chainId 1337 (Hyperliquid L1)
  // This avoids MetaMask's chainId validation since signing happens locally
  const signature = await agentAccount.signTypedData({
    domain: getL1Domain(),
    types: {
      Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' },
      ],
    },
    primaryType: 'Agent',
    message: {
      source: network === 'mainnet' ? 'a' : 'b',
      connectionId,
    },
  });

  return parseSignature(signature);
}

function parseSignature(signature: string) {
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
}

// ==========================================
// L1 Actions (use phantom agent signing)
// ==========================================

/**
 * Create EIP-712 signature for placing an order (L1 action - phantom agent)
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
    assetIndex?: number;
    orderType?: Record<string, unknown>;
    vaultAddress?: string;
  }
) {
  // Build the order action in the exact format Hyperliquid expects
  const orderWire = {
    a: params.assetIndex ?? 0,
    b: params.isBuy,
    p: floatToWire(params.limitPrice),
    s: floatToWire(params.size),
    r: params.reduceOnly,
    t: params.orderType || { limit: { tif: 'Ioc' } },
  };

  const action: Record<string, unknown> = {
    type: 'order',
    orders: [orderWire],
    grouping: 'na',
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

/**
 * Create EIP-712 signature for canceling an order (L1 action - phantom agent)
 */
export async function signCancelOrder(
  walletClient: WalletClient,
  params: {
    coin: string;
    oid: number;
    nonce: number;
    network?: Network;
    assetIndex?: number;
    vaultAddress?: string;
  }
) {
  const action: Record<string, unknown> = {
    type: 'cancel',
    cancels: [{ a: params.assetIndex ?? 0, o: params.oid }],
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

/**
 * Create EIP-712 signature for TWAP order (L1 action - phantom agent)
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
    assetIndex?: number;
    vaultAddress?: string;
  }
) {
  const action: Record<string, unknown> = {
    type: 'twapOrder',
    twap: {
      a: params.assetIndex ?? 0,
      b: params.isBuy,
      s: floatToWire(params.size),
      r: params.reduceOnly,
      m: params.durationMinutes,
      t: params.randomTiming,
    },
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

/**
 * Create EIP-712 signature for canceling a TWAP order (L1 action - phantom agent)
 */
export async function signTwapCancel(
  walletClient: WalletClient,
  params: {
    assetIndex: number;
    twapId: number;
    nonce: number;
    network?: Network;
    vaultAddress?: string;
  }
) {
  const action: Record<string, unknown> = {
    type: 'twapCancel',
    a: params.assetIndex,
    t: params.twapId,
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

/**
 * Create EIP-712 signature for updating leverage (L1 action - phantom agent)
 */
export async function signUpdateLeverage(
  walletClient: WalletClient,
  params: {
    coin: string;
    isCross: boolean;
    leverage: number;
    nonce: number;
    network?: Network;
    assetIndex?: number;
    vaultAddress?: string;
  }
) {
  const action: Record<string, unknown> = {
    type: 'updateLeverage',
    asset: params.assetIndex ?? 0,
    isCross: params.isCross,
    leverage: params.leverage,
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

/**
 * Create EIP-712 signature for updating isolated margin (L1 action - phantom agent)
 */
export async function signUpdateIsolatedMargin(
  walletClient: WalletClient,
  params: {
    coin: string;
    isBuy: boolean;
    ntli: number;
    nonce: number;
    network?: Network;
    assetIndex?: number;
    vaultAddress?: string;
  }
) {
  const action: Record<string, unknown> = {
    type: 'updateIsolatedMargin',
    asset: params.assetIndex ?? 0,
    isBuy: params.isBuy,
    ntli: Math.floor(params.ntli * 1e6), // 6 decimals
  };

  return signL1Action(
    walletClient,
    action,
    params.nonce,
    params.network || 'mainnet',
    params.vaultAddress,
  );
}

// ==========================================
// Non-L1 Actions (use direct EIP-712 signing with Arbitrum chain ID)
// ==========================================

/**
 * Create EIP-712 signature for USD transfer (Perps <-> Spot)
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
    destination: params.toPerp ? 'perp' : 'spot',
    amount: BigInt(Math.floor(params.amount * 1e6)),
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

  return parseSignature(signature);
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
    amount: BigInt(Math.floor(params.amount * 1e6)),
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

  return parseSignature(signature);
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

  return parseSignature(signature);
}

export async function signCreateSubAccount(
  walletClient: WalletClient,
  params: { name: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      name: params.name,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signSubAccountTransfer(
  walletClient: WalletClient,
  params: { subAccountUser: string; isDeposit: boolean; usd: number; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      subAccountUser: params.subAccountUser as `0x${string}`,
      isDeposit: params.isDeposit,
      usd: BigInt(Math.floor(params.usd * 1e6)),
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signApproveAgent(
  walletClient: WalletClient,
  params: { agentAddress: string; agentName: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

  // approveAgent is a "user-signed action" which uses a different EIP-712 domain
  // than regular non-L1 actions: domain name "HyperliquidSignTransaction",
  // chainId always 421614, primaryType "HyperliquidTransaction:ApproveAgent",
  // and nonce is uint64 (not uint256).
  const signature = await walletClient.signTypedData({
    account,
    domain: getUserSignedActionDomain(params.network),
    types: {
      'HyperliquidTransaction:ApproveAgent': [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'agentAddress', type: 'address' },
        { name: 'agentName', type: 'string' },
        { name: 'nonce', type: 'uint64' },
      ],
    },
    primaryType: 'HyperliquidTransaction:ApproveAgent',
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      agentAddress: params.agentAddress as `0x${string}`,
      agentName: params.agentName,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signTokenDelegate(
  walletClient: WalletClient,
  params: { validator: string; amount: string; isUndelegate: boolean; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      validator: params.validator as `0x${string}`,
      amount: params.amount,
      isUndelegate: params.isUndelegate,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signStakingDeposit(
  walletClient: WalletClient,
  params: { amount: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      amount: params.amount,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signStakingWithdraw(
  walletClient: WalletClient,
  params: { amount: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      amount: params.amount,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signCreateReferrerCode(
  walletClient: WalletClient,
  params: { code: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      code: params.code,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signSetReferrer(
  walletClient: WalletClient,
  params: { code: string; nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      code: params.code,
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

export async function signClaimReferralRewards(
  walletClient: WalletClient,
  params: { nonce: number; network?: Network }
) {
  const account = walletClient.account;
  if (!account) throw new Error('No account connected');

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
    message: {
      hyperliquidChain: params.network === 'mainnet' ? 'Mainnet' : 'Testnet',
      nonce: BigInt(params.nonce),
    },
  });
  return parseSignature(signature);
}

/**
 * Monotonic counter to prevent nonce collisions
 */
let lastNonce = 0;

/**
 * Generate a unique nonce for transactions
 */
export function generateNonce(): number {
  const now = Date.now();
  lastNonce = Math.max(now, lastNonce + 1);
  return lastNonce;
}
