/**
 * IOBIT Platform Color Palette
 * Use these constants throughout the platform for consistent styling
 */

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0a0a0c',      // Main page background
    secondary: '#111113',    // Cards, panels
    tertiary: '#1a1a1f',     // Input fields, hover states
    hover: '#252528',        // Hover state for tertiary
  },

  // Accent colors
  accent: {
    green: '#16DE93',        // Primary accent, positive values, CTAs
    red: '#F6465D',          // Negative values, errors, warnings
    orange: '#F7931A',       // Bitcoin, leverage badges
    blue: '#627EEA',         // Ethereum, spot badges
    purple: '#9945FF',       // Solana
  },

  // Text colors
  text: {
    primary: '#ffffff',      // Main text
    secondary: '#a0a0a5',    // Secondary text
    muted: '#6b6b6b',        // Muted text, placeholders
    disabled: '#3a3a3f',     // Disabled states
  },

  // Border colors
  border: {
    primary: '#1a1a1f',      // Main borders
    secondary: '#252528',    // Secondary borders
    focus: 'rgba(22, 222, 147, 0.5)',  // Focus state borders
  },
} as const;

// Tailwind class mappings for easy use
export const colorClasses = {
  // Backgrounds
  bgPrimary: 'bg-[#0a0a0c]',
  bgSecondary: 'bg-[#111113]',
  bgTertiary: 'bg-[#1a1a1f]',
  bgHover: 'hover:bg-[#252528]',

  // Text
  textPrimary: 'text-white',
  textSecondary: 'text-[#a0a0a5]',
  textMuted: 'text-[#6b6b6b]',

  // Accent
  accentGreen: 'text-[#16DE93]',
  accentRed: 'text-[#F6465D]',
  bgGreen: 'bg-[#16DE93]',
  bgRed: 'bg-[#F6465D]',
  bgGreenMuted: 'bg-[#16DE93]/10',
  bgRedMuted: 'bg-[#F6465D]/10',

  // Borders
  borderPrimary: 'border-[#1a1a1f]',
  borderSecondary: 'border-[#252528]',
} as const;

// Type for color values
export type ColorKey = keyof typeof colors;
export type AccentColor = keyof typeof colors.accent;
