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
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
      style={{ zIndex: 999999 }}
    >
      <div
        className="bg-gradient-to-b from-gray-900 to-black border border-gray-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Select Network</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Mainnet Option */}
          <button
            onClick={() => setSelectedNetwork('mainnet')}
            className={cn(
              'w-full p-5 rounded-xl border-2 transition-all text-left group hover:scale-[1.02]',
              selectedNetwork === 'mainnet'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  selectedNetwork === 'mainnet' ? 'bg-emerald-500' : 'bg-gray-600'
                )} />
                <span className="text-white font-bold text-lg">Mainnet</span>
              </div>
              {selectedNetwork === 'mainnet' && (
                <span className="text-emerald-400 text-xl">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-400 ml-6">
              Real trading with actual funds
            </p>
          </button>

          {/* Testnet Option */}
          <button
            onClick={() => setSelectedNetwork('testnet')}
            className={cn(
              'w-full p-5 rounded-xl border-2 transition-all text-left group hover:scale-[1.02]',
              selectedNetwork === 'testnet'
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  selectedNetwork === 'testnet' ? 'bg-amber-500' : 'bg-gray-600'
                )} />
                <span className="text-white font-bold text-lg">Testnet</span>
              </div>
              {selectedNetwork === 'testnet' && (
                <span className="text-amber-400 text-xl">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-400 ml-6">
              Practice trading with test funds
            </p>
          </button>
        </div>

        {/* Warning */}
        {selectedNetwork !== network && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <p className="text-sm text-yellow-400 font-medium">
                Switching networks will refresh all data and reconnect WebSockets
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            Cancel
          </button>
          <button
            onClick={handleSwitchNetwork}
            disabled={selectedNetwork === network}
            className={cn(
              'flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200',
              selectedNetwork === network
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02]'
            )}
          >
            Switch Network
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
