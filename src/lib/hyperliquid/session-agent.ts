import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { PrivateKeyAccount } from 'viem/accounts';

const STORAGE_KEY = 'iobit-session-agent-v2';

interface StoredAgent {
  privateKey: string;
  address: string;
  approvedAt: number;
}

/**
 * Session Agent for Hyperliquid L1 action signing.
 *
 * Hyperliquid L1 actions (orders, cancels, leverage) require EIP-712 signing
 * with chainId 1337. MetaMask rejects this because the wallet is on Arbitrum (42161).
 *
 * Solution: Generate a local private key, approve it as an "agent" via the user's
 * wallet (non-L1 action, Arbitrum chainId), then use it for all L1 signing locally.
 * This is the same approach used by Hyperliquid's official web app.
 */
class SessionAgentManager {
  private account: PrivateKeyAccount | null = null;
  private approved = false;

  constructor() {
    this.restore();
  }

  /**
   * Restore session agent from sessionStorage
   */
  private restore() {
    if (typeof window === 'undefined') return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredAgent = JSON.parse(stored);
        // Session agents expire after 24 hours
        if (Date.now() - data.approvedAt < 24 * 60 * 60 * 1000) {
          this.account = privateKeyToAccount(data.privateKey as `0x${string}`);
          this.approved = true;
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Generate a new agent keypair. Must be approved before use.
   */
  generate(): string {
    const privateKey = generatePrivateKey();
    this.account = privateKeyToAccount(privateKey);
    this.approved = false;
    return this.account.address;
  }

  // markApproved is handled by markApprovedWithKey which receives the private key

  /**
   * Generate and return both the address and a way to persist
   */
  generateAndStore(): { address: string; privateKey: `0x${string}` } {
    const privateKey = generatePrivateKey();
    this.account = privateKeyToAccount(privateKey);
    this.approved = false;
    return { address: this.account.address, privateKey };
  }

  /**
   * Mark as approved and persist with the known private key
   */
  markApprovedWithKey(privateKey: `0x${string}`) {
    if (!this.account) throw new Error('No agent generated');
    this.approved = true;

    if (typeof window !== 'undefined') {
      const data: StoredAgent = {
        privateKey,
        address: this.account.address,
        approvedAt: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  /**
   * Check if a session agent is active and approved
   */
  isReady(): boolean {
    return this.approved && this.account !== null;
  }

  /**
   * Get the agent's account for signing
   */
  getAccount(): PrivateKeyAccount | null {
    if (!this.approved) return null;
    return this.account;
  }

  /**
   * Get the agent's address (even if not yet approved)
   */
  getAddress(): string | null {
    return this.account?.address || null;
  }

  /**
   * Clear the session agent
   */
  clear() {
    this.account = null;
    this.approved = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const sessionAgent = new SessionAgentManager();
