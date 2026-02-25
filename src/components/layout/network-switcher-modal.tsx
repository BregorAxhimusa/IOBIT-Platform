'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNetworkStore } from '@/store/network-store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface NetworkSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkSwitcherModal({ isOpen, onClose }: NetworkSwitcherModalProps) {
  const { network, setNetwork } = useNetworkStore();
  const [selectedNetwork, setSelectedNetwork] = useState(network);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSwitchNetwork = () => {
    setNetwork(selectedNetwork);
    toast.success(`Switched to ${selectedNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}`);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      style={{ zIndex: 999999 }}
    >
      <div
        className="bg-[#0f1419] border border-gray-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-normal text-white">Select Network</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Choose your trading environment</p>
          </div>

          {/* Network Options */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {/* Mainnet Option */}
            <button
              onClick={() => setSelectedNetwork('mainnet')}
              className={cn(
                'w-full p-3 sm:p-4 border-2 transition-all text-left',
                selectedNetwork === 'mainnet'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-[#1a2028]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full',
                    selectedNetwork === 'mainnet' ? 'bg-emerald-500' : 'bg-gray-600'
                  )} />
                  <div>
                    <span className="text-white text-sm sm:text-base font-normal block">Mainnet</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs">Real trading with actual funds</span>
                  </div>
                </div>
                {selectedNetwork === 'mainnet' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Testnet Option */}
            <button
              onClick={() => setSelectedNetwork('testnet')}
              className={cn(
                'w-full p-3 sm:p-4 border-2 transition-all text-left',
                selectedNetwork === 'testnet'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-[#1a2028]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full',
                    selectedNetwork === 'testnet' ? 'bg-amber-500' : 'bg-gray-600'
                  )} />
                  <div>
                    <span className="text-white text-sm sm:text-base font-normal block">Testnet</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs">Practice trading with test funds</span>
                  </div>
                </div>
                {selectedNetwork === 'testnet' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Warning */}
          {selectedNetwork !== network && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[10px] sm:text-xs text-amber-400">
                  Switching networks will refresh all data and reconnect WebSockets
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 bg-[#1a2028] border border-gray-800 hover:border-gray-700 text-white font-normal text-xs sm:text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSwitchNetwork}
              disabled={selectedNetwork === network}
              className="flex-1 py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-400 text-white font-normal text-xs sm:text-sm transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Switch Network
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
