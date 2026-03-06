'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppKitAccount } from '@reown/appkit/react';
import { useValidators } from '@/hooks/use-validators';
import { useStakingState } from '@/hooks/use-staking-state';
import { useStakingDelegate } from '@/hooks/use-staking-delegate';
import { useStakingTransfer } from '@/hooks/use-staking-transfer';
import { useStakingRewards } from '@/hooks/use-staking-rewards';
import { useMarketData } from '@/hooks/use-market-data';
import { DelegateModal } from '@/components/staking/delegate-modal';
import { PaginationFooter } from '@/components/ui/pagination';
import { cn } from '@/lib/utils/cn';
import type { ValidatorSummary } from '@/lib/hyperliquid/types';

type StakingTab = 'validators' | 'rewards' | 'history';
type DateFilter = 'all' | '7d' | '30d' | '90d';

const TABS: { key: StakingTab; label: string }[] = [
  { key: 'validators', label: 'Validator Performance' },
  { key: 'rewards', label: 'Staking Reward History' },
  { key: 'history', label: 'Staking Action History' },
];

const DATE_FILTERS: { key: DateFilter; label: string; days: number | null }[] = [
  { key: 'all', label: 'All Time', days: null },
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
];

// Filter items by date
function filterByDate<T extends { time: number }>(items: T[], days: number | null): T[] {
  if (days === null) return items;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter(item => item.time >= cutoff);
}

