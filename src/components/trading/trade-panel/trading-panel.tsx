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
  const { placeTwapOrder, cancelTwap, isPlacing: isTwapPlacing, isCancelling: isTwapCancelling, activeTwap } = useTwapOrder();
  const { placeScaleOrders, isPlacing: isScalePlacing } = useScaleOrders();
  const { mutate: updateLeverage, isPending: isUpdatingLeverage } = useUpdateLeverage();
  const { mutate: placeStopOrder } = usePlaceStopOrder();

  const priceInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

    // Check if user has sufficient balance (accounting for leverage)
    const availableBalanceNum = parseFloat(fullBalance?.withdrawable?.toString() || balance?.usdc || '0');
    const orderValueNum = sizeNum * (currentPrice || 0);
    const marginRequired = leverage > 0 ? orderValueNum / leverage : orderValueNum;

    if (availableBalanceNum === 0) {
      toast.error('No balance available. Please deposit funds first.');
      return;
    }

    if (marginRequired > availableBalanceNum && !reduceOnly) {
      toast.error(`Insufficient margin. Required: $${marginRequired.toFixed(2)}, Available: $${availableBalanceNum.toFixed(2)}`);
      return;
    }

    const result = await placeOrder({
      symbol,
      side: orderSide,
      orderType: activeTab === 'market' ? 'market' : 'limit',
      price: activeTab === 'limit' ? price : undefined,
      size,
      reduceOnly,
      postOnly: activeTab === 'limit' ? postOnly : undefined,
      timeInForce: activeTab === 'limit' ? timeInForce : 'IOC',
    });

    if (result.success) {
      resetForm();
      setSizePercentage(0);
    }
  };

  // Calculate size based on percentage (slider only controls percentage)
  const handlePercentageChange = (percentage: number) => {
    setSizePercentage(percentage);
    if (currentPrice) {
      // Use Hyperliquid account balance (withdrawable margin) for calculating position size
      const availableMargin = parseFloat(fullBalance?.withdrawable?.toString() || balance?.usdc || '0');
      const priceToUse = activeTab === 'limit' && price ? parseFloat(price) : currentPrice;

      if (priceToUse && priceToUse > 0) {
        // With leverage, max position size = (available margin * leverage) / price
        const effectiveLeverage = isSpot ? 1 : leverage;
        const maxPositionValue = availableMargin * effectiveLeverage;
        const calculatedSize = (maxPositionValue * percentage / 100) / priceToUse;

        // Use more decimals for very small amounts
        let decimals = 4;
        if (calculatedSize < 0.0001) decimals = 8;
        else if (calculatedSize < 0.01) decimals = 6;
        setSize(calculatedSize.toFixed(decimals));
      }
    }
  };

  const calculateOrderValue = () => {
    const sizeNum = parseFloat(size || '0');

    if (sizeNum === 0 || isNaN(sizeNum)) {
      return 'N/A';
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

  // For perps: show Hyperliquid account balance (withdrawable)
  // For spot: show spot USDC balance
  const availableBalance = isSpot
    ? spotAvailableUsdc.toFixed(2)
    : (fullBalance?.withdrawable?.toFixed(2) || '0.00');
  const makerFee = '0.0700%';
  const takerFee = '0.0400%';
  const slippageEst = '0%';
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
    <div className="flex flex-col h-full bg-[#0f1419] text-white rounded-lg">
      {/* Tabs: Market, Limit, Stop, Pro */}
      <div className="flex items-center border-b border-gray-800">
        <button
          onClick={() => {
            setActiveTab('market');
            setSelectedProOption('scale'); // Reset to default when leaving Pro
          }}
          className={cn(
            'flex-1 px-3 py-3 text-sm font-medium transition-colors',
            activeTab === 'market'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          Market
        </button>
        <button
          onClick={() => {
            setActiveTab('limit');
            setSelectedProOption('scale'); // Reset to default when leaving Pro
          }}
          className={cn(
            'flex-1 px-3 py-3 text-sm font-medium transition-colors',
            activeTab === 'limit'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          Limit
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
                'flex-1 px-3 py-3 text-sm font-medium transition-colors',
                activeTab === 'stop'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              Stop
            </button>
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setActiveTab('pro');
                  setShowProDropdown(!showProDropdown);
                }}
                className={cn(
                  'w-full px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1',
                  activeTab === 'pro'
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-gray-300'
                )}
              >
                {activeTab === 'pro' ? (selectedProOption === 'scale' ? 'Scale' : 'TWAP') : 'Pro'}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Pro Dropdown */}
              {showProDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-[#1a2028] border border-gray-700 rounded shadow-lg z-50 min-w-[100px]">
                  <button
                    onClick={() => {
                      setSelectedProOption('scale');
                      setShowProDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                  >
                    Scale
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProOption('twap');
                      setShowProDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                  >
                    TWAP
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-2.5 sm:p-4 space-y-3 sm:space-y-4 flex-1">
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderSide('buy')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded transition-colors',
                orderSide === 'buy'
                  ? 'bg-[#14b8a6] text-white'
                  : 'bg-[#1a2028] text-gray-400 hover:text-white'
              )}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded transition-colors',
                orderSide === 'sell'
                  ? 'bg-[#1e293b] text-white'
                  : 'bg-[#1a2028] text-gray-400 hover:text-white'
              )}
            >
              Sell
            </button>
          </div>

          {/* Available to Trade */}
          <div className="flex items-center justify-between text-xs">
            <span
              onClick={() => setShowTransferModal(true)}
              className="text-gray-400 underline cursor-pointer hover:text-gray-300"
            >
              Available to Trade
            </span>
            <span className="text-white">
              {availableBalance} USDC
            </span>
          </div>

          {/* Stop Tab - Stop Orders */}
          {activeTab === 'stop' && (
            <>
              {/* Stop Order Type Toggle */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStopOrderType('stop-market')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                      stopOrderType === 'stop-market'
                        ? 'bg-[#14b8a6] text-white'
                        : 'bg-[#1a2028] text-gray-400 hover:text-white'
                    )}
                  >
                    Stop Market
                  </button>
                  <button
                    onClick={() => setStopOrderType('stop-limit')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                      stopOrderType === 'stop-limit'
                        ? 'bg-[#14b8a6] text-white'
                        : 'bg-[#1a2028] text-gray-400 hover:text-white'
                    )}
                  >
                    Stop Limit
                  </button>
                </div>
              </div>

              {/* Trigger Price */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Trigger Price (USDC)</label>
                  <button
                    onClick={() => currentPrice && setTriggerPrice(currentPrice.toString())}
                    className="text-xs text-[#14b8a6] hover:underline"
                  >
                    Mid
                  </button>
                </div>
                <input
                  type="number"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder={currentPrice?.toString() || '0'}
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Order triggers when price {orderSide === 'buy' ? 'rises to' : 'falls to'} trigger price
                </p>
              </div>

              {/* Limit Price (only for Stop Limit) */}
              {stopOrderType === 'stop-limit' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400">Limit Price (USDC)</label>
                    <button
                      onClick={() => currentPrice && setPrice(currentPrice.toString())}
                      className="text-xs text-[#14b8a6] hover:underline"
                    >
                      Mid
                    </button>
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={currentPrice?.toString() || '0'}
                    step="0.01"
                    className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
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
                <label className="text-xs text-gray-400 mb-2 block">Running Time (5m - 24H)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={twapHours}
                    onChange={(e) => setTwapHours(e.target.value)}
                    placeholder="Hour(s)"
                    min="0"
                    max="24"
                    className="px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  />
                  <input
                    type="number"
                    value={twapMinutes}
                    onChange={(e) => setTwapMinutes(e.target.value)}
                    placeholder="Minute(s)"
                    min="0"
                    max="59"
                    className="px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={twapRandomize}
                  onChange={(e) => setTwapRandomize(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-[#1a2028] text-[#14b8a6] focus:ring-[#14b8a6] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300">Randomize</span>
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
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Start (USDC)</label>
                <input
                  type="number"
                  value={scaleStartPrice}
                  onChange={(e) => setScaleStartPrice(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">End (USDC)</label>
                <input
                  type="number"
                  value={scaleEndPrice}
                  onChange={(e) => setScaleEndPrice(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Total Orders</label>
                  <input
                    type="number"
                    value={scaleTotalOrders}
                    onChange={(e) => setScaleTotalOrders(e.target.value)}
                    placeholder="0"
                    min="2"
                    max="10"
                    className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Size Skew</label>
                  <input
                    type="number"
                    value={scaleSizeSkew}
                    onChange={(e) => setScaleSizeSkew(e.target.value)}
                    step="0.01"
                    className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">Price (USDC)</label>
                <button
                  onClick={() => currentPrice && setPrice(currentPrice.toString())}
                  className="text-xs text-[#14b8a6] hover:underline"
                >
                  Mid
                </button>
              </div>
              <input
                ref={priceInputRef}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice?.toString() || '0'}
                className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
              />
            </div>
          )}

          {/* Size Input */}
          {(
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Size</label>
            <div className="relative">
              <input
                ref={sizeInputRef}
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 pr-20 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
              />
              <select
                value={sizeDenomination}
                onChange={(e) => setSizeDenomination(e.target.value as 'crypto' | 'usdc')}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-white text-xs border-none focus:outline-none cursor-pointer"
              >
                <option value="crypto">{symbol.replace('-USD', '').replace('/USD', '')}</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
          </div>
          )}

          {/* Percentage Slider */}
          {(
          <div className="space-y-2">
            {/* Quick Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handlePercentageChange(25)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  sizePercentage === 25
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038]"
                )}
              >
                25%
              </button>
              <button
                onClick={() => handlePercentageChange(50)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  sizePercentage === 50
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038]"
                )}
              >
                50%
              </button>
              <button
                onClick={() => handlePercentageChange(75)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  sizePercentage === 75
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038]"
                )}
              >
                75%
              </button>
              <button
                onClick={() => handlePercentageChange(100)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  sizePercentage === 100
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038]"
                )}
              >
                100%
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isNaN(sizePercentage) ? 0 : sizePercentage}
                  onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                  style={{
                    background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${isNaN(sizePercentage) ? 0 : sizePercentage}%, #374151 ${isNaN(sizePercentage) ? 0 : sizePercentage}%, #374151 100%)`
                  }}
                />
              </div>
              <div className="flex items-center gap-1 min-w-[60px]">
                <input
                  type="number"
                  value={isNaN(sizePercentage) ? 0 : Math.round(sizePercentage)}
                  onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)}
                  className="w-12 px-2 py-1 bg-[#1a2028] border border-gray-700 rounded text-white text-sm text-right focus:outline-none focus:border-[#14b8a6]"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            </div>
          </div>
          )}

          {/* TIF Selector (Limit only) */}
          {activeTab === 'limit' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">TIF</label>
              </div>
              <button
                onClick={() => setShowTifDropdown(!showTifDropdown)}
                className="w-full px-3 py-2 bg-[#1a2028] border border-gray-700 rounded text-white text-xs text-left flex items-center justify-between"
              >
                {timeInForce}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTifDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a2028] border border-gray-700 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      setTimeInForce('GTC');
                      setShowTifDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-700 transition-colors"
                  >
                    GTC
                  </button>
                  <button
                    onClick={() => {
                      setTimeInForce('IOC');
                      setShowTifDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-700 transition-colors"
                  >
                    IOC
                  </button>
                  <button
                    onClick={() => {
                      setTimeInForce('ALO');
                      setShowTifDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-gray-700 transition-colors"
                  >
                    ALO
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trading Options Checkboxes */}
          <div className="space-y-2">
            {/* Reduce Only - Perps only */}
            {!isSpot && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reduceOnly}
                  onChange={(e) => setReduceOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-[#1a2028] text-[#14b8a6] focus:ring-[#14b8a6] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300">Reduce Only</span>
              </label>
            )}

            {/* Post Only - Only for limit orders */}
            {activeTab === 'limit' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postOnly}
                  onChange={(e) => setPostOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-600 bg-[#1a2028] text-[#14b8a6] focus:ring-[#14b8a6] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-300">Post Only</span>
              </label>
            )}
          </div>
        </div>

        {/* Bottom Section - Stays at bottom */}
        <div className="mt-auto">
          {/* Main Action Button */}
          <div className="px-2.5 sm:px-4 pb-3 sm:pb-4">
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || isPlacingSpot || isTwapPlacing || isScalePlacing || isFormInvalid()}
            className={cn(
              'w-full py-1.5 rounded font-semibold transition-colors text-xs',
              orderSide === 'buy'
                ? 'bg-[#14b8a6] hover:bg-[#0f9a8a] text-white disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-[#ef4444] hover:bg-[#dc2626] text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {!mounted ? 'Enable Trading'
              : !isConnected ? 'Connect'
              : isPlacing || isPlacingSpot || isTwapPlacing || isScalePlacing ? 'Placing...'
              : isSpot ? `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${activeTab === 'market' ? 'Market' : 'Limit'}`
              : activeTab === 'pro' && selectedProOption === 'twap' ? 'Start TWAP'
              : activeTab === 'pro' && selectedProOption === 'scale' ? 'Place Scale Orders'
              : activeTab === 'market' ? `${orderSide === 'buy' ? 'Buy' : 'Sell'} Market`
              : activeTab === 'limit' ? `${orderSide === 'buy' ? 'Buy' : 'Sell'} Limit`
              : 'Place Order'}
          </button>
          {mounted && isConnected && getValidationError() && (
            <div className="mt-2">
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
                  className="w-full py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded font-medium transition-colors text-xs"
                >
                  Switch to Arbitrum
                </button>
              ) : (
                <p className="text-xs text-[#ef4444] text-center">{getValidationError()}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <span className="text-gray-400">Order Value</span>
            <span className="text-white">{orderValue}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 underline cursor-pointer">Slippage</span>
            <span className="text-white">Est: {slippageEst} / Max: {slippageMax}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <span className="text-gray-400">Fees</span>
            <span className="text-white">{makerFee} / {takerFee}</span>
          </div>
        </div>

        {/* Leverage Selector - Perps only */}
        {!isSpot && (
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Leverage</span>
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
                  'px-2 py-0.5 text-[10px] rounded border transition-colors',
                  isCrossMargin
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-orange-500 text-orange-400 bg-orange-500/10'
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
                  className="w-12 px-1.5 py-0.5 bg-[#1a2028] border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setShowLeverageInput(true)}
                  className="px-2 py-0.5 text-xs text-white bg-[#1a2028] hover:bg-[#2a3038] border border-gray-700 rounded transition-colors"
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
                  'px-2 py-1 text-[10px] rounded transition-colors',
                  leverage === lev
                    ? 'bg-[#14b8a6] text-white'
                    : 'bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038]'
                )}
                disabled={isUpdatingLeverage}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Deposit Button */}
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="w-full py-1.5 bg-[#0f5549] hover:bg-[#0a3d34] text-white rounded font-medium transition-colors text-xs"
          >
            Deposit
          </button>
        </div>

        {/* Perps/Spot Transfer & Withdraw */}
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-2.5 py-1.5 bg-transparent border border-gray-700 hover:border-gray-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            Perps ⇄ Spot
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-2.5 py-1.5 bg-transparent border border-gray-700 hover:border-gray-600 text-white rounded text-xs font-medium transition-colors"
          >
            Withdraw
          </button>
        </div>

        {/* Account Equity */}
        <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-3 pt-2.5 sm:pt-3 border-t border-gray-800">
          <h3 className="text-xs font-semibold mb-2">Account Equity</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Spot</span>
              <span className="text-white">${balance?.spot || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 underline cursor-pointer">Perps</span>
              <span className="text-white">${balance?.perps || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Perps Overview - only for perps */}
        {!isSpot && (
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4">
          <h3 className="text-xs font-semibold mb-2">Perps Overview</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 underline cursor-pointer">Balance</span>
              <span className="text-white">${fullBalance?.accountValue.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Unrealized PNL</span>
              <span className={cn(
                "text-white",
                fullBalance && fullBalance.totalNtlPos > 0 ? 'text-green-400' : fullBalance && fullBalance.totalNtlPos < 0 ? 'text-red-400' : ''
              )}>
                ${fullBalance?.totalNtlPos.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 underline cursor-pointer">Cross Margin Ratio</span>
              <span className="text-white">
                {fullBalance && fullBalance.accountValue > 0
                  ? ((fullBalance.totalMarginUsed / fullBalance.accountValue) * 100).toFixed(2)
                  : '0.00'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 underline cursor-pointer">Maintenance Margin</span>
              <span className="text-white">${fullBalance?.totalMarginUsed.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
        )}

        {/* Spot Overview - only for spot */}
        {isSpot && (
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4">
          <h3 className="text-xs font-semibold mb-2">Spot Overview</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">USDC Balance</span>
              <span className="text-white">${spotAvailableUsdc.toFixed(2)}</span>
            </div>
          </div>
        </div>
        )}
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
      const response = await fetch('https://api.hyperliquid-testnet.xyz/info', {
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2028] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDepositing}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10 disabled:opacity-50"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
              <span className="text-2xl">$</span>
            </div>
            <h2 className="text-lg font-semibold text-white">
              {isTestnet ? 'Get Testnet USDC' : 'Deposit USDC from Arbitrum'}
            </h2>
            {isTestnet && (
              <span className="mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/50">
                TESTNET MODE
              </span>
            )}
          </div>

          {/* Testnet Faucet Section */}
          {isTestnet && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-400 mb-2">Get Free Test USDC</h3>
              <p className="text-xs text-gray-400 mb-3">
                Request free testnet USDC to practice trading without real funds.
              </p>
              <button
                onClick={handleRequestTestnetFunds}
                disabled={isRequestingFaucet || !address}
                className="w-full py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded font-medium transition-colors disabled:opacity-50"
              >
                {isRequestingFaucet ? 'Requesting...' : 'Request 10,000 Test USDC'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Or visit{' '}
                <a
                  href="https://app.hyperliquid-testnet.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:underline"
                >
                  app.hyperliquid-testnet.xyz
                </a>
              </p>
            </div>
          )}

          {/* Form - Only show for mainnet */}
          {!isTestnet && (
            <div className="space-y-4">
              {/* Asset */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Asset</label>
                <select
                  disabled={isDepositing}
                  className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6] disabled:opacity-50"
                >
                  <option>USDC</option>
                </select>
              </div>

              {/* Deposit Chain */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Deposit Chain</label>
                <select
                  disabled={isDepositing}
                  className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6] disabled:opacity-50"
                >
                  <option>Arbitrum</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Amount</label>
                  <span className="text-sm text-[#14b8a6]">MAX: {maxAmount}</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isDepositing}
                  className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6] disabled:opacity-50"
                />

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <button
                    onClick={() => handlePercentageClick(25)}
                    disabled={isDepositing}
                    className="px-2 py-1.5 text-xs rounded bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038] transition-colors disabled:opacity-50"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handlePercentageClick(50)}
                    disabled={isDepositing}
                    className="px-2 py-1.5 text-xs rounded bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038] transition-colors disabled:opacity-50"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handlePercentageClick(75)}
                    disabled={isDepositing}
                    className="px-2 py-1.5 text-xs rounded bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038] transition-colors disabled:opacity-50"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => handlePercentageClick(100)}
                    disabled={isDepositing}
                    className="px-2 py-1.5 text-xs rounded bg-[#1a2028] text-gray-400 hover:text-white hover:bg-[#2a3038] transition-colors disabled:opacity-50"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Warning Messages */}
              {hasInsufficientBalance && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
                  Insufficient balance. Minimum deposit is {minDeposit} USDC but you only have {maxBalance.toFixed(2)} USDC.
                </div>
              )}

              {isBelowMinimum && !hasInsufficientBalance && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-400">
                  Minimum deposit is {minDeposit} USDC. Amounts below this will be LOST!
                </div>
              )}

              {/* Deposit Button */}
              <button
                onClick={handleDeposit}
                disabled={!canDeposit}
                className="w-full py-3 bg-[#0f5549] hover:bg-[#0a3d34] text-white rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? 'Depositing...' : hasInsufficientBalance ? `Need ${minDeposit} USDC min` : 'Deposit'}
              </button>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center">
                Min: {minDeposit} USDC | Deposits are instant (Hyperliquid pays gas)
              </p>
            </div>
          )}

          {/* Testnet Info */}
          {isTestnet && (
            <p className="text-xs text-gray-500 text-center">
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2028] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
              <span className="text-2xl">$</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Withdraw USDC to Arbitrum</h2>
            <p className="text-xs text-gray-400 text-center">
              USDC will be sent over the Arbitrum network to your address.
              <br />A 1 USDC fee will be deducted from the USDC withdrawn.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Asset */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Asset</label>
              <select className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]">
                <option>USDC</option>
              </select>
            </div>

            {/* Withdrawal Chain */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Withdrawal Chain</label>
              <select className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]">
                <option>Arbitrum</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Amount</label>
                <span className="text-sm text-[#14b8a6]">MAX: {maxAmount}</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 bg-[#0f5549] hover:bg-[#0a3d34] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw to Arbitrum'}
            </button>

            {/* Info Text */}
            <p className="text-xs text-gray-400 text-center">
              If you have USDC in your Spot Balances, transfer to Perps to make it available to
              withdraw. Withdrawals should arrive within 5 minutes.
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
  const [direction, setDirection] = useState<'perps-to-spot' | 'spot-to-perps'>('perps-to-spot');
  const { balance } = useAccountBalance();
  const { transfer, isTransferring } = useTransfer();

  // Calculate max amount based on direction
  const maxAmount = direction === 'perps-to-spot'
    ? balance?.perps || '0.00'
    : balance?.spot || '0.00';

  const toggleDirection = () => {
    setDirection(direction === 'perps-to-spot' ? 'spot-to-perps' : 'perps-to-spot');
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2028] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Transfer USDC</h2>
            <p className="text-xs text-gray-400 text-center">
              Transfer USDC between your Perps and Spot balances.
            </p>
          </div>

          {/* Direction Selector */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`text-sm font-medium ${direction === 'perps-to-spot' ? 'text-white' : 'text-gray-400'}`}>
              Perps
            </span>
            <button
              onClick={toggleDirection}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <span className={`text-sm font-medium ${direction === 'spot-to-perps' ? 'text-white' : 'text-gray-400'}`}>
              Spot
            </span>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Amount</label>
                <span className="text-sm text-[#14b8a6]">MAX: {maxAmount}</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleTransfer}
              disabled={isTransferring || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 bg-[#0f5549] hover:bg-[#0a3d34] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors"
            >
              {isTransferring ? 'Transferring...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
