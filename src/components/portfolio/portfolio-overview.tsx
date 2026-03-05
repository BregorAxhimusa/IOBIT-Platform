'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';
import { usePortfolioStats, useAccountBalance } from '@/hooks/use-account-balance';
import { usePortfolioPnL } from '@/hooks/use-portfolio-pnl';
import { usePositionsStore } from '@/store/positions-store';
import { useWalletUsdcBalance } from '@/hooks/use-wallet-usdc-balance';
import { useSpotBalance } from '@/hooks/use-spot-balance';
import { useDeposit } from '@/hooks/use-deposit';
import { useWithdraw } from '@/hooks/use-withdraw';
import { useClosePosition } from '@/hooks/use-close-position';
import { useSetTPSL } from '@/hooks/use-set-tpsl';
import { useNetworkStore } from '@/store/network-store';
import { PortfolioChart } from './portfolio-chart';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

export function PortfolioOverview() {
  const { address } = useAppKitAccount();
  const positions = usePositionsStore((state) => state.positions);
  const getTotalUnrealizedPnl = usePositionsStore((state) => state.getTotalUnrealizedPnl);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTPSLModal, setShowTPSLModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    symbol: string;
    side: 'long' | 'short';
    size: string;
    markPrice: string;
    entryPrice: string;
  } | null>(null);

  const { closePosition, isClosing } = useClosePosition();
  const totalPositionsPnl = getTotalUnrealizedPnl();

  const {
    accountValue,
    totalUnrealizedPnl,
    isLoading: isStatsLoading,
  } = usePortfolioStats();

  const {
    pnlData,
    stats,
    isLoading: isPnlLoading,
  } = usePortfolioPnL(timeRange);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Calculate metrics
  const todaysPnl = stats?.netPnl || 0;
  const todaysPnlPct = accountValue > 0 ? (todaysPnl / accountValue) * 100 : 0;
  const totalProfit = stats?.totalRealizedPnl || totalUnrealizedPnl;
  const maxDrawdown = 0; // Not available in current stats
  const perpVolume = stats?.totalVolume || 0;
  const todaysVolume = stats?.totalVolume || 0; // Use total as approximation
  const totalDeposits = 0; // Would need separate API call
  const totalWithdrawals = 0; // Would need separate API call

  return (
    <div className="flex-1 bg-[#0a0a0c]">
      {/* Total Equity & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Total Equity */}
        <div className="bg-[#0a0a0c] lg:border-r lg:border-[#1a1a1f] p-3 sm:p-6">
          {/* Header with buttons */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[15px] text-white">Total Equity</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowDepositModal(true)}
                className="bg-white text-black rounded-[5px] px-3 sm:px-6 py-1 sm:py-1.5 text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Deposit
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="border border-white text-white rounded-[5px] px-3 sm:px-6 py-1 sm:py-1.5 text-xs sm:text-sm font-medium hover:bg-white hover:text-black transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Equity Value */}
          <div className="text-[24px] text-white mb-6">
            {isStatsLoading ? (
              'Loading...'
            ) : (
              `$${accountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </div>

          {/* Points */}
          <div className="mb-1">
            <span className="text-[15px] text-white">Points</span>
          </div>
          <div className="text-[20px] text-white mb-4">0</div>
          <div className="mb-8">
            <span className="text-[15px] text-white">Points Value</span>
            <div className="text-[20px] text-white">$0.00</div>
          </div>

          {/* Metrics List */}
          <div className="space-y-3 pt-[20px] md:pt-[50px] lg:pt-[90px]">
            {/* Today's PNL */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Today&apos;s PNL</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[15px]',
                  todaysPnl >= 0 ? 'text-[#16DE93]' : 'text-[#F6465D]'
                )}>
                  {todaysPnl >= 0 ? '+' : ''}{todaysPnl.toFixed(2)} ({todaysPnlPct >= 0 ? '+' : ''}{todaysPnlPct.toFixed(2)}%)
                </span>
                <button className="text-[#16DE93] text-[15px] hover:underline">View More</button>
              </div>
            </div>

            {/* Perp Trading Volume */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Perp Trading Volume</span>
              <span className="text-[15px] text-white">
                ${perpVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Today's Volume */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Today&apos;s Volume</span>
              <span className="text-[15px] text-white">
                ${todaysVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Profit */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Total Profit</span>
              <span className={cn(
                'text-[15px]',
                totalProfit >= 0 ? 'text-[#16DE93]' : 'text-[#F6465D]'
              )}>
                {totalProfit >= 0 ? '+' : ''}${Math.abs(totalProfit).toFixed(2)}
              </span>
            </div>

            {/* Max Drawdown */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Max Drawdown (30D)</span>
              <span className="text-[15px] text-white">{maxDrawdown.toFixed(2)}%</span>
            </div>

            {/* Total Deposits */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Total Deposits</span>
              <span className="text-[15px] text-white">
                ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Withdrawals */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-[#8A8A8E]">Total Withdrawals</span>
              <span className="text-[15px] text-white">
                ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="bg-[#0a0a0c] p-3 sm:p-6">
          <PortfolioChart
            data={pnlData}
            isLoading={isPnlLoading}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>

      {/* Account Management Section */}
      <div className="sm:border-t sm:border-b sm:border-[#1a1a1f] bg-[#0a0a0c] p-3 sm:p-6">
        <h2 className="text-[18px] text-white mb-4">Account Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Account Name */}
          <div>
            <div className="text-[#8A8A8E] text-sm mb-1">Account Name</div>
            <div className="flex items-center gap-2">
              <Image
                src="/iobit/landingpage/mainaccount.svg"
                alt=""
                width={16}
                height={16}
                className="opacity-70"
              />
              <span className="text-white text-[15px]">Main Account</span>
              <span className="px-2 py-0.5 rounded-lg text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
                Current
              </span>
            </div>
          </div>

          {/* Account ID */}
          <div>
            <div className="text-[#8A8A8E] text-sm mb-1">Account ID</div>
            <div className="flex items-center gap-2">
              <Image
                src="/iobit/landingpage/acccountid.svg"
                alt=""
                width={16}
                height={16}
                className="opacity-70"
              />
              <span className="text-white text-[15px]">
                {address ? truncateAddress(address) : '---'}
              </span>
              <button onClick={copyAddress} className="text-[#8A8A8E] hover:text-white transition-colors">
                {copiedAddress ? (
                  <span className="text-[#16DE93] text-xs">Copied!</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Account Assets */}
          <div>
            <div className="text-[#8A8A8E] text-sm mb-1">Account Assets</div>
            <div className="flex items-center gap-2">
              <span className="text-white text-[15px]">
                ${accountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs text-[#16DE93] shadow-[inset_0_0.5px_8px_rgba(22,222,147,0.10)] backdrop-blur-[2.5px]">
                USD
              </span>
            </div>
          </div>

          {/* Transfer Button */}
          <div className="flex justify-start lg:justify-end">
            <button className="bg-white text-black rounded-[5px] px-3 sm:px-6 py-1 sm:py-1.5 text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors">
              Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Open Positions Table */}
      <div className="bg-[#0a0a0c]">
        <h2 className="text-base sm:text-[18px] text-white mb-3 sm:mb-4 px-3 sm:px-6 pt-3 sm:pt-6">Open Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-[#8A8A8E] border-b border-[#1a1a1f]">
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-normal">Coin</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal">Size</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal hidden sm:table-cell">Position Value</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal hidden sm:table-cell">Entry Price</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal">Mark Price</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal">PNL</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal hidden md:table-cell">Liq. Price</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-normal hidden lg:table-cell">Margin</th>
                <th className="text-center px-2 sm:px-4 py-2 sm:py-3 font-normal">Close</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 sm:py-20">
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/iobit/landingpage/nofound.svg"
                        alt="No positions"
                        width={48}
                        height={48}
                        className="mb-3 opacity-50 sm:w-16 sm:h-16 sm:mb-4"
                      />
                      <span className="text-[#8A8A8E] text-xs sm:text-sm">No open positions</span>
                    </div>
                  </td>
                </tr>
              ) : (
                positions.map((position) => {
                  const pnl = parseFloat(position.unrealizedPnl);
                  const pnlPercent = parseFloat(position.unrealizedPnlPercent);
                  const sizeNum = parseFloat(position.size);
                  const markPriceNum = parseFloat(position.markPrice);
                  const entryPriceNum = parseFloat(position.entryPrice);
                  const positionValue = sizeNum * markPriceNum;
                  const isLong = position.side === 'long';
                  const sideColor = isLong ? 'text-[#16DE93]' : 'text-[#F6465D]';

                  return (
                    <tr key={position.symbol} className="border-b border-[#1a1a1f] hover:bg-[#0a0a0a]/50 transition-colors">
                      {/* Coin: symbol + leverage badge */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className={cn('font-normal', sideColor)}>{position.symbol}</span>
                          <span className={cn(
                            'px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-normal',
                            isLong
                              ? 'bg-[#16DE93]/10 text-[#16DE93]'
                              : 'bg-[#F6465D]/10 text-[#F6465D]'
                          )}>
                            {position.leverage}x
                          </span>
                        </div>
                      </td>
                      {/* Size */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                        <span className={sideColor}>{position.size}</span>
                      </td>
                      {/* Position Value */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white hidden sm:table-cell">
                        {positionValue.toFixed(2)}
                      </td>
                      {/* Entry Price */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white hidden sm:table-cell">
                        {entryPriceNum.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                      </td>
                      {/* Mark Price */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white">
                        {markPriceNum.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                      </td>
                      {/* PNL (ROE%) */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                        <div className={cn('font-normal', pnl >= 0 ? 'text-[#16DE93]' : 'text-[#F6465D]')}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </div>
                        <div className={cn('text-[10px] sm:text-xs', pnl >= 0 ? 'text-[#16DE93]/70' : 'text-[#F6465D]/70')}>
                          ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </div>
                      </td>
                      {/* Liq. Price */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white hidden md:table-cell">
                        {position.liquidationPrice
                          ? parseFloat(position.liquidationPrice).toLocaleString(undefined, { minimumFractionDigits: 1 })
                          : '-'}
                      </td>
                      {/* Margin */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white hidden lg:table-cell">
                        ${parseFloat(position.margin).toFixed(2)}
                      </td>
                      {/* Close / TP/SL */}
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedPosition({
                                symbol: position.symbol,
                                side: position.side,
                                size: position.size,
                                markPrice: position.markPrice,
                                entryPrice: position.entryPrice,
                              });
                              setShowTPSLModal(true);
                            }}
                            className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-[#0a0a0a] hover:bg-[#1a1a1f] text-white rounded transition-colors border border-[#1a1a1f]"
                          >
                            TP/SL
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPosition({
                                symbol: position.symbol,
                                side: position.side,
                                size: position.size,
                                markPrice: position.markPrice,
                                entryPrice: position.entryPrice,
                              });
                              setShowCloseModal(true);
                            }}
                            disabled={isClosing}
                            className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-[#0a0a0a] hover:bg-[#1a1a1f] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors border border-[#1a1a1f]"
                          >
                            {isClosing ? '...' : 'Close'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {positions.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#1a1a1f]">
                  <td colSpan={3} className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-normal text-[#8A8A8E]">
                    Total PnL
                  </td>
                  <td className="hidden sm:table-cell"></td>
                  <td className="hidden sm:table-cell"></td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                    <span className={cn('font-normal', totalPositionsPnl >= 0 ? 'text-[#16DE93]' : 'text-[#F6465D]')}>
                      {totalPositionsPnl >= 0 ? '+' : ''}${totalPositionsPnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell"></td>
                  <td className="hidden lg:table-cell"></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal onClose={() => setShowDepositModal(false)} />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal onClose={() => setShowWithdrawModal(false)} />
      )}

      {/* TP/SL Modal */}
      {showTPSLModal && selectedPosition && (
        <TPSLModal
          position={selectedPosition}
          onClose={() => {
            setShowTPSLModal(false);
            setSelectedPosition(null);
          }}
        />
      )}

      {/* Close Confirmation Modal */}
      {showCloseModal && selectedPosition && (
        <CloseModal
          position={selectedPosition}
          isClosing={isClosing}
          onConfirm={async (symbol, side, size) => {
            await closePosition(symbol, side, size);
            setShowCloseModal(false);
            setSelectedPosition(null);
          }}
          onClose={() => {
            setShowCloseModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}

// Deposit Modal Component
function DepositModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [isRequestingFaucet, setIsRequestingFaucet] = useState(false);
  const { balance: walletUsdcBalance, refetch: refetchWalletBalance } = useWalletUsdcBalance();
  const { refetch: refetchAccountBalance } = useAccountBalance();
  const { deposit, isDepositing, minDeposit } = useDeposit();
  const { isTestnet } = useNetworkStore();
  const { address } = useAppKitAccount();
  const maxAmount = walletUsdcBalance;

  // Request testnet USDC from Hyperliquid faucet
  const handleRequestTestnetFunds = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRequestingFaucet(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET_API || 'https://api.hyperliquid-testnet.xyz'}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'usdSend',
          destination: address,
          amount: '10000',
        }),
      });

      toast.success('Testnet USDC requested! Balance will update in a few seconds.');

      setTimeout(() => {
        refetchWalletBalance();
        refetchAccountBalance();
      }, 3000);
    } catch (error) {
      console.error('Faucet error:', error);
      toast.error('Use the Hyperliquid testnet app to get test funds: app.hyperliquid-testnet.xyz');
    } finally {
      setIsRequestingFaucet(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const walletBalance = parseFloat(walletUsdcBalance || '0');
    const calculatedAmount = (walletBalance * percentage) / 100;
    setAmount(calculatedAmount.toFixed(6));
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
  const isBelowMinimum = parsedAmount > 0 && parsedAmount < minDeposit;
  const hasInsufficientBalance = maxBalance < minDeposit;
  const canDeposit = parsedAmount >= minDeposit && parsedAmount <= maxBalance && !isDepositing;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[#1a1a1f] w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDepositing}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#16DE93] to-[#16DE93] flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-[#16DE93]/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-white">
              {isTestnet ? 'Get Testnet USDC' : 'Deposit USDC'}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {isTestnet ? 'Practice trading with test funds' : 'From Arbitrum network'}
            </p>
            {isTestnet && (
              <span className="mt-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-normal border border-amber-500/30">
                TESTNET MODE
              </span>
            )}
          </div>

          {/* Testnet Faucet Section */}
          {isTestnet && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-500/5 border border-amber-500/20">
              <h3 className="text-xs sm:text-sm font-normal text-amber-400 mb-2">Get Free Test USDC</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4">
                Request free testnet USDC to practice trading without real funds.
              </p>
              <button
                onClick={handleRequestTestnetFunds}
                disabled={isRequestingFaucet || !address}
                className="w-full py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-normal text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingFaucet ? 'Requesting...' : 'Request 10,000 Test USDC'}
              </button>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                Or visit{' '}
                <a
                  href={process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET_APP || 'https://app.hyperliquid-testnet.xyz'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  app.hyperliquid-testnet.xyz
                </a>
              </p>
            </div>
          )}

          {/* Form - Only show for mainnet */}
          {!isTestnet && (
            <div className="space-y-3 sm:space-y-4">
              {/* Asset & Chain */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Asset</label>
                  <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-[8px] sm:text-[10px] font-normal flex items-center justify-center text-white">$</span>
                    USDC
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Chain</label>
                  <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-[8px] sm:text-[10px] flex items-center justify-center">A</span>
                    Arbitrum
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="text-[10px] sm:text-xs text-gray-500 font-normal">Amount</label>
                  <button
                    onClick={() => setAmount(maxAmount)}
                    className="text-[10px] sm:text-xs text-[#16DE93] hover:text-[#16DE93] font-normal transition-colors"
                  >
                    MAX: {maxAmount}
                  </button>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isDepositing}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-[#16DE93]/50 disabled:opacity-50 placeholder-gray-600"
                />

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageClick(pct)}
                      disabled={isDepositing}
                      className="py-1.5 sm:py-2 text-[10px] sm:text-xs font-normal bg-[#0a0a0a] border border-[#1a1a1f] text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning Messages */}
              {hasInsufficientBalance && (
                <div className="p-2 sm:p-3 bg-[#f6465d]/10 border border-[#f6465d]/30 text-[10px] sm:text-sm text-[#f6465d]">
                  Insufficient balance. Minimum deposit is {minDeposit} USDC but you only have {maxBalance.toFixed(2)} USDC.
                </div>
              )}

              {isBelowMinimum && !hasInsufficientBalance && (
                <div className="p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-sm text-amber-400">
                  Minimum deposit is {minDeposit} USDC. Amounts below this will be LOST!
                </div>
              )}

              {/* Deposit Button */}
              <button
                onClick={handleDeposit}
                disabled={!canDeposit}
                className="w-full py-2.5 sm:py-3 bg-[#16DE93] hover:bg-[#16DE93] text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {isDepositing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Depositing...
                  </span>
                ) : hasInsufficientBalance ? `Need ${minDeposit} USDC min` : 'Deposit to Hyperliquid'}
              </button>

              {/* Info */}
              <p className="text-[10px] sm:text-xs text-gray-600 text-center">
                Min: {minDeposit} USDC • Deposits are instant • Hyperliquid pays gas
              </p>
            </div>
          )}

          {/* Testnet Info */}
          {isTestnet && (
            <p className="text-[10px] sm:text-xs text-gray-600 text-center">
              Testnet funds are for testing only and have no real value
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Withdraw Modal Component
function WithdrawModal({ onClose }: { onClose: () => void }) {
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

  const isProcessing = isWithdrawing;
  const amountNum = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[#1a1a1f] w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#f6465d] to-orange-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-[#f6465d]/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-4-4m4 4l4-4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-white">Withdraw USDC</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 text-center">
              To Arbitrum network • 1 USDC fee
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            {/* Asset & Chain */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Asset</label>
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-[8px] sm:text-[10px] font-normal flex items-center justify-center text-white">$</span>
                  USDC
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Chain</label>
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-[8px] sm:text-[10px] flex items-center justify-center">A</span>
                  Arbitrum
                </div>
              </div>
            </div>

            {/* Balance Breakdown */}
            {(spotUsdc > 0 || perpsWithdrawable > 0) && (
              <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1f] text-[10px] sm:text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Perps: <span className="text-white">${perpsWithdrawable.toFixed(2)}</span></span>
                  <span className="text-gray-500">Spot: <span className="text-white">${spotUsdc.toFixed(2)}</span></span>
                </div>
                <span className="text-gray-400">Total: <span className="text-white">${maxAmount}</span></span>
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-normal">Amount</label>
                <button
                  onClick={() => setAmount(maxAmount)}
                  className="text-[10px] sm:text-xs text-[#16DE93] hover:text-[#16DE93] font-normal transition-colors"
                >
                  MAX: {maxAmount}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#0a0a0a] border border-[#1a1a1f] text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-[#16DE93]/50 placeholder-gray-600"
              />

              {/* Quick Percentage Buttons */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount((totalAvailable * pct / 100).toFixed(2))}
                    disabled={isProcessing}
                    className="py-1.5 sm:py-2 text-[10px] sm:text-xs font-normal bg-[#0a0a0a] border border-[#1a1a1f] text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={isProcessing || !amount || amountNum <= 0 || amountNum > totalAvailable}
              className="w-full py-2.5 sm:py-3 bg-[#16DE93] hover:bg-[#16DE93] text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Withdrawing...
                </span>
              ) : 'Withdraw to Arbitrum'}
            </button>

            {/* Info Text */}
            <p className="text-[10px] sm:text-xs text-gray-600 text-center leading-relaxed">
              Withdrawals arrive within 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Close Confirmation Modal
function CloseModal({
  position,
  isClosing,
  onConfirm,
  onClose,
}: {
  position: { symbol: string; side: 'long' | 'short'; size: string; markPrice: string; entryPrice: string };
  isClosing: boolean;
  onConfirm: (symbol: string, side: 'long' | 'short', size: string) => Promise<void>;
  onClose: () => void;
}) {
  const [closeType, setCloseType] = useState<'market' | 'limit'>('market');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-base font-normal text-white text-center mb-2">Confirm Close</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            This will close your {position.symbol} position and cancel associated TP/SL orders.
          </p>

          {/* Close Type Options */}
          <div className="space-y-3 mb-6">
            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCloseType('market')}
            >
              <div className={cn(
                'w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all',
                closeType === 'market'
                  ? 'bg-[#16DE93] border-[#16DE93]'
                  : 'border-gray-600 group-hover:border-gray-500'
              )}>
                {closeType === 'market' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white">Market Close</span>
            </label>

            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCloseType('limit')}
            >
              <div className={cn(
                'w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all',
                closeType === 'limit'
                  ? 'bg-[#16DE93] border-[#16DE93]'
                  : 'border-gray-600 group-hover:border-gray-500'
              )}>
                {closeType === 'limit' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white">Limit Close at Mid Price</span>
            </label>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => onConfirm(position.symbol, position.side, position.size)}
            disabled={isClosing}
            className="w-full py-3 bg-[#16DE93] hover:bg-[#16DE93]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-normal rounded-lg transition-all text-sm"
          >
            {isClosing ? 'Closing...' : `Confirm ${closeType === 'market' ? 'Market' : 'Limit'} Close`}
          </button>
        </div>
      </div>
    </div>
  );
}

// TP/SL Modal Component
type TPSLMode = 'price' | 'percent';

function TPSLModal({
  position,
  onClose,
}: {
  position: { symbol: string; side: 'long' | 'short'; size: string; markPrice: string; entryPrice: string };
  onClose: () => void;
}) {
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [tpGain, setTpGain] = useState('');
  const [slLoss, setSlLoss] = useState('');
  const [tpMode, setTpMode] = useState<TPSLMode>('price');
  const [slMode, setSlMode] = useState<TPSLMode>('price');
  const { mutate: setTPSL, isPending } = useSetTPSL();

  const entryPriceNum = parseFloat(position.entryPrice) || 0;
  const markPriceNum = parseFloat(position.markPrice) || 0;
  const isLong = position.side === 'long';

  const refPrice = entryPriceNum > 0 ? entryPriceNum : markPriceNum;

  const percentToPrice = (percent: number, isTP: boolean) => {
    if (isLong) {
      return isTP ? refPrice * (1 + percent / 100) : refPrice * (1 - percent / 100);
    }
    return isTP ? refPrice * (1 - percent / 100) : refPrice * (1 + percent / 100);
  };

  const priceToPercent = (price: number, isTP: boolean) => {
    if (refPrice === 0) return 0;
    if (isLong) {
      return isTP ? ((price - refPrice) / refPrice) * 100 : ((refPrice - price) / refPrice) * 100;
    }
    return isTP ? ((refPrice - price) / refPrice) * 100 : ((price - refPrice) / refPrice) * 100;
  };

  const getTPPrice = (): string => {
    if (tpMode === 'price') return tpPrice;
    const pct = parseFloat(tpGain);
    if (isNaN(pct) || pct <= 0) return '';
    return percentToPrice(pct, true).toFixed(2);
  };

  const getSLPrice = (): string => {
    if (slMode === 'price') return slPrice;
    const pct = parseFloat(slLoss);
    if (isNaN(pct) || pct <= 0) return '';
    return percentToPrice(pct, false).toFixed(2);
  };

  const handleSubmit = () => {
    const finalTP = getTPPrice();
    const finalSL = getSLPrice();

    if (!finalTP && !finalSL) {
      return;
    }

    setTPSL(
      {
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        takeProfitPrice: finalTP || undefined,
        stopLossPrice: finalSL || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const hasTP = tpMode === 'price' ? !!tpPrice : !!tpGain;
  const hasSL = slMode === 'price' ? !!slPrice : !!slLoss;

  const formatPrice = (num: number) => {
    if (isNaN(num) || num === 0) return '-';
    return num.toLocaleString(undefined, { minimumFractionDigits: 1 });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-base font-normal text-white text-center mb-5">TP/SL for Position</h2>

          {/* Position Info */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Coin</span>
              <span className="text-sm text-white font-normal">{position.symbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Position</span>
              <span className={cn('text-sm font-normal', isLong ? 'text-[#16DE93]' : 'text-[#F6465D]')}>
                {position.size} {position.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Entry Price</span>
              <span className="text-sm text-white">{formatPrice(entryPriceNum)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mark Price</span>
              <span className="text-sm text-white">{formatPrice(markPriceNum)}</span>
            </div>
          </div>

          {/* TP/SL Form */}
          <div className="space-y-3 mb-5">
            {/* Take Profit Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tpMode === 'price' ? tpPrice : tpGain}
                  onChange={(e) => {
                    if (tpMode === 'price') {
                      setTpPrice(e.target.value);
                    } else {
                      setTpGain(e.target.value);
                    }
                  }}
                  placeholder={tpMode === 'price' ? 'TP Price' : 'Gain %'}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#111111] border border-[#1a1a1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#16DE93] transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (tpMode === 'price') {
                    if (tpPrice) {
                      const pct = priceToPercent(parseFloat(tpPrice), true);
                      setTpGain(pct > 0 ? pct.toFixed(2) : '');
                    }
                    setTpMode('percent');
                  } else {
                    if (tpGain) {
                      const price = percentToPrice(parseFloat(tpGain), true);
                      setTpPrice(price > 0 ? price.toFixed(2) : '');
                    }
                    setTpMode('price');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-[#111111] border border-[#1a1a1f] rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors min-w-[80px] justify-center"
              >
                Gain <span className="text-gray-500">{tpMode === 'percent' ? '%' : '$'}</span>
              </button>
            </div>

            {/* Stop Loss Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={slMode === 'price' ? slPrice : slLoss}
                  onChange={(e) => {
                    if (slMode === 'price') {
                      setSlPrice(e.target.value);
                    } else {
                      setSlLoss(e.target.value);
                    }
                  }}
                  placeholder={slMode === 'price' ? 'SL Price' : 'Loss %'}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#111111] border border-[#1a1a1f] rounded-lg text-white text-sm focus:outline-none focus:border-[#F6465D] transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (slMode === 'price') {
                    if (slPrice) {
                      const pct = priceToPercent(parseFloat(slPrice), false);
                      setSlLoss(pct > 0 ? pct.toFixed(2) : '');
                    }
                    setSlMode('percent');
                  } else {
                    if (slLoss) {
                      const price = percentToPrice(parseFloat(slLoss), false);
                      setSlPrice(price > 0 ? price.toFixed(2) : '');
                    }
                    setSlMode('price');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-[#111111] border border-[#1a1a1f] rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors min-w-[80px] justify-center"
              >
                Loss <span className="text-gray-500">{slMode === 'percent' ? '%' : '$'}</span>
              </button>
            </div>

            {/* Preview calculations */}
            {(hasTP || hasSL) && (
              <div className="text-xs text-gray-500 space-y-1 px-1">
                {hasTP && (
                  <div className="flex justify-between">
                    <span>TP triggers at</span>
                    <span className="text-[#16DE93]">
                      {getTPPrice() ? `$${parseFloat(getTPPrice()).toLocaleString()}` : '-'}
                    </span>
                  </div>
                )}
                {hasSL && (
                  <div className="flex justify-between">
                    <span>SL triggers at</span>
                    <span className="text-[#F6465D]">
                      {getSLPrice() ? `$${parseFloat(getSLPrice()).toLocaleString()}` : '-'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={isPending || (!hasTP && !hasSL)}
            className="w-full py-3 bg-[#16DE93] hover:bg-[#16DE93]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-normal rounded-lg transition-all text-sm"
          >
            {isPending ? 'Confirming...' : 'Confirm'}
          </button>

          {/* Disclaimer */}
          <p className="text-[11px] text-gray-600 text-center mt-4 leading-relaxed">
            By default take-profit and stop-loss orders apply to the entire position. A market order is triggered when the stop loss or take profit price is reached.
          </p>
        </div>
      </div>
    </div>
  );
}
