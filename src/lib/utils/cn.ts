import { clsx, type ClassValue } from 'clsx';

/**
 * Utility for merging Tailwind CSS classes
 * Example: cn('px-2 py-1', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
