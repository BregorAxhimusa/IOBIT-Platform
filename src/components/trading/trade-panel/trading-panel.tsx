'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { arbitrum } from 'wagmi/chains';
import { useTradingStore } from '@/store/trading-store';
import { useMarketStore } from '@/store/market-store';
import { usePlaceOrder } from '@/hooks/use-place-order';
import { usePlaceSpotOrder } from '@/hooks/use-place-spot-order';
import { useAccountBalance } from '@/hooks/use-account-balance';
import { useWalletUsdcBalance } from '@/hooks/use-wallet-usdc-balance';
import { useSpotBalance } from '@/hooks/use-spot-balance';
import { useTransfer } from '@/hooks/use-transfer';
import { useWithdraw } from '@/hooks/use-withdraw';
import { useTwapOrder } from '@/hooks/use-twap-order';
import { useScaleOrders } from '@/hooks/use-scale-orders';
import { useUpdateLeverage } from '@/hooks/use-update-leverage';
import { usePlaceStopOrder } from '@/hooks/use-place-stop-order';
import { useDeposit } from '@/hooks/use-deposit';
import { useSessionAgent } from '@/hooks/use-session-agent';
import { useNetworkStore } from '@/store/network-store';
import { TwapProgress } from '../twap-progress';
import { ScalePreview } from '../scale-preview';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface TradingPanelProps {
  symbol: string;
  currentPrice?: number;
}

type OrderTab = 'market' | 'limit' | 'stop' | 'pro';
type ProOption = 'scale' | 'twap';
type TimeInForce = 'GTC' | 'IOC' | 'ALO';

