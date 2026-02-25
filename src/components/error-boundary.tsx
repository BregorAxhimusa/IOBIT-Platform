'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-normal text-white">Something went wrong</h2>
            <p className="text-gray-400 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Trading Error Boundary - Specific for trading components
 */
export function TradingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-center space-y-3">
            <div className="text-red-500 text-3xl">⚠️</div>
            <h3 className="text-lg font-normal text-white">Trading Error</h3>
            <p className="text-gray-400 text-sm">
              Unable to load trading interface
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Trading component error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Chart Error Boundary - Specific for chart components
 */
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-center space-y-2">
            <div className="text-yellow-500 text-2xl">📊</div>
            <p className="text-gray-400 text-sm">Unable to load chart</p>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Chart error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Data Error Boundary - For data fetching components
 */
export function DataErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-center space-y-2">
            <div className="text-red-500 text-2xl">⚠️</div>
            <p className="text-gray-400 text-sm">Failed to load data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      }
      onError={(error) => {
        console.error('Data loading error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
