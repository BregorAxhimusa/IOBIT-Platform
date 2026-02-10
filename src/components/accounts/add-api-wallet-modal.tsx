'use client';

import { useState } from 'react';
import { useApiWallets } from '@/hooks/use-api-wallets';

interface AddApiWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddApiWalletModal({ isOpen, onClose, onSuccess }: AddApiWalletModalProps) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const { approveAgent, isApproving } = useApiWallets();

  if (!isOpen) return null;

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleSubmit = async () => {
    if (!isValidAddress) return;

    const result = await approveAgent(address, name.trim() || null);
    if (result.success) {
      setAddress('');
      setName('');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0f1419] border border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Add API Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 text-xs mb-4">
          Authorize an external wallet address to trade on your behalf. Limits: 1 unnamed + 3 named per master, +2 per sub-account.
        </p>

        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-gray-500"
          />
          {address && !isValidAddress && (
            <p className="text-red-400 text-[10px] mt-1">Invalid Ethereum address</p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1 block">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bot Wallet"
            maxLength={24}
            className="w-full bg-[#1a2028] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isApproving || !isValidAddress}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white disabled:bg-[#14b8a6]/30 disabled:text-white/50 transition-colors"
        >
          {isApproving ? 'Approving...' : 'Approve Wallet'}
        </button>
      </div>
    </div>
  );
}