export default function StakingPage() {
  const { isConnected } = useAppKitAccount();

  // Set page title
  useEffect(() => {
    document.title = 'Staking | IOBIT';
  }, []);

  useMarketData(); // Initialize market data for StatusFooter
  const { validators, isLoading: isLoadingValidators } = useValidators();
  const { stakingState, delegations } = useStakingState();
  const { delegate, isDelegating } = useStakingDelegate();
  const { depositToStaking, isTransferring } = useStakingTransfer();
  const { rewards, history, isLoading: isLoadingRewards } = useStakingRewards();

  const [activeTab, setActiveTab] = useState<StakingTab>('validators');
  const [selectedValidator, setSelectedValidator] = useState<ValidatorSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Calculate totals
  const totalStaked = stakingState?.delegated ?? '0';
  const yourStake = stakingState?.delegated ?? '0';

  // Get filter days
  const filterDays = DATE_FILTERS.find(f => f.key === dateFilter)?.days ?? null;

  // Filter rewards and history by date
  const filteredRewards = filterByDate(rewards, filterDays);
  const filteredHistory = filterByDate(history, filterDays);

  // Pagination
  const totalItems = validators.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedValidators = validators.slice(startIndex, endIndex);

  // Get user delegation for a validator
  const getUserStake = (validatorAddress: string) => {
    const delegation = delegations.find(d => d.validator === validatorAddress);
    return delegation?.amount ?? '0';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white page-enter">
      <div className="w-full">
        {/* Header Section - Mobile */}
        <div className="md:hidden border-b border-[#1a1a1f]">
          {/* Title */}
          <div className="px-4 py-4 border-b border-[#1a1a1f]">
            <h1 className="text-2xl font-normal text-white">Staking</h1>
          </div>
          {/* Stats Row */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[#6b6b6b] text-[10px] mb-0.5">Total Staked</p>
              <p className="text-white text-base font-medium">{parseFloat(totalStaked).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[#6b6b6b] text-[10px] mb-0.5">Your Stake</p>
              <p className="text-white text-base font-medium">{parseFloat(yourStake).toFixed(2)}</p>
            </div>
            <button
              onClick={() => depositToStaking('0')}
              disabled={!isConnected || isTransferring}
              className="px-3 py-1.5 bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Header Section - Desktop */}
        <div className="hidden md:flex items-center justify-between px-6 border-b border-[#1a1a1f]">
          {/* Left - Title and Description */}
          <div className="flex items-center gap-6 py-5 border-r border-[#1a1a1f] pr-6">
            <h1 className="text-4xl lg:text-[60px] font-normal text-white">Staking</h1>
            <p className="text-[#6b6b6b] text-xs leading-relaxed max-w-xl">
              The IOBIT Multichain is a decentralized ecosystem powered by its native token, BIT. Stakers can
              delegate BIT to validators to help secure the network and earn rewards, while developers use IOBIT&apos;s
              infrastructure to build fast and scalable Web3 applications.
            </p>
          </div>

          {/* Right - Stats and Action */}
          <div className="flex items-center gap-12 border-l border-[#1a1a1f] pl-6">
            {/* Total Staked */}
            <div className="text-right border-r border-[#1a1a1f] pr-8 py-6">
              <p className="text-[#6b6b6b] text-xs mb-0.5">Total Staked</p>
              <p className="text-white text-2xl font-medium">{parseFloat(totalStaked).toFixed(2)}</p>
            </div>

            {/* Your Stake */}
            <div className="text-right">
              <p className="text-[#6b6b6b] text-xs mb-0.5">Your Stake</p>
              <p className="text-white text-2xl font-medium">{parseFloat(yourStake).toFixed(2)}</p>
            </div>

            {/* Need to Deposit Button */}
            <button
              onClick={() => depositToStaking('0')}
              disabled={!isConnected || isTransferring}
              className="px-5 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Need to Deposit
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex items-end justify-between border-b border-[#1a1a1f] px-4 md:px-6 pt-2 md:pt-0">
          {/* Tabs */}
          <div className="flex items-end gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'pb-3 text-xs md:text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap',
                  activeTab === tab.key
                    ? 'text-white border-[#16DE93]'
                    : 'text-[#6b6b6b] border-transparent hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Filter - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as DateFilter);
                setCurrentPage(1);
              }}
              className="bg-[#0a0a0c] border-l border-[#1a1a1f] text-white text-sm px-3 py-4 focus:outline-none cursor-pointer"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'validators' && (
          <div className="overflow-x-auto">
            {/* Table */}
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-[#6b6b6b] text-[10px] md:text-xs border-b border-[#1a1a1f] h-10 md:h-12">
                  <th className="text-left px-3 md:px-4 font-medium">Name</th>
                  <th className="text-left px-3 md:px-4 font-medium hidden lg:table-cell">Description</th>
                  <th className="text-right px-3 md:px-4 font-medium">Stake</th>
                  <th className="text-right px-3 md:px-4 font-medium">Your Stake</th>
                  <th className="text-right px-3 md:px-4 font-medium">Uptime</th>
                  <th className="text-right px-3 md:px-4 font-medium">Est. Apr</th>
                  <th className="text-center px-3 md:px-4 font-medium">Status</th>
                  <th className="text-right px-3 md:px-4 font-medium">Commission</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingValidators ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 md:py-8 text-[#6b6b6b] text-xs md:text-sm">
                      Loading validators...
                    </td>
                  </tr>
                ) : paginatedValidators.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 md:py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/iobit/landingpage/nofound.svg"
                          alt="No validators"
                          width={48}
                          height={48}
                          className="mb-3 opacity-50"
                        />
                        <span className="text-[#8A8A8E] text-xs md:text-sm">No validators found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedValidators.map((validator, index) => {
                    const userStake = getUserStake(validator.validator);
                    const isActive = !validator.isJailed;
                    const commission = parseFloat(validator.commission || '0') * 100;
                    const stake = parseFloat(validator.stake || '0');

                    return (
                      <tr
                        key={validator.validator}
                        className="border-b border-[#1a1a1f] hover:bg-[#0d0d0f] transition-colors"
                      >
                        <td className="py-3 md:py-4 px-3 md:px-4">
                          <span className="text-white text-xs md:text-sm font-medium">
                            {validator.name || `Validator ${index + 1}`}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 hidden lg:table-cell max-w-[300px]">
                          <span className="text-[#6b6b6b] text-xs md:text-sm line-clamp-2">
                            {validator.description || 'High-performance staking pool'}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                          <span className="text-white text-xs md:text-sm">
                            {stake.toFixed(1)} BIT
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                          <span className="text-white text-xs md:text-sm">
                            {parseFloat(userStake).toFixed(2)} BIT
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                          <span className="text-white text-xs md:text-sm">
                            {validator.uptime ? `${(parseFloat(validator.uptime) * 100).toFixed(1)}%` : '99.8%'}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                          <span className="text-[#16DE93] text-xs md:text-sm font-medium">
                            {validator.apr ? `${(parseFloat(validator.apr) * 100).toFixed(1)}%` : '5.2%'}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                          <span
                            className={cn(
                              'text-xs md:text-sm font-medium',
                              isActive ? 'text-[#16DE93]' : 'text-yellow-500'
                            )}
                          >
                            {isActive ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                          <span className="text-white text-xs md:text-sm">
                            {commission.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalItems > 0 && (
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={setItemsPerPage}
                rowOptions={[20, 50, 100]}
                className="border-0"
              />
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-[#6b6b6b] text-[10px] md:text-xs border-b border-[#1a1a1f] h-10 md:h-12">
                  <th className="text-left px-3 md:px-4 font-medium">Date</th>
                  <th className="text-left px-3 md:px-4 font-medium">Source</th>
                  <th className="text-right px-3 md:px-4 font-medium">Reward</th>
                  <th className="text-center px-3 md:px-4 font-medium">Status</th>
                  <th className="text-right px-3 md:px-4 font-medium">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRewards ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 md:py-8 text-[#6b6b6b] text-xs md:text-sm">
                      Loading rewards...
                    </td>
                  </tr>
                ) : filteredRewards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 md:py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/iobit/landingpage/nofound.svg"
                          alt="No rewards"
                          width={48}
                          height={48}
                          className="mb-3 opacity-50"
                        />
                        <span className="text-[#8A8A8E] text-xs md:text-sm">
                          {rewards.length === 0 ? 'No staking rewards yet' : 'No rewards in selected period'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRewards.map((reward, i) => (
                    <tr key={i} className="border-b border-[#1a1a1f] hover:bg-[#0d0d0f] transition-colors">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-white text-xs md:text-sm">
                        {new Date(reward.time).toLocaleDateString()}
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-white text-xs md:text-sm capitalize">
                        {reward.source}
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-right text-[#16DE93] text-xs md:text-sm font-medium">
                        +{parseFloat(reward.totalAmount).toFixed(4)} BIT
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-[#16DE93] text-xs md:text-sm font-medium">Claimed</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                        <a
                          href="#"
                          className="text-[#6b6b6b] text-xs md:text-sm hover:text-white transition-colors"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredRewards.length > 0 && (
              <PaginationFooter
                currentPage={1}
                totalPages={Math.ceil(filteredRewards.length / itemsPerPage) || 1}
                totalItems={filteredRewards.length}
                itemsPerPage={itemsPerPage}
                onPageChange={() => {}}
                onRowsPerPageChange={setItemsPerPage}
                rowOptions={[20, 50, 100]}
                className="border-0"
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="text-[#6b6b6b] text-[10px] md:text-xs border-b border-[#1a1a1f] h-10 md:h-12">
                  <th className="text-left px-3 md:px-4 font-medium">Date</th>
                  <th className="text-left px-3 md:px-4 font-medium">Action</th>
                  <th className="text-right px-3 md:px-4 font-medium">Amount</th>
                  <th className="text-left px-3 md:px-4 font-medium">Validator</th>
                  <th className="text-center px-3 md:px-4 font-medium">Status</th>
                  <th className="text-right px-3 md:px-4 font-medium">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRewards ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 md:py-8 text-[#6b6b6b] text-xs md:text-sm">
                      Loading history...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 md:py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/iobit/landingpage/nofound.svg"
                          alt="No history"
                          width={48}
                          height={48}
                          className="mb-3 opacity-50"
                        />
                        <span className="text-[#8A8A8E] text-xs md:text-sm">
                          {history.length === 0 ? 'No staking actions yet' : 'No actions in selected period'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, i) => {
                    // Extract action details from delta
                    const action = item.delta.delegate
                      ? (item.delta.delegate.isUndelegate ? 'Undelegate' : 'Delegate')
                      : item.delta.withdrawal
                        ? 'Withdrawal'
                        : item.delta.deposit
                          ? 'Deposit'
                          : 'Unknown';
                    const amount = item.delta.delegate?.amount
                      ?? item.delta.withdrawal?.amount
                      ?? item.delta.deposit?.amount
                      ?? '0';
                    const validatorAddr = item.delta.delegate?.validator;

                    return (
                    <tr key={i} className="border-b border-[#1a1a1f] hover:bg-[#0d0d0f] transition-colors">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-white text-xs md:text-sm">
                        {new Date(item.time).toLocaleDateString()}
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-white text-xs md:text-sm">
                        {action}
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-right text-white text-xs md:text-sm">
                        {parseFloat(amount).toFixed(4)} BIT
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-white text-xs md:text-sm">
                        {validatorAddr ? (validators.find(v => v.validator === validatorAddr)?.name || validatorAddr.slice(0, 8)) : '-'}
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-[#16DE93] text-xs md:text-sm font-medium">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-right">
                        <a
                          href="#"
                          className="text-[#6b6b6b] text-xs md:text-sm hover:text-white transition-colors"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredHistory.length > 0 && (
              <PaginationFooter
                currentPage={1}
                totalPages={Math.ceil(filteredHistory.length / itemsPerPage) || 1}
                totalItems={filteredHistory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={() => {}}
                onRowsPerPageChange={setItemsPerPage}
                rowOptions={[20, 50, 100]}
                className="border-0"
              />
            )}
          </div>
        )}
      </div>

      {/* Delegate Modal */}
      <DelegateModal
        isOpen={!!selectedValidator}
        onClose={() => setSelectedValidator(null)}
        validator={selectedValidator}
        availableBalance={stakingState?.undelegated ?? '0'}
        onDelegate={delegate}
        isDelegating={isDelegating}
      />
    </div>
  );
}
