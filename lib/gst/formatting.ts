/**
 * Indian Rupee and financial formatting utilities for GST Calculator
 */

export function formatCurrency(amount: number, decimals: number = 2): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatNumber(amount: number, decimals: number = 2): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function parseIndianNumber(str: string): number {
  if (!str) return 0;
  // Remove currency symbols, commas, and whitespace
  const cleaned = str.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converts a number to Indian Rupee Words format (e.g., "One Lakh Twenty Thousand Rupees Only")
 */
export function numberToWordsINR(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';
  if (num < 0) return `Minus ${numberToWordsINR(-num)}`;

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundreds = remainder;

  if (crore > 0) {
    result += convertHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertHundreds(thousand) + ' Thousand ';
  }
  if (hundreds > 0) {
    result += convertHundreds(hundreds) + ' ';
  }

  result = result.trim() + ' Rupees';

  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + ' Paise';
  }

  return result + ' Only';
}
