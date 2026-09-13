/**
 * Validation utilities for Loan & EMI Calculator
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateLoanInputs(
  principal: number,
  annualRate: number,
  tenureMonths: number
): ValidationResult {
  if (isNaN(principal) || !isFinite(principal) || principal <= 0) {
    return { isValid: false, error: 'Please enter a valid loan principal amount' };
  }
  if (principal > 1_000_000_000) {
    return { isValid: false, error: 'Loan principal cannot exceed ₹100 Crore' };
  }
  if (isNaN(annualRate) || !isFinite(annualRate) || annualRate <= 0) {
    return { isValid: false, error: 'Interest rate must be greater than 0%' };
  }
  if (annualRate > 50) {
    return { isValid: false, error: 'Interest rate cannot exceed 50%' };
  }
  if (isNaN(tenureMonths) || !isFinite(tenureMonths) || tenureMonths < 1) {
    return { isValid: false, error: 'Tenure must be at least 1 month' };
  }
  if (tenureMonths > 480) {
    return { isValid: false, error: 'Maximum loan tenure is 40 years (480 months)' };
  }
  return { isValid: true };
}
