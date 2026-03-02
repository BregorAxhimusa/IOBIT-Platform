'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface PreferencesTabProps {
  address: string;
}

const STORAGE_KEY = 'iobit-preferences';

interface Preferences {
  theme: string;
  leverage: string;
  chartType: string;
  slippage: string;
}

const DEFAULTS: Preferences = {
  theme: 'dark',
  leverage: '1',
  chartType: 'candle',
  slippage: '0.5',
};

function loadPreferences(address: string): Preferences {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${address.toLowerCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULTS };
}

function savePreferencesLocal(address: string, prefs: Preferences) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${address.toLowerCase()}`, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

export function PreferencesTab({ address }: PreferencesTabProps) {
  const [theme, setTheme] = useState(DEFAULTS.theme);
  const [leverage, setLeverage] = useState(DEFAULTS.leverage);
  const [chartType, setChartType] = useState(DEFAULTS.chartType);
  const [slippage, setSlippage] = useState(DEFAULTS.slippage);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (!address) return;
    const prefs = loadPreferences(address);
    setTheme(prefs.theme);
    setLeverage(prefs.leverage);
    setChartType(prefs.chartType);
    setSlippage(prefs.slippage);
    setLoaded(true);
  }, [address]);

  const handleSave = useCallback(async () => {
    if (!address) return;
    setIsSaving(true);

    const prefs: Preferences = { theme, leverage, chartType, slippage };

    // Save to localStorage (always works)
    savePreferencesLocal(address, prefs);

    // Also try to sync to DB (best-effort)
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          theme,
          defaultLeverage: parseInt(leverage),
          chartType,
        }),
      });
    } catch {
      // DB sync is optional - localStorage is the primary store
    }

    toast.success('Preferences saved');
    setIsSaving(false);
  }, [address, theme, leverage, chartType, slippage]);

  if (!loaded) return null;

  const selectClass = "w-full bg-[#1a2028] border border-gray-700  px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 appearance-none cursor-pointer";

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className={selectClass}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Default Leverage</label>
        <select value={leverage} onChange={(e) => setLeverage(e.target.value)} className={selectClass}>
          {[1, 2, 3, 5, 10, 20, 50].map((v) => (
            <option key={v} value={v}>{v}x</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Chart Type</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className={selectClass}>
          <option value="candle">Candlestick</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
        </select>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Slippage Tolerance</label>
        <select value={slippage} onChange={(e) => setSlippage(e.target.value)} className={selectClass}>
          <option value="0.1">0.1%</option>
          <option value="0.5">0.5%</option>
          <option value="1.0">1.0%</option>
          <option value="2.0">2.0%</option>
          <option value="5.0">5.0%</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2.5 font-normal text-sm bg-teal-500 hover:bg-teal-500/80 text-white disabled:bg-teal-500/30 disabled:text-white/50 transition-colors mt-2"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
