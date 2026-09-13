import { TaxRegime, TaxCalculationResult } from '../types';
import { TAX_RULES } from './taxRules';

function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateIncomeTax(
  grossSalary: number,
  regime: TaxRegime,
  options?: {
    basicSalary?: number;
    actualHRA?: number;
    rentPaidAnnual?: number;
    isMetro?: boolean;
    deduction80C?: number;
    deduction80D?: number;
    homeLoanInterest24b?: number;
    otherDeductions?: number;
  }
): TaxCalculationResult {
  const safeGross = Math.max(0, grossSalary || 0);

  if (regime === 'new') {
    const rules = TAX_RULES.NEW_REGIME;
    const standardDeduction = rules.standardDeduction;
    const taxableIncome = Math.max(0, safeGross - standardDeduction);

    let taxBeforeCess = 0;
    for (const slab of rules.slabs) {
      if (taxableIncome > slab.min) {
        const taxableAmountInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        taxBeforeCess += taxableAmountInSlab * slab.rate;
      }
    }

    let rebate87A = 0;
    if (taxableIncome <= rules.rebate87AThreshold) {
      rebate87A = taxBeforeCess;
    } else {
      // Marginal relief under Section 87A for New Regime
      const excessIncome = taxableIncome - rules.rebate87AThreshold;
      if (taxBeforeCess > excessIncome) {
        rebate87A = taxBeforeCess - excessIncome;
      }
    }

    const netTaxBeforeCess = Math.max(0, taxBeforeCess - rebate87A);
    const cess = roundTo2(netTaxBeforeCess * TAX_RULES.cessRate);
    const totalTax = roundTo2(netTaxBeforeCess + cess);

    return {
      regime: 'new',
      grossSalary: safeGross,
      standardDeduction,
      exemptions: {
        hraExemption: 0,
        chapterVIA: 0,
        homeLoanInterest: 0,
        totalExemptions: 0,
      },
      taxableIncome: roundTo2(taxableIncome),
      taxBeforeCess: roundTo2(taxBeforeCess),
      rebate87A: roundTo2(rebate87A),
      cess,
      totalTax,
      effectiveTaxRate: safeGross > 0 ? roundTo2((totalTax / safeGross) * 100) : 0,
    };
  } else {
    // Old Regime
    const rules = TAX_RULES.OLD_REGIME;
    const standardDeduction = rules.standardDeduction;

    // 1. Calculate HRA Exemption
    let hraExemption = 0;
    const rentPaid = options?.rentPaidAnnual || 0;
    const basic = options?.basicSalary || 0;
    const actualHRA = options?.actualHRA || 0;

    if (rentPaid > 0 && basic > 0 && actualHRA > 0) {
      const tenPercentBasic = basic * 0.1;
      const excessRent = Math.max(0, rentPaid - tenPercentBasic);
      const metroFactor = options?.isMetro ? 0.5 : 0.4;
      const basicLimit = basic * metroFactor;

      hraExemption = Math.min(actualHRA, excessRent, basicLimit);
    }

    // 2. Chapter VI-A Deductions
    const deduction80C = Math.min(rules.cap80C, Math.max(0, options?.deduction80C || 0));
    const deduction80D = Math.min(rules.cap80D, Math.max(0, options?.deduction80D || 0));
    const homeLoanInterest = Math.min(
      rules.capHomeLoanInterest24b,
      Math.max(0, options?.homeLoanInterest24b || 0)
    );
    const otherDeductions = Math.max(0, options?.otherDeductions || 0);

    const chapterVIA = deduction80C + deduction80D + otherDeductions;
    const totalExemptions = roundTo2(hraExemption + chapterVIA + homeLoanInterest);

    const taxableIncome = Math.max(
      0,
      safeGross - standardDeduction - totalExemptions
    );

    let taxBeforeCess = 0;
    for (const slab of rules.slabs) {
      if (taxableIncome > slab.min) {
        const taxableAmountInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        taxBeforeCess += taxableAmountInSlab * slab.rate;
      }
    }

    let rebate87A = 0;
    if (taxableIncome <= rules.rebate87AThreshold) {
      rebate87A = taxBeforeCess;
    }

    const netTaxBeforeCess = Math.max(0, taxBeforeCess - rebate87A);
    const cess = roundTo2(netTaxBeforeCess * TAX_RULES.cessRate);
    const totalTax = roundTo2(netTaxBeforeCess + cess);

    return {
      regime: 'old',
      grossSalary: safeGross,
      standardDeduction,
      exemptions: {
        hraExemption: roundTo2(hraExemption),
        chapterVIA: roundTo2(chapterVIA),
        homeLoanInterest: roundTo2(homeLoanInterest),
        totalExemptions,
      },
      taxableIncome: roundTo2(taxableIncome),
      taxBeforeCess: roundTo2(taxBeforeCess),
      rebate87A: roundTo2(rebate87A),
      cess,
      totalTax,
      effectiveTaxRate: safeGross > 0 ? roundTo2((totalTax / safeGross) * 100) : 0,
    };
  }
}
