/**
 * Validation functions for Indian Salary Calculator
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSalaryInputs(
  annualCTC: number,
  basicPercent: number,
  hraPercent: number
): ValidationResult {
  if (isNaN(annualCTC) || !isFinite(annualCTC) || annualCTC <= 0) {
    return { isValid: false, error: 'Please enter a valid CTC amount' };
  }
  if (annualCTC > 1_000_000_000) {
    return { isValid: false, error: 'Annual CTC exceeds maximum limit' };
  }
  if (isNaN(basicPercent) || basicPercent < 10 || basicPercent > 90) {
    return { isValid: false, error: 'Basic salary percentage must be between 10% and 90%' };
  }
  if (isNaN(hraPercent) || hraPercent < 0 || hraPercent > 100) {
    return { isValid: false, error: 'HRA percentage must be between 0% and 100%' };
  }
  return { isValid: true };
}
