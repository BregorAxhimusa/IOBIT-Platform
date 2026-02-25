'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useVaultDeposit } from '@/hooks/use-vault-deposit';
import { useAccountBalance } from '@/hooks/use-account-balance';
import { useAppKitAccount } from '@reown/appkit/react';

interface VaultDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultAddress: string;
  vaultName: string;
  currentEquity?: number;
  lockedUntil?: number;
  onSuccess?: () => void;
}

type TabMode = 'deposit' | 'withdraw';

export function VaultDepositModal({
  isOpen,
  onClose,
  vaultAddress,
  vaultName,
  currentEquity = 0,
  lockedUntil,
  onSuccess,
}: VaultDepositModalProps) {
  const [mode, setMode] = useState<TabMode>('deposit');
  const [amount, setAmount] = useState('');
  const { deposit, withdraw, isSubmitting, error, clearError } = useVaultDeposit();
  const { fullBalance } = useAccountBalance();
  const { isConnected } = useAppKitAccount();

  if (!isOpen) return null;

  const availableBalance = fullBalance?.withdrawable || 0;
  const parsedAmount = parseFloat(amount) || 0;
  const isLocked = lockedUntil ? Date.now() < lockedUntil : false;
  const lockDateStr = lockedUntil
    ? new Date(lockedUntil).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const canDeposit = parsedAmount > 0 && parsedAmount <= availableBalance && isConnected;
  const canWithdraw =
    parsedAmount > 0 && parsedAmount <= currentEquity && !isLocked && isConnected;

  const handleSubmit = async () => {
    if (parsedAmount <= 0) return;
    clearError();

    const result =
      mode === 'deposit'
        ? await deposit(vaultAddress, parsedAmount)
        : await withdraw(vaultAddress, parsedAmount);

    if (result.success) {
      setAmount('');
      onSuccess?.();
      onClose();
    }
  };

  const handleMaxClick = () => {
    if (mode === 'deposit') {
      setAmount(availableBalance.toFixed(2));
    } else {
      setAmount(currentEquity.toFixed(2));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0f1419] border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">
            {mode === 'deposit' ? 'Deposit to' : 'Withdraw from'} Vault
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4 truncate">{vaultName}</p>

        {/* Tabs */}
        <div className="flex bg-[#1a2028] rounded-lg p-1 mb-4">
          <button
            onClick={() => { setMode('deposit'); clearError(); }}
            className={cn(
              'flex-1 py-2 text-sm rounded-md transition-colors',
              mode === 'deposit'
                ? 'bg-[#14b8a6] text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Deposit
          </button>
          <button
            onClick={() => { setMode('withdraw'); clearError(); }}
            className={cn(
              'flex-1 py-2 text-sm rounded-md transition-colors',
              mode === 'withdraw'
                ? 'bg-[#ef4444] text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Withdraw
          </button>
        </div>

        {/* Balance Info */}
        <div className="bg-[#1a2028] rounded-lg p-3 mb-4">
          {mode === 'deposit' ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Available Balance</span>
              <span className="text-white">${availableBalance.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Your Equity</span>
                <span className="text-white">${currentEquity.toFixed(2)}</span>
              </div>
              {isLocked && lockDateStr && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-400">Locked until</span>
                  <span className="text-yellow-400">{lockDateStr}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Amount (USDC)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#14b8a6] hover:text-[#14b8a6]/80"
            >
              MAX
            </button>
          </div>
        </div>

        {/* 4-day lockup warning for deposits */}
        {mode === 'deposit' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-xs">
              Deposits are locked for 4 days. You will not be able to withdraw during this period.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (mode === 'deposit' ? !canDeposit : !canWithdraw)
          }
          className={cn(
            'w-full py-3 rounded-lg font-semibold text-sm transition-colors',
            mode === 'deposit'
              ? 'bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white disabled:bg-[#14b8a6]/30 disabled:text-white/50'
              : 'bg-[#ef4444] hover:bg-[#ef4444]/80 text-white disabled:bg-[#ef4444]/30 disabled:text-white/50'
          )}
        >
          {isSubmitting
            ? 'Processing...'
            : mode === 'deposit'
              ? `Deposit $${parsedAmount.toFixed(2)}`
              : isLocked
                ? 'Locked'
                : `Withdraw $${parsedAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
