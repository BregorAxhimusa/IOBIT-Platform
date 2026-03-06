'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccountBalance, usePortfolioStats } from '@/hooks/use-account-balance';
import { useDeposit } from '@/hooks/use-deposit';
import { useWithdraw } from '@/hooks/use-withdraw';
import { useTransfer } from '@/hooks/use-transfer';
import { useWalletUsdcBalance } from '@/hooks/use-wallet-usdc-balance';
import { useSpotBalance } from '@/hooks/use-spot-balance';
import { useNetworkStore } from '@/store/network-store';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

type MobileAccountView = 'main' | 'deposit' | 'withdraw' | 'transfer';

export function MobileAccountPanel() {
  const { isConnected } = useAppKitAccount();
  const { fullBalance } = useAccountBalance();
  const { accountValue, totalMargin, totalUnrealizedPnl } = usePortfolioStats();
  const [activeView, setActiveView] = useState<MobileAccountView>('main');
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Calculate account stats
  const maintenanceMargin = totalMargin;
  const accountLeverage = accountValue > 0 ? totalMargin / accountValue : 0;
  const marginRatio = accountValue > 0 ? (fullBalance?.withdrawable || 0) / accountValue : 0;

  // Handle full-screen panel views
  if (activeView === 'deposit') {
    return <DepositPanel onClose={() => setActiveView('main')} />;
  }

  if (activeView === 'withdraw') {
    return <WithdrawPanel onClose={() => setActiveView('main')} />;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#68686f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-[#8A8A8E] text-sm mb-4">Connect wallet to view account</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Account Summary */}
      <div className="p-4 border-b border-[#1a1a1f]">
        <h2 className="text-sm font-medium text-white mb-4">Unified Account Summary</h2>

        <div className="space-y-3">
          {/* Unified Account Ratio */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#68686f] underline decoration-dashed underline-offset-2 cursor-help">
              Unified Account Ratio
            </span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#16DE93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-[#16DE93]">{(marginRatio * 100).toFixed(2)}%</span>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white">Portfolio Value</span>
            <span className="text-sm text-white">${accountValue.toFixed(2)}</span>
          </div>

          {/* Unrealized PNL */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white">Unrealized PNL</span>
            <span className={cn(
              'text-sm',
              totalUnrealizedPnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
            )}>
              ${totalUnrealizedPnl.toFixed(2)}
            </span>
          </div>

          {/* Perps Maintenance Margin */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#68686f] underline decoration-dashed underline-offset-2 cursor-help">
              Perps Maintenance Margin
            </span>
            <span className="text-sm text-white">${maintenanceMargin.toFixed(2)}</span>
          </div>

          {/* Unified Account Leverage */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#68686f] underline decoration-dashed underline-offset-2 cursor-help">
              Unified Account Leverage
            </span>
            <span className="text-sm text-white">{accountLeverage.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto">
        {/* Deposit Button */}
        <button
          onClick={() => setActiveView('deposit')}
          className="w-full py-2.5 bg-[#16DE93]/20 text-[#16DE93] border border-[#16DE93]/50 hover:bg-[#16DE93]/30 font-normal text-xs rounded-lg transition-all mb-2 flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Deposit
        </button>

        {/* Transfer and Withdraw Row */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex-1 py-2 bg-[#111111] hover:bg-[#1a1a1f] text-white text-xs rounded-lg transition-colors border border-[#1a1a1f] flex items-center justify-center gap-1.5"
          >
            Perps
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Spot
          </button>
          <button
            onClick={() => setActiveView('withdraw')}
            className="flex-1 py-2 bg-[#111111] hover:bg-[#1a1a1f] text-white text-xs rounded-lg transition-colors border border-[#1a1a1f] flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 14l-4-4m4 4l4-4" />
            </svg>
            Withdraw
          </button>
        </div>
      </div>

      {/* Transfer Modal (keeping as modal for now) */}
      {showTransferModal && (
        <TransferModal onClose={() => setShowTransferModal(false)} />
      )}
    </div>
  );
}

// Deposit Panel Component (Full-screen bottom panel for mobile)
function DepositPanel({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [isRequestingFaucet, setIsRequestingFaucet] = useState(false);
  const { balance: walletUsdcBalance, refetch: refetchWalletBalance } = useWalletUsdcBalance();
  const { refetch: refetchAccountBalance } = useAccountBalance();
  const { deposit, isDepositing, minDeposit } = useDeposit();
  const { isTestnet } = useNetworkStore();
  const { address } = useAppKitAccount();
  const maxAmount = walletUsdcBalance;

  const handleRequestTestnetFunds = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRequestingFaucet(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET_API || 'https://api.hyperliquid-testnet.xyz'}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'usdSend', destination: address, amount: '10000' }),
      });
      toast.success('Testnet USDC requested!');
      setTimeout(() => {
        refetchWalletBalance();
        refetchAccountBalance();
      }, 3000);
    } catch {
      toast.error('Use the Hyperliquid testnet app to get test funds');
    } finally {
      setIsRequestingFaucet(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const result = await deposit(amount);
    if (result.success) {
      setTimeout(() => {
        refetchWalletBalance();
        refetchAccountBalance();
      }, 2000);
      onClose();
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const maxBalance = parseFloat(walletUsdcBalance || '0');
  const canDeposit = parsedAmount >= minDeposit && parsedAmount <= maxBalance && !isDepositing;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Header with back button */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[#1a1a1f]">
        <button onClick={onClose} className="p-1 text-[#68686f] hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-medium text-white">
          {isTestnet ? 'Get Testnet USDC' : 'Deposit USDC'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {isTestnet ? (
          <div className="space-y-4">
            <p className="text-sm text-[#68686f] text-center">Request free testnet USDC to practice trading.</p>
            <button
              onClick={handleRequestTestnetFunds}
              disabled={isRequestingFaucet}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isRequestingFaucet ? 'Requesting...' : 'Request 10,000 Test USDC'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Asset display */}
            <div className="flex items-center justify-between p-4 bg-[#111111] rounded-lg">
              <div className="flex items-center gap-3">
                <Image
                  src="/iobit/chain/usdc.svg"
                  alt="USDC"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <span className="text-white font-medium">USDC</span>
                  <p className="text-xs text-[#68686f]">USD Coin</p>
                </div>
              </div>
              <span className="text-sm text-[#68686f]">Arbitrum</span>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#68686f]">Amount</span>
                <button onClick={() => setAmount(maxAmount)} className="text-xs text-[#16DE93]">
                  MAX: {maxAmount}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-3 bg-[#111111] border border-[#1a1a1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#16DE93]"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount((maxBalance * pct / 100).toFixed(2))}
                    className="py-1.5 text-[10px] bg-[#111111] border border-[#1a1a1f] text-white rounded-md hover:border-[#333] transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-[#111111] rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#68686f]">Network</span>
                <span className="text-white">Arbitrum One</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      {!isTestnet && (
        <div className="p-4 border-t border-[#1a1a1f]">
          <button
            onClick={handleDeposit}
            disabled={!canDeposit}
            className="w-full py-2.5 bg-[#16DE93]/20 text-[#16DE93] border border-[#16DE93]/50 hover:bg-[#16DE93]/30 disabled:opacity-50 disabled:cursor-not-allowed font-normal transition-all text-xs rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      )}
    </div>
  );
}

// Withdraw Panel Component (Full-screen bottom panel for mobile)
function WithdrawPanel({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const { fullBalance } = useAccountBalance();
  const { availableUsdc: spotUsdc } = useSpotBalance();
  const { withdraw, isWithdrawing } = useWithdraw();

  const perpsWithdrawable = fullBalance?.withdrawable || 0;
  const totalAvailable = perpsWithdrawable + spotUsdc;
  const maxAmount = totalAvailable.toFixed(2);

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    const result = await withdraw(amount);
    if (result.success) {
      setAmount('');
      onClose();
    }
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Header with back button */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[#1a1a1f]">
        <button onClick={onClose} className="p-1 text-[#68686f] hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-medium text-white">Withdraw USDC</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Asset display */}
          <div className="flex items-center justify-between p-4 bg-[#111111] rounded-lg">
            <div className="flex items-center gap-3">
              <Image
                src="/iobit/chain/usdc.svg"
                alt="USDC"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <span className="text-white font-medium">USDC</span>
                <p className="text-xs text-[#68686f]">USD Coin</p>
              </div>
            </div>
            <span className="text-sm text-[#68686f]">Arbitrum</span>
          </div>

          {/* Balance info */}
          <div className="p-4 bg-[#111111] rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#68686f]">Perps Balance</span>
              <span className="text-white">${perpsWithdrawable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#68686f]">Spot Balance</span>
              <span className="text-white">${spotUsdc.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-[#1a1a1f]">
              <span className="text-[#68686f]">Total Available</span>
              <span className="text-[#16DE93] font-medium">${totalAvailable.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#68686f]">Amount</span>
              <button onClick={() => setAmount(maxAmount)} className="text-xs text-[#16DE93]">
                MAX
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-3 bg-[#111111] border border-[#1a1a1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#16DE93]"
            />
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setAmount((totalAvailable * pct / 100).toFixed(2))}
                  className="py-1.5 text-[10px] bg-[#111111] border border-[#1a1a1f] text-white rounded-md hover:border-[#333] transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Fee info */}
          <div className="p-3 bg-[#111111] rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#68686f]">Network Fee</span>
              <span className="text-white">1 USDC</span>
            </div>
            <p className="text-xs text-[#68686f] mt-2">Withdrawals arrive within 5 minutes</p>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="p-4 border-t border-[#1a1a1f]">
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing || amountNum <= 0 || amountNum > totalAvailable}
          className="w-full py-2.5 bg-[#16DE93]/20 text-[#16DE93] border border-[#16DE93]/50 hover:bg-[#16DE93]/30 disabled:opacity-50 disabled:cursor-not-allowed font-normal transition-all text-xs rounded-lg flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 14l-4-4m4 4l4-4" />
          </svg>
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
}

// Transfer Modal Component
function TransferModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'perps-to-spot' | 'spot-to-perps'>('perps-to-spot');
  const { transfer, isTransferring } = useTransfer();
  const { fullBalance } = useAccountBalance();
  const { availableUsdc: spotUsdc } = useSpotBalance();

  const perpsBalance = fullBalance?.withdrawable || 0;
  const sourceBalance = direction === 'perps-to-spot' ? perpsBalance : spotUsdc;

  const handleTransfer = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    const toPerps = direction === 'spot-to-perps';
    const result = await transfer(amount, toPerps);
    if (result.success) {
      setAmount('');
      onClose();
    }
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#68686f] hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-lg font-medium text-white text-center mb-6">Transfer</h2>

          <div className="space-y-4">
            {/* Direction Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('perps-to-spot')}
                className={cn(
                  'flex-1 py-2 text-sm rounded-lg transition-colors',
                  direction === 'perps-to-spot'
                    ? 'bg-[#16DE93] text-black'
                    : 'bg-[#111111] border border-[#1a1a1f] text-white'
                )}
              >
                Perps → Spot
              </button>
              <button
                onClick={() => setDirection('spot-to-perps')}
                className={cn(
                  'flex-1 py-2 text-sm rounded-lg transition-colors',
                  direction === 'spot-to-perps'
                    ? 'bg-[#16DE93] text-black'
                    : 'bg-[#111111] border border-[#1a1a1f] text-white'
                )}
              >
                Spot → Perps
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#68686f]">Amount</span>
                <button onClick={() => setAmount(sourceBalance.toFixed(2))} className="text-xs text-[#16DE93]">
                  MAX: {sourceBalance.toFixed(2)}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-[#111111] border border-[#1a1a1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#16DE93]"
              />
            </div>

            <button
              onClick={handleTransfer}
              disabled={isTransferring || amountNum <= 0 || amountNum > sourceBalance}
              className="w-full py-3 bg-[#16DE93] hover:bg-[#14c583] disabled:bg-gray-700 text-black disabled:text-[#68686f] font-medium rounded-lg transition-colors"
            >
              {isTransferring ? 'Transferring...' : 'Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
