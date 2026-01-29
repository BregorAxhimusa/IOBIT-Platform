'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook to register and handle keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Trading-specific keyboard shortcuts
 */
export function useTradingShortcuts(actions: {
  setBuySide?: () => void;
  setSellSide?: () => void;
  setMarketType?: () => void;
  setLimitType?: () => void;
  focusPriceInput?: () => void;
  focusSizeInput?: () => void;
  submitOrder?: () => void;
  cancelAllOrders?: () => void;
  closeAllPositions?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Buy/Sell selection
    ...(actions.setBuySide
      ? [
          {
            key: 'b',
            description: 'Select Buy',
            action: actions.setBuySide,
          },
        ]
      : []),
    ...(actions.setSellSide
      ? [
          {
            key: 's',
            description: 'Select Sell',
            action: actions.setSellSide,
          },
        ]
      : []),

    // Order type selection
    ...(actions.setMarketType
      ? [
          {
            key: 'm',
            description: 'Select Market Order',
            action: actions.setMarketType,
          },
        ]
      : []),
    ...(actions.setLimitType
      ? [
          {
            key: 'l',
            description: 'Select Limit Order',
            action: actions.setLimitType,
          },
        ]
      : []),

    // Input focus
    ...(actions.focusPriceInput
      ? [
          {
            key: 'p',
            description: 'Focus Price Input',
            action: actions.focusPriceInput,
          },
        ]
      : []),
    ...(actions.focusSizeInput
      ? [
          {
            key: 'a',
            description: 'Focus Size Input',
            action: actions.focusSizeInput,
          },
        ]
      : []),

    // Order submission
    ...(actions.submitOrder
      ? [
          {
            key: 'Enter',
            ctrl: true,
            description: 'Submit Order (Ctrl+Enter)',
            action: actions.submitOrder,
          },
        ]
      : []),

    // Cancel/Close actions
    ...(actions.cancelAllOrders
      ? [
          {
            key: 'c',
            ctrl: true,
            shift: true,
            description: 'Cancel All Orders (Ctrl+Shift+C)',
            action: actions.cancelAllOrders,
          },
        ]
      : []),
    ...(actions.closeAllPositions
      ? [
          {
            key: 'x',
            ctrl: true,
            shift: true,
            description: 'Close All Positions (Ctrl+Shift+X)',
            action: actions.closeAllPositions,
          },
        ]
      : []),
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

/**
 * Hook to show keyboard shortcuts modal
 */
export function useShortcutsHelp() {
  const shortcuts: KeyboardShortcut[] = [
    { key: 'B', description: 'Select Buy side', action: () => {} },
    { key: 'S', description: 'Select Sell side', action: () => {} },
    { key: 'M', description: 'Select Market order type', action: () => {} },
    { key: 'L', description: 'Select Limit order type', action: () => {} },
    { key: 'P', description: 'Focus Price input', action: () => {} },
    { key: 'A', description: 'Focus Amount/Size input', action: () => {} },
    { key: 'Ctrl+Enter', description: 'Submit order', action: () => {} },
    { key: 'Ctrl+Shift+C', description: 'Cancel all orders', action: () => {} },
    { key: 'Ctrl+Shift+X', description: 'Close all positions', action: () => {} },
    { key: 'Escape', description: 'Close modals/dialogs', action: () => {} },
  ];

  return shortcuts;
}
