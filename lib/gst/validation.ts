/**
 * Validation utilities for GST Calculator
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAmount(amount: number): ValidationResult {
  if (isNaN(amount) || !isFinite(amount)) {
    return { isValid: false, error: 'Please enter a valid numeric amount' };
  }
  if (amount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }
  if (amount > 1_000_000_000_000) { // 1 Lakh Crore cap for overflow safety
    return { isValid: false, error: 'Amount exceeds maximum supported limit' };
  }
  return { isValid: true };
}

export function validateGSTRate(rate: number): ValidationResult {
  if (isNaN(rate) || !isFinite(rate)) {
    return { isValid: false, error: 'Please enter a valid GST rate' };
  }
  if (rate < 0) {
    return { isValid: false, error: 'GST rate cannot be negative' };
  }
  if (rate > 100) {
    return { isValid: false, error: 'GST rate cannot exceed 100%' };
  }
  return { isValid: true };
}

export function validateDiscount(discount: number): ValidationResult {
  if (isNaN(discount) || !isFinite(discount)) {
    return { isValid: false, error: 'Please enter a valid discount percentage' };
  }
  if (discount < 0) {
    return { isValid: false, error: 'Discount cannot be negative' };
  }
  if (discount > 100) {
    return { isValid: false, error: 'Discount cannot exceed 100%' };
  }
  return { isValid: true };
}

export function validateQuantity(qty: number): ValidationResult {
  if (isNaN(qty) || !isFinite(qty) || qty <= 0) {
    return { isValid: false, error: 'Quantity must be greater than 0' };
  }
  return { isValid: true };
}
