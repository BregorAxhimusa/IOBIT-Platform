'use client';

import { useState, useEffect } from 'react';
import type { ActiveTwap } from '@/hooks/use-twap-order';
import { cn } from '@/lib/utils/cn';

interface TwapProgressProps {
  activeTwap: ActiveTwap;
  onCancel: () => void;
  isCancelling: boolean;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Completing...';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function TwapProgress({ activeTwap, onCancel, isCancelling }: TwapProgressProps) {
  const [timeRemaining, setTimeRemaining] = useState(activeTwap.endTime - Date.now());

  // Update time remaining every second
  useEffect(() => {
    if (activeTwap.status !== 'active') return;

    const interval = setInterval(() => {
      setTimeRemaining(activeTwap.endTime - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTwap.endTime, activeTwap.status]);

  const timeProgress = Math.min(
    100,
    ((Date.now() - activeTwap.startTime) / (activeTwap.endTime - activeTwap.startTime)) * 100
  );
  const sizeProgress = activeTwap.totalSize > 0
    ? (activeTwap.executedSize / activeTwap.totalSize) * 100
    : 0;

  const isBuy = activeTwap.side === 'buy';
  const isActive = activeTwap.status === 'active';
  const isCompleted = activeTwap.status === 'completed';
  const isCancelled = activeTwap.status === 'cancelled';

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      isActive && 'bg-yellow-500/5 border-yellow-500/20',
      isCompleted && 'bg-green-500/5 border-green-500/20',
      isCancelled && 'bg-red-500/5 border-red-500/20',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
          {isCompleted && (
            <div className="w-2 h-2 rounded-full bg-green-400" />
          )}
          {isCancelled && (
            <div className="w-2 h-2 rounded-full bg-red-400" />
          )}
          <span className="text-sm font-medium text-white">
            TWAP {activeTwap.side.toUpperCase()} {activeTwap.symbol.replace('-USD', '')}
          </span>
        </div>
        <span className={cn(
          'text-xs font-medium px-1.5 py-0.5 rounded',
          isActive && 'text-yellow-400 bg-yellow-400/10',
          isCompleted && 'text-green-400 bg-green-400/10',
          isCancelled && 'text-red-400 bg-red-400/10',
        )}>
          {activeTwap.status.toUpperCase()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 my-2">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            isBuy ? 'bg-teal-500' : 'bg-red-500',
            isCancelled && 'bg-gray-500',
          )}
          style={{ width: `${Math.max(timeProgress, sizeProgress)}%` }}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-400 mb-2">
        <div>
          <span className="text-gray-500">Executed: </span>
          {activeTwap.executedSize.toFixed(4)} / {activeTwap.totalSize.toFixed(4)}
        </div>
        <div className="text-right">
          <span className="text-gray-500">Slices: </span>
          {activeTwap.executedSlices} / {activeTwap.totalSlices}
        </div>
        <div>
          <span className="text-gray-500">Duration: </span>
          {activeTwap.durationMinutes}min
        </div>
        <div className="text-right">
          <span className="text-gray-500">
            {isActive ? 'Remaining: ' : 'Ended'}
          </span>
          {isActive && formatTimeRemaining(timeRemaining)}
        </div>
      </div>

      {/* Cancel Button (only when active) */}
      {isActive && (
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="w-full py-1.5 rounded text-sm font-medium transition-colors
                     bg-red-500/10 text-red-400 hover:bg-red-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Cancelling...
            </span>
          ) : 'Cancel TWAP Order'}
        </button>
      )}
    </div>
  );
}
