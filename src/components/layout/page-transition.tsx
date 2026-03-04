'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { GridLoader } from './grid-loader';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Routes that skip the loader (sub-page navigation)
const SKIP_TRANSITION_PATTERNS = [
  // Portfolio sub-pages
  /^\/portfolio\/orders/,
  /^\/portfolio\/funds/,
  /^\/portfolio\/transfers/,
  // Trade sub-pages
  /^\/trade\/[^/]+\/long/,
  /^\/trade\/[^/]+\/short/,
  /^\/trade\/[^/]+\/swap/,
  // Trading group routes
  /^\/spot/,
  /^\/dex/,
  /^\/multichain/,
];

// Check if transitioning within trading group (spot, dex, multichain, trade)
function isWithinTradingGroup(from: string, to: string): boolean {
  const tradingRoutes = ['/spot', '/dex', '/multichain', '/trade'];
  const fromIsTradingGroup = tradingRoutes.some(route => from.startsWith(route));
  const toIsTradingGroup = tradingRoutes.some(route => to.startsWith(route));
  return fromIsTradingGroup && toIsTradingGroup;
}

// Check if should skip transition
function shouldSkipTransition(from: string, to: string): boolean {
  // Skip if navigating within the same base route (sub-page navigation)
  const fromBase = from.split('/').slice(0, 2).join('/');
  const toBase = to.split('/').slice(0, 2).join('/');

  if (fromBase === toBase && from !== to) {
    return true;
  }

  // Skip if matches any skip pattern
  if (SKIP_TRANSITION_PATTERNS.some(pattern => pattern.test(to))) {
    return true;
  }

  // Skip if within trading group
  if (isWithinTradingGroup(from, to)) {
    return true;
  }

  return false;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousPathRef = useRef(pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip on initial load
    if (isInitialLoad) {
      setIsInitialLoad(false);
      previousPathRef.current = pathname;
      return;
    }

    const previousPath = previousPathRef.current;

    // Same path, no transition needed
    if (previousPath === pathname) {
      return;
    }

    // Check if we should skip the transition
    if (shouldSkipTransition(previousPath, pathname)) {
      previousPathRef.current = pathname;
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start transition
    setShowContent(false);
    setIsLoading(true);

    // After 1 second, hide loader and show content
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
      previousPathRef.current = pathname;
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, isInitialLoad]);

  return (
    <>
      <div style={{ display: showContent ? 'contents' : 'none' }}>
        {children}
      </div>
      <GridLoader isVisible={isLoading} />
    </>
  );
}
