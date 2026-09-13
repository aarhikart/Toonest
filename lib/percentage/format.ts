import { PrecisionMode, CurrencySymbol } from './types';

/**
 * Eliminates IEEE-754 floating-point inaccuracies like 0.30000000000000004.
 */
export function stripFloatingPointNoise(num: number): number {
  if (!Number.isFinite(num)) return num;
  return Math.round(num * 1e10) / 1e10;
}

/**
 * Formats a raw number according to the selected precision mode.
 * Automatically inserts thousands separators.
 */
export function formatNumber(
  num: number,
  precision: PrecisionMode = 'auto'
): string {
  if (!Number.isFinite(num)) {
    if (Number.isNaN(num)) return '0';
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  const cleanNum = stripFloatingPointNoise(num);

  if (precision === 'auto') {
    // If it's a clean integer, format without decimals
    if (Number.isInteger(cleanNum)) {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(cleanNum);
    }

    // For decimals, show up to 4 fraction digits without trailing zeros
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(cleanNum);
  }

  // Fixed decimal precision (0, 1, 2, 3, 4)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(cleanNum);
}

/**
 * Formats a number with a percentage sign.
 */
export function formatPercent(
  num: number,
  precision: PrecisionMode = 'auto'
): string {
  return `${formatNumber(num, precision)}%`;
}

/**
 * Formats a currency value with the chosen currency symbol.
 */
export function formatCurrency(
  amount: number,
  symbol: CurrencySymbol = '₹',
  precision: PrecisionMode = 2
): string {
  const formattedNum = formatNumber(
    amount,
    precision === 'auto' ? 2 : precision
  );

  // Common prefix currencies
  const isPrefix = ['₹', '$', '€', '£', '¥'].includes(symbol) || symbol.length === 1;
  return isPrefix ? `${symbol}${formattedNum}` : `${formattedNum} ${symbol}`;
}
