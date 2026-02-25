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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0f1419] border border-gray-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className={cn(
              "w-14 h-14 flex items-center justify-center mb-4 shadow-lg",
              mode === 'deposit'
                ? 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/20'
                : 'bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/20'
            )}>
              {mode === 'deposit' ? (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-4-4m4 4l4-4" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'deposit' ? 'Deposit to Vault' : 'Withdraw from Vault'}
            </h2>
            <p className="text-gray-500 text-sm mt-1 truncate max-w-full">{vaultName}</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#1a2028] border border-gray-800 p-1 mb-6">
            <button
              onClick={() => { setMode('deposit'); clearError(); setAmount(''); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                mode === 'deposit'
                  ? 'bg-teal-500 text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Deposit
            </button>
            <button
              onClick={() => { setMode('withdraw'); clearError(); setAmount(''); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                mode === 'withdraw'
                  ? 'bg-rose-500 text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Withdraw
            </button>
          </div>

          {/* Balance Info */}
          <div className="bg-[#1a2028] border border-gray-800 p-4 mb-4">
            {mode === 'deposit' ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full" />
                  <span className="text-gray-400 text-sm">Available Balance</span>
                </div>
                <span className="text-white font-medium">${availableBalance.toFixed(2)}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="text-gray-400 text-sm">Your Equity</span>
                  </div>
                  <span className="text-white font-medium">${currentEquity.toFixed(2)}</span>
                </div>
                {isLocked && lockDateStr && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <span className="text-amber-400 text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked until
                    </span>
                    <span className="text-amber-400 text-xs">{lockDateStr}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium">Amount (USDC)</label>
              <button
                onClick={handleMaxClick}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#1a2028] border border-gray-800 px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-teal-500/50 placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* 4-day lockup warning for deposits */}
          {mode === 'deposit' && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-400 text-xs">
                  Deposits are locked for 4 days. You will not be able to withdraw during this period.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 mb-4">
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
              'w-full py-3 font-semibold text-sm transition-colors',
              mode === 'deposit'
                ? 'bg-teal-500 hover:bg-teal-400 text-white disabled:bg-gray-700 disabled:text-gray-500'
                : 'bg-rose-500 hover:bg-rose-400 text-white disabled:bg-gray-700 disabled:text-gray-500',
              'disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === 'deposit'
              ? `Deposit $${parsedAmount.toFixed(2)}`
              : isLocked
                ? 'Locked'
                : `Withdraw $${parsedAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