export function TradingPanel({ symbol, currentPrice }: TradingPanelProps) {
  const { chain } = useAccount();
  const { isConnected } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>('market');
  const [showProDropdown, setShowProDropdown] = useState(false);
  const [selectedProOption, setSelectedProOption] = useState<ProOption>('scale');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sizePercentage, setSizePercentage] = useState(0);
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('GTC');
  const [showTifDropdown, setShowTifDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  // Pro tab state - TWAP
  const [twapHours, setTwapHours] = useState('');
  const [twapMinutes, setTwapMinutes] = useState('30');
  const [twapRandomize, setTwapRandomize] = useState(false);

  // Pro tab state - Scale
  const [scaleStartPrice, setScaleStartPrice] = useState('');
  const [scaleEndPrice, setScaleEndPrice] = useState('');
  const [scaleTotalOrders, setScaleTotalOrders] = useState('');
  const [scaleSizeSkew, setScaleSizeSkew] = useState('1.00');

  // Size denomination (USDC or crypto symbol)
  const [sizeDenomination, setSizeDenomination] = useState<'crypto' | 'usdc'>('crypto');

  // Leverage state
  const [leverage, setLeverage] = useState(1);
  const [isCrossMargin, setIsCrossMargin] = useState(true);
  const [showLeverageInput, setShowLeverageInput] = useState(false);

  const marketType = useMarketStore((state) => state.marketType);
  const isSpot = marketType === 'spot';

  const { placeOrder, isPlacing } = usePlaceOrder();
  const { placeSpotOrder, isPlacing: isPlacingSpot } = usePlaceSpotOrder();
  const { balance, fullBalance } = useAccountBalance();
  const { availableUsdc: spotAvailableUsdc } = useSpotBalance();
  const { transfer } = useTransfer();
  const { placeTwapOrder, cancelTwap, isPlacing: isTwapPlacing, isCancelling: isTwapCancelling, activeTwap } = useTwapOrder();
  const { placeScaleOrders, isPlacing: isScalePlacing } = useScaleOrders();
  const { mutate: updateLeverage, isPending: isUpdatingLeverage } = useUpdateLeverage();
  const { mutate: placeStopOrder } = usePlaceStopOrder();
  const { isReady: isAgentReady, isApproving: isAgentApproving, enableTrading } = useSessionAgent();

  const priceInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-enable trading when wallet is connected and has balance
  useEffect(() => {
    if (mounted && isConnected && !isAgentReady && !isAgentApproving) {
      const hasBalance = (fullBalance?.withdrawable || 0) > 0 || spotAvailableUsdc > 0;
      if (hasBalance) {
        enableTrading();
      }
    }
  }, [mounted, isConnected, isAgentReady, isAgentApproving, fullBalance, spotAvailableUsdc, enableTrading]);

  const {
    orderSide,
    price,
    size,
    reduceOnly,
    postOnly,
    triggerPrice,
    stopOrderType,
    setOrderSide,
    setPrice,
    setSize,
    setReduceOnly,
    setPostOnly,
    setTriggerPrice,
    setStopOrderType,
    resetForm,
  } = useTradingStore();

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      open();
      return;
    }

    // Handle Spot orders
    if (isSpot) {
      const sizeNum = parseFloat(size || '0');
      if (isNaN(sizeNum) || sizeNum <= 0) {
        toast.error('Invalid order size');
        return;
      }

      const result = await placeSpotOrder({
        pairName: symbol.replace('-', '/'),
        side: orderSide,
        orderType: activeTab === 'market' ? 'market' : 'limit',
        price: activeTab === 'limit' ? price : undefined,
        size,
        timeInForce: activeTab === 'limit' ? timeInForce : 'IOC',
        postOnly: activeTab === 'limit' ? postOnly : undefined,
      });

      if (result.success) {
        resetForm();
        setSizePercentage(0);
      }
      return;
    }

    // Handle Pro tab orders
    if (activeTab === 'pro') {
      if (selectedProOption === 'twap') {
        // Calculate total duration from hours and minutes
        const hours = parseInt(twapHours || '0');
        const minutes = parseInt(twapMinutes || '0');
        const duration = hours * 60 + minutes;

        if (duration < 5 || duration > 1440) {
          toast.error('Duration must be between 5 minutes and 24 hours');
          return;
        }

        const sizeNum = parseFloat(size || '0');
        if (isNaN(sizeNum) || sizeNum <= 0) {
          toast.error('Invalid order size');
          return;
        }

        const result = await placeTwapOrder({
          symbol,
          side: orderSide,
          size,
          durationMinutes: duration,
          randomTiming: twapRandomize,
          reduceOnly,
        });

        if (result.success) {
          resetForm();
          setSizePercentage(0);
          setTwapHours('');
          setTwapMinutes('30');
        }
        return;
      }

      if (selectedProOption === 'scale') {
        const startPrice = parseFloat(scaleStartPrice);
        const endPrice = parseFloat(scaleEndPrice);
        const totalOrders = parseInt(scaleTotalOrders);
        const sizeSkew = parseFloat(scaleSizeSkew);
        const totalSize = parseFloat(size || '0');

        if (isNaN(startPrice) || startPrice <= 0) {
          toast.error('Please enter a valid start price');
          return;
        }

        if (isNaN(endPrice) || endPrice <= 0) {
          toast.error('Please enter a valid end price');
          return;
        }

        if (isNaN(totalOrders) || totalOrders < 2 || totalOrders > 10) {
          toast.error('Total orders must be between 2 and 10');
          return;
        }

        if (isNaN(totalSize) || totalSize <= 0) {
          toast.error('Invalid total size');
          return;
        }

        // Calculate base price and range percentage from start/end
        const basePrice = orderSide === 'buy' ? endPrice : startPrice;
        const priceRange = Math.abs(endPrice - startPrice);
        const priceRangePercent = (priceRange / basePrice) * 100;

        // Determine distribution based on size skew
        const distribution = sizeSkew === 1.0 ? 'equal' : 'weighted';

        const result = await placeScaleOrders({
          symbol,
          side: orderSide,
          basePrice: basePrice.toString(),
          totalSize: size,
          orderCount: totalOrders,
          priceRangePercent,
          distribution,
          reduceOnly,
        });

        if (result.success) {
          resetForm();
          setSizePercentage(0);
          setScaleStartPrice('');
          setScaleEndPrice('');
          setScaleTotalOrders('');
          setScaleSizeSkew('1.00');
        }
        return;
      }
    }

    // Handle Stop Orders
    if (activeTab === 'stop') {
      const sizeNum = parseFloat(size || '0');
      const triggerPriceNum = parseFloat(triggerPrice || '0');

      if (isNaN(sizeNum) || sizeNum <= 0) {
        toast.error('Invalid order size');
        return;
      }

      if (isNaN(triggerPriceNum) || triggerPriceNum <= 0) {
        toast.error('Invalid trigger price');
        return;
      }

      // For stop-limit, validate limit price
      if (stopOrderType === 'stop-limit') {
        const limitPriceNum = parseFloat(price || '0');
        if (isNaN(limitPriceNum) || limitPriceNum <= 0) {
          toast.error('Invalid limit price');
          return;
        }
      }

      placeStopOrder(
        {
          symbol,
          side: orderSide,
          size,
          triggerPrice,
          orderType: stopOrderType,
          limitPrice: stopOrderType === 'stop-limit' ? price : undefined,
          reduceOnly,
        },
        {
          onSuccess: () => {
            resetForm();
            setSizePercentage(0);
            setTriggerPrice('');
          },
        }
      );
      return;
    }

    // Handle regular orders (Market/Limit)
    const sizeNum = parseFloat(size || '0');
    if (isNaN(sizeNum) || sizeNum <= 0) {
      toast.error('Invalid order size');
      return;
    }

    // Convert USDC size to crypto size if needed
    let actualSizeInCrypto = sizeNum;
    if (sizeDenomination === 'usdc' && currentPrice && currentPrice > 0) {
      actualSizeInCrypto = sizeNum / currentPrice;
    }

    // Check if user has sufficient balance (accounting for leverage)
    const availableBalanceNum = parseFloat(fullBalance?.withdrawable?.toString() || balance?.usdc || '0');
    const orderValueNum = sizeDenomination === 'usdc' ? sizeNum : sizeNum * (currentPrice || 0);
    const marginRequired = leverage > 0 ? orderValueNum / leverage : orderValueNum;

    // Auto-transfer from Spot to Perps if needed
    if (!isSpot && availableBalanceNum < marginRequired && spotAvailableUsdc > 0 && !reduceOnly) {
      const transferAmount = Math.min(spotAvailableUsdc, Math.ceil((marginRequired - availableBalanceNum) * 100) / 100);
      toast.loading('Transferring USDC from Spot to Perps...', { id: 'auto-transfer' });
      const transferResult = await transfer(transferAmount.toString(), true);
      if (!transferResult.success) {
        toast.error('Auto-transfer failed. Please transfer manually.', { id: 'auto-transfer' });
        return;
      }
      toast.success(`Transferred $${transferAmount} to Perps`, { id: 'auto-transfer' });
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (availableBalanceNum === 0 && spotAvailableUsdc === 0) {
      toast.error('No balance available. Please deposit funds first.');
      return;
    }

    if (marginRequired > (availableBalanceNum + spotAvailableUsdc) && !reduceOnly) {
      toast.error(`Insufficient margin. Required: $${marginRequired.toFixed(2)}, Available: $${(availableBalanceNum + spotAvailableUsdc).toFixed(2)}`);
      return;
    }

    // Format crypto size with appropriate decimals
    let cryptoSizeStr: string;
    if (actualSizeInCrypto < 0.0001) cryptoSizeStr = actualSizeInCrypto.toFixed(8);
    else if (actualSizeInCrypto < 0.01) cryptoSizeStr = actualSizeInCrypto.toFixed(6);
    else cryptoSizeStr = actualSizeInCrypto.toFixed(4);

    const result = await placeOrder({
      symbol,
      side: orderSide,
      orderType: activeTab === 'market' ? 'market' : 'limit',
      price: activeTab === 'limit' ? price : undefined,
      size: cryptoSizeStr,
      reduceOnly,
      postOnly: activeTab === 'limit' ? postOnly : undefined,
      timeInForce: activeTab === 'limit' ? timeInForce : 'IOC',
    });

    if (result.success) {
      resetForm();
      setSizePercentage(0);
    }
  };

  // Show total available USDC (spot + perps combined)
  const perpsBalance = fullBalance?.withdrawable || 0;
  const totalAvailableUsdc = isSpot ? spotAvailableUsdc : perpsBalance + spotAvailableUsdc;

  // Calculate size based on percentage (slider only controls percentage)
  const handlePercentageChange = (percentage: number) => {
    setSizePercentage(percentage);
    if (currentPrice) {
      const availableMargin = totalAvailableUsdc;
      const priceToUse = activeTab === 'limit' && price ? parseFloat(price) : currentPrice;

      if (priceToUse && priceToUse > 0) {
        const effectiveLeverage = isSpot ? 1 : leverage;
        const maxPositionValue = availableMargin * effectiveLeverage;

        if (sizeDenomination === 'usdc') {
          // USDC mode: size is in USDC directly
          const calculatedUsdc = (maxPositionValue * percentage / 100);
          setSize(calculatedUsdc.toFixed(2));
        } else {
          // Crypto mode: convert to coin amount
          const calculatedSize = (maxPositionValue * percentage / 100) / priceToUse;
          let decimals = 4;
          if (calculatedSize < 0.0001) decimals = 8;
          else if (calculatedSize < 0.01) decimals = 6;
          setSize(calculatedSize.toFixed(decimals));
        }
      }
    }
  };

  // Recalculate size when leverage changes (if slider is active)
  useEffect(() => {
    if (sizePercentage > 0) {
      handlePercentageChange(sizePercentage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leverage]);

  const calculateOrderValue = () => {
    const sizeNum = parseFloat(size || '0');

    if (sizeNum === 0 || isNaN(sizeNum)) {
      return 'N/A';
    }

    // If size is in USDC, the order value IS the size
    if (sizeDenomination === 'usdc') {
      return `$${sizeNum.toFixed(2)}`;
    }

    if (activeTab === 'market' && currentPrice) {
      return `$${(sizeNum * currentPrice).toFixed(2)}`;
    }

    if (activeTab === 'limit' && price) {
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum) && priceNum > 0) {
        return `$${(sizeNum * priceNum).toFixed(2)}`;
      }
    }

    return 'N/A';
  };

  const orderValue = calculateOrderValue();

  const availableBalance = totalAvailableUsdc.toFixed(2);
  const makerFee = '0.0700%';
  const takerFee = '0.0400%';
  const slippageMax = '8.00%';

  // Validation for button disabled state
  const getValidationError = () => {
    if (!mounted || !isConnected) return null;

    // Check if user is on the correct chain (Arbitrum One - chainId 42161)
    if (chain?.id !== arbitrum.id) {
      return 'Switch to Arbitrum network';
    }

    const sizeNum = parseFloat(size || '0');
    if (isNaN(sizeNum) || sizeNum <= 0) return 'Enter order size';

    if (activeTab === 'limit') {
      const priceNum = parseFloat(price || '0');
      if (isNaN(priceNum) || priceNum <= 0) return 'Enter limit price';
    }

    if (activeTab === 'stop') {
      const triggerPriceNum = parseFloat(triggerPrice || '0');
      if (isNaN(triggerPriceNum) || triggerPriceNum <= 0) return 'Enter trigger price';

      if (stopOrderType === 'stop-limit') {
        const limitPriceNum = parseFloat(price || '0');
        if (isNaN(limitPriceNum) || limitPriceNum <= 0) return 'Enter limit price';
      }
    }

    if (activeTab === 'pro' && selectedProOption === 'twap') {
      const hours = parseInt(twapHours || '0');
      const minutes = parseInt(twapMinutes || '0');
      const duration = hours * 60 + minutes;
      if (duration < 5 || duration > 1440) return 'Duration must be 5min - 24h';
    }

    if (activeTab === 'pro' && selectedProOption === 'scale') {
      const startPrice = parseFloat(scaleStartPrice);
      const endPrice = parseFloat(scaleEndPrice);
      const totalOrders = parseInt(scaleTotalOrders);
      if (isNaN(startPrice) || startPrice <= 0) return 'Enter start price';
      if (isNaN(endPrice) || endPrice <= 0) return 'Enter end price';
      if (isNaN(totalOrders) || totalOrders < 2 || totalOrders > 10) return 'Enter 2-10 orders';
    }

    return null;
  };

  const isFormInvalid = () => {
    return getValidationError() !== null;
  };

  return (
    <div className="flex flex-col lg:h-full bg-[#0f0f0f] text-white border border-white/20">
      {/* Tabs: Market, Limit, Stop, Pro */}
      <div className="flex items-center border-b border-white/20 bg-[#111111]/50">
        <button
          onClick={() => {
            setActiveTab('market');
            setSelectedProOption('scale'); // Reset to default when leaving Pro
          }}
          className={cn(
            'flex-1 px-3 py-3.5 text-sm font-normal transition-all relative',
            activeTab === 'market'
              ? 'text-teal-400'
              : 'text-white/70 hover:text-white'
          )}
        >
          Market
          {activeTab === 'market' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('limit');
            setSelectedProOption('scale'); // Reset to default when leaving Pro
          }}
          className={cn(
            'flex-1 px-3 py-3.5 text-sm font-normal transition-all relative',
            activeTab === 'limit'
              ? 'text-teal-400'
              : 'text-white/70 hover:text-white'
          )}
        >
          Limit
          {activeTab === 'limit' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
          )}
        </button>
        {/* Stop and Pro tabs - perps only */}
        {!isSpot && (
          <>
            <button
              onClick={() => {
                setActiveTab('stop');
                setSelectedProOption('scale');
              }}
              className={cn(
                'flex-1 px-3 py-3.5 text-sm font-normal transition-all relative',
                activeTab === 'stop'
                  ? 'text-teal-400'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Stop
              {activeTab === 'stop' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
              )}
            </button>
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setActiveTab('pro');
                  setShowProDropdown(!showProDropdown);
                }}
                className={cn(
                  'w-full px-4 py-3.5 text-sm font-normal transition-all flex items-center justify-center gap-1 relative',
                  activeTab === 'pro'
                    ? 'text-teal-400'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {activeTab === 'pro' ? (selectedProOption === 'scale' ? 'Scale' : 'TWAP') : 'Pro'}
                <ChevronDown className="w-4 h-4" />
                {activeTab === 'pro' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                )}
              </button>

              {/* Pro Dropdown */}
              {showProDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a1f2e] border border-white/20 rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedProOption('scale');
                      setShowProDropdown(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left transition-colors",
                      selectedProOption === 'scale' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-gray-700/50'
                    )}
                  >
                    Scale
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProOption('twap');
                      setShowProDropdown(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left transition-colors",
                      selectedProOption === 'twap' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-gray-700/50'
                    )}
                  >
                    TWAP
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-3 sm:p-4 space-y-4 flex-1">
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-lg">
            <button
              onClick={() => setOrderSide('buy')}
              className={cn(
                'px-4 py-2.5 text-sm font-normal rounded-md transition-all',
                orderSide === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-white/70 hover:text-white hover:bg-gray-800/50'
              )}
            >
              Buy / Long
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={cn(
                'px-4 py-2.5 text-sm font-normal rounded-md transition-all',
                orderSide === 'sell'
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-white/70 hover:text-white hover:bg-gray-800/50'
              )}
            >
              Sell / Short
            </button>
          </div>

          {/* Available to Trade */}
          <div className="flex items-center justify-between text-xs px-1">
            <button
              onClick={() => setShowTransferModal(true)}
              className="text-gray-500 hover:text-teal-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Available
            </button>
            <span className="text-white font-normal">
              {availableBalance} <span className="text-gray-500">USDC</span>
            </span>
          </div>

          {/* Deposit Banner - shown when total balance is 0 */}
          {mounted && isConnected && totalAvailableUsdc === 0 && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-teal-400 font-normal">No balance detected</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">Deposit USDC from Arbitrum to start trading on Hyperliquid.</p>
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg text-xs font-normal transition-all flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Deposit USDC
              </button>
            </div>
          )}

          {/* Stop Tab - Stop Orders */}
          {activeTab === 'stop' && (
            <>
              {/* Stop Order Type Toggle */}
              <div>
                <label className="text-xs text-gray-500 font-normal mb-2 block px-1">Order Type</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-lg">
                  <button
                    onClick={() => setStopOrderType('stop-market')}
                    className={cn(
                      'px-3 py-2 text-xs font-normal rounded-md transition-all',
                      stopOrderType === 'stop-market'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    Stop Market
                  </button>
                  <button
                    onClick={() => setStopOrderType('stop-limit')}
                    className={cn(
                      'px-3 py-2 text-xs font-normal rounded-md transition-all',
                      stopOrderType === 'stop-limit'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    Stop Limit
                  </button>
                </div>
              </div>

              {/* Trigger Price */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-xs text-gray-500 font-normal">Trigger Price</label>
                  <button
                    onClick={() => currentPrice && setTriggerPrice(currentPrice.toString())}
                    className="text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
                  >
                    Market
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    placeholder={currentPrice?.toString() || '0'}
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-normal">USDC</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5 px-1">
                  Triggers when price {orderSide === 'buy' ? 'rises above' : 'falls below'} this level
                </p>
              </div>

              {/* Limit Price (only for Stop Limit) */}
              {stopOrderType === 'stop-limit' && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-xs text-gray-500 font-normal">Limit Price</label>
                    <button
                      onClick={() => currentPrice && setPrice(currentPrice.toString())}
                      className="text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
                    >
                      Market
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={currentPrice?.toString() || '0'}
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-normal">USDC</span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 px-1">
                    Limit order placed at this price when triggered
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pro Tab - TWAP Orders */}
          {activeTab === 'pro' && selectedProOption === 'twap' && (
            <>
              <div>
                <label className="text-xs text-gray-500 font-normal mb-2 block px-1">Duration (5m - 24h)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={twapHours}
                      onChange={(e) => setTwapHours(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="24"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">hrs</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={twapMinutes}
                      onChange={(e) => setTwapMinutes(e.target.value)}
                      placeholder="30"
                      min="0"
                      max="59"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">min</span>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer group px-1">
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  twapRandomize ? "bg-teal-500 border-teal-500" : "border-gray-600 group-hover:border-gray-500"
                )}>
                  {twapRandomize && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={twapRandomize}
                  onChange={(e) => setTwapRandomize(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Randomize execution timing</span>
              </label>

              {/* TWAP Progress Indicator */}
              {activeTwap && (
                <TwapProgress
                  activeTwap={activeTwap}
                  onCancel={cancelTwap}
                  isCancelling={isTwapCancelling}
                />
              )}
            </>
          )}

          {/* Pro Tab - Scale Orders */}
          {activeTab === 'pro' && selectedProOption === 'scale' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-normal mb-2 block px-1">Start Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scaleStartPrice}
                      onChange={(e) => setScaleStartPrice(e.target.value)}
                      placeholder="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">USD</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-normal mb-2 block px-1">End Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scaleEndPrice}
                      onChange={(e) => setScaleEndPrice(e.target.value)}
                      placeholder="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">USD</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-normal mb-2 block px-1">Orders (2-10)</label>
                  <input
                    type="number"
                    value={scaleTotalOrders}
                    onChange={(e) => setScaleTotalOrders(e.target.value)}
                    placeholder="5"
                    min="2"
                    max="10"
                    className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-normal mb-2 block px-1">Size Skew</label>
                  <input
                    type="number"
                    value={scaleSizeSkew}
                    onChange={(e) => setScaleSizeSkew(e.target.value)}
                    placeholder="1.00"
                    step="0.1"
                    className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Scale Orders Preview */}
              {parseFloat(scaleStartPrice) > 0 && parseFloat(scaleEndPrice) > 0 && parseFloat(size) > 0 && parseInt(scaleTotalOrders) >= 2 && (
                <ScalePreview
                  startPrice={parseFloat(scaleStartPrice)}
                  endPrice={parseFloat(scaleEndPrice)}
                  totalSize={parseFloat(size)}
                  numOrders={parseInt(scaleTotalOrders)}
                  sizeSkew={parseFloat(scaleSizeSkew) || 1}
                  side={orderSide}
                />
              )}
            </>
          )}

          {/* Price Input (Limit only) */}
          {activeTab === 'limit' && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs text-gray-500 font-normal">Price</label>
                <button
                  onClick={() => currentPrice && setPrice(currentPrice.toString())}
                  className="text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
                >
                  Market
                </button>
              </div>
              <div className="relative">
                <input
                  ref={priceInputRef}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currentPrice?.toString() || '0'}
                  className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-normal">USDC</span>
              </div>
            </div>
          )}

          {/* Size Input */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-xs text-gray-500 font-normal">Size</label>
            </div>
            <div className="relative">
              <input
                ref={sizeInputRef}
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 pr-24 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                  className="flex items-center gap-1 bg-[#1a1f2e] text-gray-300 text-xs px-2.5 py-1.5 rounded-md border border-white/20 hover:border-gray-500 hover:text-white focus:outline-none transition-all"
                >
                  <span className="font-normal">{sizeDenomination === 'crypto' ? symbol.replace('-USD', '').replace('/USD', '') : 'USDC'}</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showSizeDropdown && "rotate-180")} />
                </button>
                {showSizeDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-[#1a1f2e] border border-white/20 rounded-lg shadow-xl z-50 min-w-[80px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSizeDenomination('crypto');
                        setShowSizeDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-xs text-left transition-colors font-normal",
                        sizeDenomination === 'crypto' ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      )}
                    >
                      {symbol.replace('-USD', '').replace('/USD', '')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSizeDenomination('usdc');
                        setShowSizeDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-xs text-left transition-colors font-normal",
                        sizeDenomination === 'usdc' ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      )}
                    >
                      USDC
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Percentage Slider */}
          <div className="space-y-3">
            {/* Quick Percentage Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handlePercentageChange(pct)}
                  className={cn(
                    "px-2 py-2 text-xs font-normal rounded-md transition-all",
                    sizePercentage === pct
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/50"
                      : "bg-[#111111] text-gray-500 border border-white/20 hover:text-white hover:border-gray-600"
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Slider with input */}
            <div className="flex items-center gap-3 px-1">
              <div className="relative flex-1 h-6 flex items-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${isNaN(sizePercentage) ? 0 : sizePercentage}%` }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isNaN(sizePercentage) ? 0 : sizePercentage}
                  onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                {/* Slider thumb indicator */}
                <div
                  className="absolute w-3.5 h-3.5 bg-teal-400 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all"
                  style={{ left: `calc(${isNaN(sizePercentage) ? 0 : sizePercentage}% - 7px)` }}
                />
              </div>
              <div className="flex items-center bg-[#111111] border border-white/20 rounded-md overflow-hidden">
                <input
                  type="number"
                  value={isNaN(sizePercentage) ? 0 : Math.round(sizePercentage)}
                  onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-1.5 bg-transparent text-white text-xs text-center focus:outline-none"
                  min="0"
                  max="100"
                />
                <span className="pr-2 text-xs text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* TIF Selector (Limit only) */}
          {activeTab === 'limit' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs text-gray-500 font-normal">Time in Force</label>
              </div>
              <button
                onClick={() => setShowTifDropdown(!showTifDropdown)}
                className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-lg text-white text-sm font-normal text-left flex items-center justify-between hover:border-gray-600 transition-all"
              >
                <span>{timeInForce === 'GTC' ? 'Good Till Cancel' : timeInForce === 'IOC' ? 'Immediate or Cancel' : 'Add Liquidity Only'}</span>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showTifDropdown && "rotate-180")} />
              </button>
              {showTifDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
                  {[
                    { value: 'GTC', label: 'Good Till Cancel', desc: 'Order remains until filled or cancelled' },
                    { value: 'IOC', label: 'Immediate or Cancel', desc: 'Fill immediately or cancel' },
                    { value: 'ALO', label: 'Add Liquidity Only', desc: 'Post only - maker orders' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeInForce(option.value as TimeInForce);
                        setShowTifDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors",
                        timeInForce === option.value ? 'bg-teal-500/10' : 'hover:bg-gray-700/50'
                      )}
                    >
                      <div className={cn("text-sm font-normal", timeInForce === option.value ? 'text-teal-400' : 'text-white')}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trading Options Checkboxes */}
          <div className="flex flex-wrap gap-4 px-1">
            {/* Reduce Only - Perps only */}
            {!isSpot && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  reduceOnly ? "bg-teal-500 border-teal-500" : "border-gray-600 group-hover:border-gray-500"
                )}>
                  {reduceOnly && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={reduceOnly}
                  onChange={(e) => setReduceOnly(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Reduce Only</span>
              </label>
            )}

            {/* Post Only - Only for limit orders */}
            {activeTab === 'limit' && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  postOnly ? "bg-teal-500 border-teal-500" : "border-gray-600 group-hover:border-gray-500"
                )}>
                  {postOnly && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={postOnly}
                  onChange={(e) => setPostOnly(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Post Only</span>
              </label>
            )}
          </div>
        </div>

        {/* Bottom Section - Stays at bottom */}
        <div className="mt-auto border-t border-white/20">
          {/* Order Summary */}
          <div className="px-4 py-3 bg-[#111111]/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Order Value</span>
              <span className="text-white font-normal">{orderValue}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Est. Fees</span>
              <span className="text-gray-400">{activeTab === 'limit' ? makerFee : takerFee}</span>
            </div>
            {activeTab === 'market' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Max Slippage</span>
                <span className="text-gray-400">{slippageMax}</span>
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <div className="px-4 py-4">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || isPlacingSpot || isTwapPlacing || isScalePlacing || isFormInvalid() || isAgentApproving}
              className={cn(
                'w-full py-2.5 font-normal transition-all text-sm shadow-lg',
                orderSide === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              {!mounted ? 'Place Order'
                : !isConnected ? 'Connect Wallet'
                : isAgentApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enabling Trading...
                    </span>
                  )
                : isPlacing || isPlacingSpot || isTwapPlacing || isScalePlacing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  )
                : isSpot ? `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${activeTab === 'market' ? 'Market' : 'Limit'}`
                : activeTab === 'pro' && selectedProOption === 'twap' ? 'Start TWAP Order'
                : activeTab === 'pro' && selectedProOption === 'scale' ? 'Place Scale Orders'
                : activeTab === 'market' ? `${orderSide === 'buy' ? 'Long' : 'Short'} Market`
                : activeTab === 'limit' ? `${orderSide === 'buy' ? 'Long' : 'Short'} Limit`
                : activeTab === 'stop' ? `Place ${orderSide === 'buy' ? 'Buy' : 'Sell'} Stop`
                : 'Place Order'}
            </button>
            {mounted && isConnected && getValidationError() && (
              <div className="mt-3">
                {chain?.id !== arbitrum.id ? (
                  <button
                    onClick={async () => {
                      try {
                        await switchChain?.({ chainId: arbitrum.id });
                        toast.success('Switched to Arbitrum network');
                      } catch (error) {
                        console.error('Failed to switch network:', error);
                        toast.error('Failed to switch network. Please switch manually in your wallet.');
                      }
                    }}
                    className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg font-normal transition-all text-xs"
                  >
                    Switch to Arbitrum
                  </button>
                ) : (
                  <p className="text-xs text-rose-400 text-center bg-rose-500/10 py-2 px-3 rounded-lg border border-rose-500/20">{getValidationError()}</p>
                )}
              </div>
            )}
          </div>

        {/* Leverage Selector - Perps only */}
        {!isSpot && (
        <div className="px-4 py-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-normal">Leverage</span>
            <div className="flex items-center gap-2">
              {/* Cross/Isolated Toggle */}
              <button
                onClick={() => {
                  setIsCrossMargin(!isCrossMargin);
                  updateLeverage({
                    symbol,
                    leverage,
                    isCross: !isCrossMargin,
                  });
                }}
                className={cn(
                  'px-2.5 py-1 text-xs font-normal rounded-md border transition-all',
                  isCrossMargin
                    ? 'border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
                    : 'border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                )}
                title={isCrossMargin ? 'Cross Margin: Shares margin across positions' : 'Isolated Margin: Margin isolated per position'}
              >
                {isCrossMargin ? 'Cross' : 'Isolated'}
              </button>

              {/* Leverage Display/Input */}
              {showLeverageInput ? (
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 50) {
                      setLeverage(val);
                    }
                  }}
                  onBlur={() => {
                    setShowLeverageInput(false);
                    updateLeverage({
                      symbol,
                      leverage,
                      isCross: isCrossMargin,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowLeverageInput(false);
                      updateLeverage({
                        symbol,
                        leverage,
                        isCross: isCrossMargin,
                      });
                    }
                  }}
                  min="1"
                  max="50"
                  className="w-14 px-2 py-1 bg-[#111111] border border-teal-500/50 rounded-md text-white text-xs font-normal text-center focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setShowLeverageInput(true)}
                  className="px-3 py-1 text-xs font-normal text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-md transition-all"
                  disabled={isUpdatingLeverage}
                >
                  {leverage}x
                </button>
              )}
            </div>
          </div>

          {/* Quick Leverage Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 5, 10, 20].map((lev) => (
              <button
                key={lev}
                onClick={() => {
                  setLeverage(lev);
                  updateLeverage({
                    symbol,
                    leverage: lev,
                    isCross: isCrossMargin,
                  });
                }}
                className={cn(
                  'py-2 text-xs font-normal rounded-md transition-all',
                  leverage === lev
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                    : 'bg-[#111111] text-gray-500 border border-white/20 hover:text-white hover:border-gray-600'
                )}
                disabled={isUpdatingLeverage}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Deposit/Withdraw/Transfer Actions */}
        <div className="px-4 py-4 space-y-2">
          <button
            onClick={() => setShowDepositModal(true)}
            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg font-normal transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="py-2.5 bg-[#111111] border border-white/20 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-normal transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transfer
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="py-2.5 bg-[#111111] border border-white/20 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-normal transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-4-4m4 4l4-4" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="px-4 py-4 border-t border-white/20 bg-[#111111]/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-normal text-gray-400 uppercase tracking-wider">Account</h3>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span className="text-gray-500">Spot</span>
                <span className="text-white font-normal">${balance?.spot || '0.00'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-gray-500">Perps</span>
                <span className="text-white font-normal">${balance?.perps || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Perps Details - only for perps */}
          {!isSpot && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 px-3 bg-[#0a0e13] rounded-lg">
                <span className="text-gray-500">Account Value</span>
                <span className="text-white font-normal">${fullBalance?.accountValue.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#0a0e13] rounded-lg">
                <span className="text-gray-500">Unrealized PNL</span>
                <span className={cn(
                  "font-normal",
                  fullBalance && fullBalance.totalNtlPos > 0 ? 'text-emerald-400' : fullBalance && fullBalance.totalNtlPos < 0 ? 'text-rose-400' : 'text-white'
                )}>
                  {fullBalance && fullBalance.totalNtlPos > 0 ? '+' : ''}${fullBalance?.totalNtlPos.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2 px-3 bg-[#0a0e13] rounded-lg">
                  <div className="text-gray-500 text-[10px] mb-0.5">Margin Ratio</div>
                  <div className="text-white font-normal">
                    {fullBalance && fullBalance.accountValue > 0
                      ? ((fullBalance.totalMarginUsed / fullBalance.accountValue) * 100).toFixed(2)
                      : '0.00'}%
                  </div>
                </div>
                <div className="py-2 px-3 bg-[#0a0e13] rounded-lg">
                  <div className="text-gray-500 text-[10px] mb-0.5">Maint. Margin</div>
                  <div className="text-white font-normal">${fullBalance?.totalMarginUsed.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Spot Details - only for spot */}
          {isSpot && (
            <div className="py-2 px-3 bg-[#0a0e13] rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Available USDC</span>
                <span className="text-white font-normal">${spotAvailableUsdc.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal onClose={() => setShowTransferModal(false)} />
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
      await fetch('https://api.hyperliquid-testnet.xyz/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'usdSend',
          destination: address,
          amount: '10000', // Request 10,000 test USDC
        }),
      });

      // The faucet might have different response handling
      toast.success('Testnet USDC requested! Balance will update in a few seconds.');

      // Refresh balances after a delay
      setTimeout(() => {
        refetchWalletBalance();
        refetchAccountBalance();
      }, 3000);
    } catch (error) {
      console.error('Faucet error:', error);
      // Even if the API call fails, the user can use the web faucet
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
      // Refresh balances after successful deposit
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
      <div className="bg-[#0f1419] border border-gray-800 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-teal-500/20">
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
                  href="https://app.hyperliquid-testnet.xyz"
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
                  <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-[8px] sm:text-[10px] font-normal flex items-center justify-center text-white">$</span>
                    USDC
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Chain</label>
                  <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm flex items-center gap-2">
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
                    className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
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
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-teal-500/50 disabled:opacity-50 placeholder-gray-600"
                />

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageClick(pct)}
                      disabled={isDepositing}
                      className="py-1.5 sm:py-2 text-[10px] sm:text-xs font-normal bg-[#1a2028] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning Messages */}
              {hasInsufficientBalance && (
                <div className="p-2 sm:p-3 bg-red-500/10 border border-red-500/30 text-[10px] sm:text-sm text-red-400">
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
                className="w-full py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-400 text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
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
  const { balance } = useAccountBalance();
  const { withdraw, isWithdrawing } = useWithdraw();

  // Max amount is from perps balance (need to be in perps to withdraw)
  const maxAmount = balance?.perps || '0.00';

  const handleWithdraw = async () => {
    const result = await withdraw(amount);
    if (result.success) {
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#0f1419] border border-gray-800 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-rose-500/20">
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
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-[8px] sm:text-[10px] font-normal flex items-center justify-center text-white">$</span>
                  USDC
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-gray-500 font-normal mb-1.5 sm:mb-2">Chain</label>
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm flex items-center gap-2">
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
                  className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
                >
                  MAX: {maxAmount}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-teal-500/50 placeholder-gray-600"
              />
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !amount || parseFloat(amount) <= 0}
              className="w-full py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-400 text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : 'Withdraw to Arbitrum'}
            </button>

            {/* Info Text */}
            <p className="text-[10px] sm:text-xs text-gray-600 text-center leading-relaxed">
              If you have USDC in Spot Balances, transfer to Perps first.
              <br />Withdrawals arrive within 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Transfer Modal Component
function TransferModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const { fullBalance } = useAccountBalance();
  const { availableUsdc: spotAvailableUsdc } = useSpotBalance();
  const { transfer, isTransferring } = useTransfer();

  // Default to spot-to-perps if user has spot balance but no perps balance
  const hasSpotBalance = spotAvailableUsdc > 0;
  const hasPerpsBalance = (fullBalance?.withdrawable || 0) > 0;
  const [direction, setDirection] = useState<'perps-to-spot' | 'spot-to-perps'>(
    hasSpotBalance && !hasPerpsBalance ? 'spot-to-perps' : 'perps-to-spot'
  );

  // Calculate max amount based on direction - use actual spot balance from Hyperliquid
  const maxAmount = direction === 'perps-to-spot'
    ? (fullBalance?.withdrawable?.toFixed(2) || '0.00')
    : spotAvailableUsdc.toFixed(2);

  const toggleDirection = () => {
    setDirection(direction === 'perps-to-spot' ? 'spot-to-perps' : 'perps-to-spot');
    setAmount('');
  };

  const handleTransfer = async () => {
    const toPerps = direction === 'spot-to-perps';
    const result = await transfer(amount, toPerps);
    if (result.success) {
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#0f1419] border border-gray-800 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
            <h2 className="text-lg sm:text-xl font-normal text-white">Transfer USDC</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Between Perps and Spot balances
            </p>
          </div>

          {/* Direction Selector */}
          <div className="bg-[#1a2028] border border-gray-800 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              {/* From */}
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">From</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                    direction === 'perps-to-spot' ? 'bg-purple-400' : 'bg-teal-400'
                  )} />
                  <span className="text-white text-sm sm:text-base font-normal">
                    {direction === 'perps-to-spot' ? 'Perps' : 'Spot'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  ${direction === 'perps-to-spot' ? (fullBalance?.withdrawable?.toFixed(2) || '0.00') : spotAvailableUsdc.toFixed(2)}
                </p>
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleDirection}
                className="mx-2 sm:mx-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* To */}
              <div className="flex-1 text-right">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">To</p>
                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                  <span className="text-white text-sm sm:text-base font-normal">
                    {direction === 'perps-to-spot' ? 'Spot' : 'Perps'}
                  </span>
                  <span className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                    direction === 'perps-to-spot' ? 'bg-teal-400' : 'bg-purple-400'
                  )} />
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  ${direction === 'perps-to-spot' ? spotAvailableUsdc.toFixed(2) : (fullBalance?.withdrawable?.toFixed(2) || '0.00')}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-normal">Amount</label>
                <button
                  onClick={() => setAmount(maxAmount)}
                  className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 font-normal transition-colors"
                >
                  MAX: {maxAmount}
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#1a2028] border border-gray-800 text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-teal-500/50 placeholder-gray-600"
              />
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleTransfer}
              disabled={isTransferring || !amount || parseFloat(amount) <= 0}
              className="w-full py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-400 text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Transferring...
                </span>
              ) : `Transfer to ${direction === 'perps-to-spot' ? 'Spot' : 'Perps'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
