/**
 * Centralized Indian Income Tax Slabs & Rules (FY 2026-27 / AY 2027-28)
 */

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export const TAX_RULES = {
  // New Tax Regime (Section 115BAC default)
  NEW_REGIME: {
    standardDeduction: 75000, // Budget amendment ₹75,000 for salaried employees
    rebate87AThreshold: 700000, // Income up to 7 Lakh pays 0 tax under Section 87A
    maxRebate87A: 25000,
    slabs: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 0.05 },
      { min: 700000, max: 1000000, rate: 0.10 },
      { min: 1000000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: Infinity, rate: 0.30 },
    ] as TaxSlab[],
  },

  // Old Tax Regime (With Chapter VI-A deductions & HRA)
  OLD_REGIME: {
    standardDeduction: 50000,
    rebate87AThreshold: 500000, // Income up to 5 Lakh pays 0 tax
    maxRebate87A: 12500,
    cap80C: 150000,
    cap80D: 25000, // Default general limit
    capHomeLoanInterest24b: 200000,
    slabs: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 },
    ] as TaxSlab[],
  },

  cessRate: 0.04, // 4% Health & Education Cess
};
