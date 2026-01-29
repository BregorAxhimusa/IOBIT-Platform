import { cn } from '@/lib/utils/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-800/50', className)}
      {...props}
    />
  );
}

/**
 * Table Skeleton for loading states
 */
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex gap-4 pb-3 border-b border-gray-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Data Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
      <Skeleton className="flex-1 w-full" />
    </div>
  );
}

/**
 * Order Book Skeleton
 */
export function OrderBookSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="mb-4">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Header */}
      <div className="flex justify-between mb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Asks */}
      <div className="space-y-1 mb-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`ask-${i}`} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="my-2">
        <Skeleton className="h-6 w-full" />
      </div>

      {/* Bids */}
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`bid-${i}`} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Recent Trades Skeleton
 */
export function RecentTradesSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="mb-4">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Header */}
      <div className="flex justify-between mb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Trades */}
      <div className="space-y-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Markets List Skeleton
 */
export function MarketsListSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="mb-4">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Trading Panel Skeleton
 */
export function TradingPanelSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/**
 * Market Info Bar Skeleton
 */
export function MarketInfoBarSkeleton() {
  return (
    <div className="px-4 py-3 bg-gray-950 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
