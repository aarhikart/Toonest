import {
  SalaryInputs,
  SalaryBreakdownResult,
  HikeCalculationResult,
  TaxRegime,
} from './types';
import { calculateIncomeTax } from './tax/taxCalculator';

export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates complete Indian salary breakdown from CTC to in-hand take home pay
 */
export function calculateSalaryBreakdown(inputs: SalaryInputs): SalaryBreakdownResult {
  const ctc = Math.max(0, inputs.annualCTC || 0);
  const basicPct = Math.min(90, Math.max(10, inputs.basicPercent || 50));
  const hraPct = Math.min(100, Math.max(0, inputs.hraPercent || 50));

  // 1. Basic Salary
  const basicSalaryAnnual = roundTo2((ctc * basicPct) / 100);
  const basicSalaryMonthly = roundTo2(basicSalaryAnnual / 12);

  // 2. HRA (Percentage of Basic)
  const hraAnnual = roundTo2((basicSalaryAnnual * hraPct) / 100);
  const hraMonthly = roundTo2(hraAnnual / 12);

  // 3. Employer Retirals (Part of CTC, not Gross Salary)
  let employerPFAnnual = 0;
  if (inputs.epfOption === 'full') {
    employerPFAnnual = roundTo2(basicSalaryAnnual * 0.12);
  } else if (inputs.epfOption === 'capped') {
    employerPFAnnual = Math.min(roundTo2(basicSalaryAnnual * 0.12), 21600); // ₹1,800/mo statutory cap
  }

  const employerGratuityAnnual = inputs.includeGratuity
    ? roundTo2((basicSalaryAnnual * 15) / (26 * 12)) // Statutory 15/26/12 formula ~4.81%
    : 0;

  const employerPFMonthly = roundTo2(employerPFAnnual / 12);
  const employerGratuityMonthly = roundTo2(employerGratuityAnnual / 12);

  const totalEmployerContributionsAnnual = roundTo2(
    employerPFAnnual + employerGratuityAnnual
  );
  const totalEmployerContributionsMonthly = roundTo2(
    totalEmployerContributionsAnnual / 12
  );

  // 4. Special / Other Allowance (Balancing figure in CTC)
  const specialAllowanceAnnual = Math.max(
    0,
    roundTo2(ctc - basicSalaryAnnual - hraAnnual - totalEmployerContributionsAnnual)
  );
  const specialAllowanceMonthly = roundTo2(specialAllowanceAnnual / 12);

  // 5. Gross Salary (Total earnings before employee deductions)
  const grossSalaryAnnual = roundTo2(
    basicSalaryAnnual + hraAnnual + specialAllowanceAnnual
  );
  const grossSalaryMonthly = roundTo2(grossSalaryAnnual / 12);

  // 6. Employee Deductions
  const employeePFAnnual = employerPFAnnual;
  const employeePFMonthly = roundTo2(employeePFAnnual / 12);

  const professionalTaxAnnual = Math.max(0, inputs.professionalTaxAnnual ?? 2400);
  const professionalTaxMonthly = roundTo2(professionalTaxAnnual / 12);

  // 7. Income Tax Calculation
  const taxOptions = {
    basicSalary: basicSalaryAnnual,
    actualHRA: hraAnnual,
    rentPaidAnnual: inputs.rentPaidAnnual,
    isMetro: inputs.isMetro ?? (hraPct >= 50),
    deduction80C: (inputs.deduction80C ?? 0) + employeePFAnnual, // EPF qualifies under 80C
    deduction80D: inputs.deduction80D,
    homeLoanInterest24b: inputs.homeLoanInterest24b,
    otherDeductions: inputs.otherDeductions,
  };

  const taxResult = calculateIncomeTax(grossSalaryAnnual, inputs.regime, taxOptions);

  // Alternative regime comparison
  const alternativeRegime: TaxRegime = inputs.regime === 'new' ? 'old' : 'new';
  const comparisonTaxResult = calculateIncomeTax(
    grossSalaryAnnual,
    alternativeRegime,
    taxOptions
  );

  const incomeTaxAnnual = taxResult.totalTax;
  const incomeTaxMonthly = roundTo2(incomeTaxAnnual / 12);

  const totalDeductionsAnnual = roundTo2(
    employeePFAnnual + professionalTaxAnnual + incomeTaxAnnual
  );
  const totalDeductionsMonthly = roundTo2(totalDeductionsAnnual / 12);

  // 8. Net In-Hand / Take-Home Pay
  const netInHandAnnual = roundTo2(grossSalaryAnnual - totalDeductionsAnnual);
  const netInHandMonthly = roundTo2(netInHandAnnual / 12);

  return {
    annualCTC: ctc,
    monthlyCTC: roundTo2(ctc / 12),
    basicSalaryAnnual,
    basicSalaryMonthly,
    hraAnnual,
    hraMonthly,
    specialAllowanceAnnual,
    specialAllowanceMonthly,
    grossSalaryAnnual,
    grossSalaryMonthly,
    employerPFAnnual,
    employerPFMonthly,
    employerGratuityAnnual,
    employerGratuityMonthly,
    totalEmployerContributionsAnnual,
    totalEmployerContributionsMonthly,
    employeePFAnnual,
    employeePFMonthly,
    professionalTaxAnnual,
    professionalTaxMonthly,
    incomeTaxAnnual,
    incomeTaxMonthly,
    totalDeductionsAnnual,
    totalDeductionsMonthly,
    netInHandAnnual,
    netInHandMonthly,
    taxResult,
    comparisonTaxResult,
  };
}

/**
 * Calculates salary hike impact on in-hand monthly pay
 */
export function calculateSalaryHike(
  currentCTC: number,
  hikeInput: { type: 'percentage' | 'new_ctc'; value: number },
  regime: TaxRegime = 'new'
): HikeCalculationResult {
  const cCTC = Math.max(0, currentCTC);
  let nCTC = 0;
  let hikePercentage = 0;

  if (hikeInput.type === 'percentage') {
    hikePercentage = Math.max(0, hikeInput.value);
    nCTC = roundTo2(cCTC * (1 + hikePercentage / 100));
  } else {
    nCTC = Math.max(0, hikeInput.value);
    hikePercentage = cCTC > 0 ? roundTo2(((nCTC - cCTC) / cCTC) * 100) : 0;
  }

  const currentBreakdown = calculateSalaryBreakdown({
    annualCTC: cCTC,
    basicPercent: 50,
    hraPercent: 50,
    epfOption: 'capped',
    includeGratuity: true,
    professionalTaxAnnual: 2400,
    regime,
  });

  const newBreakdown = calculateSalaryBreakdown({
    annualCTC: nCTC,
    basicPercent: 50,
    hraPercent: 50,
    epfOption: 'capped',
    includeGratuity: true,
    professionalTaxAnnual: 2400,
    regime,
  });

  const monthlyIncrease = roundTo2(
    newBreakdown.netInHandMonthly - currentBreakdown.netInHandMonthly
  );
  const annualIncrease = roundTo2(
    newBreakdown.netInHandAnnual - currentBreakdown.netInHandAnnual
  );

  return {
    currentCTC: cCTC,
    newCTC: nCTC,
    hikePercentage,
    currentMonthlyInHand: currentBreakdown.netInHandMonthly,
    newMonthlyInHand: newBreakdown.netInHandMonthly,
    monthlyIncrease,
    annualIncrease,
  };
}
