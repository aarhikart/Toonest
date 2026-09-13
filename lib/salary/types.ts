export type TaxRegime = 'new' | 'old';
export type MetroType = 'metro' | 'non_metro';

export interface SalaryInputs {
  annualCTC: number;
  basicPercent: number; // e.g. 40% or 50%
  hraPercent: number; // e.g. 50% for metro, 40% for non-metro
  customAllowances?: number;
  epfOption: 'full' | 'capped' | 'none'; // full 12%, statutory cap 1800/mo, or none
  includeGratuity: boolean;
  professionalTaxAnnual: number; // default 2400 (200/mo)
  regime: TaxRegime;
  // Old regime specific deductions
  rentPaidAnnual?: number;
  isMetro?: boolean;
  deduction80C?: number; // max 150000
  deduction80D?: number; // health insurance
  homeLoanInterest24b?: number; // max 200000
  otherDeductions?: number;
}

export interface TaxCalculationResult {
  regime: TaxRegime;
  grossSalary: number;
  standardDeduction: number;
  exemptions: {
    hraExemption: number;
    chapterVIA: number; // 80C, 80D, etc.
    homeLoanInterest: number;
    totalExemptions: number;
  };
  taxableIncome: number;
  taxBeforeCess: number;
  rebate87A: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
}

export interface SalaryBreakdownResult {
  annualCTC: number;
  monthlyCTC: number;

  // Earnings
  basicSalaryAnnual: number;
  basicSalaryMonthly: number;
  hraAnnual: number;
  hraMonthly: number;
  specialAllowanceAnnual: number;
  specialAllowanceMonthly: number;
  grossSalaryAnnual: number;
  grossSalaryMonthly: number;

  // Employer Retirals (Part of CTC, not Gross)
  employerPFAnnual: number;
  employerPFMonthly: number;
  employerGratuityAnnual: number;
  employerGratuityMonthly: number;
  totalEmployerContributionsAnnual: number;
  totalEmployerContributionsMonthly: number;

  // Employee Deductions (Deducted from Gross)
  employeePFAnnual: number;
  employeePFMonthly: number;
  professionalTaxAnnual: number;
  professionalTaxMonthly: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  totalDeductionsAnnual: number;
  totalDeductionsMonthly: number;

  // In-Hand / Net Take Home
  netInHandAnnual: number;
  netInHandMonthly: number;

  // Tax Info
  taxResult: TaxCalculationResult;
  comparisonTaxResult: TaxCalculationResult; // result under the alternative regime
}

export interface HikeCalculationResult {
  currentCTC: number;
  newCTC: number;
  hikePercentage: number;
  currentMonthlyInHand: number;
  newMonthlyInHand: number;
  monthlyIncrease: number;
  annualIncrease: number;
}

export interface SalaryHistoryItem {
  id: string;
  timestamp: number;
  annualCTC: number;
  regime: TaxRegime;
  monthlyInHand: number;
  monthlyGross: number;
  monthlyTax: number;
}
