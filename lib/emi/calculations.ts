import {
  EMICalculationResult,
  AmortizationMonth,
  AmortizationYear,
  PrepaymentResult,
  PrepaymentType,
  PrepaymentImpact,
  LoanComparisonItem,
} from './types';

export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Standard reducing-balance EMI calculation
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMICalculationResult {
  const P = Math.max(0, principal || 0);
  const r = (Math.max(0, annualRate || 0) / 12) / 100;
  const n = Math.max(1, tenureMonths || 1);

  let emi = 0;
  if (r === 0) {
    emi = P / n;
  } else {
    const factor = Math.pow(1 + r, n);
    emi = (P * r * factor) / (factor - 1);
  }

  emi = roundTo2(emi);
  const totalPayment = roundTo2(emi * n);
  const totalInterest = roundTo2(totalPayment - P);

  const principalPercentage = totalPayment > 0 ? roundTo2((P / totalPayment) * 100) : 100;
  const interestPercentage = totalPayment > 0 ? roundTo2((totalInterest / totalPayment) * 100) : 0;

  return {
    principal: P,
    annualRate,
    tenureMonths: n,
    monthlyEMI: emi,
    totalInterest,
    totalPayment,
    principalPercentage,
    interestPercentage,
  };
}

/**
 * Generates month-by-month and year-by-year amortization schedules
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number
): { monthly: AmortizationMonth[]; yearly: AmortizationYear[] } {
  const P = Math.max(0, principal || 0);
  const r = (Math.max(0, annualRate || 0) / 12) / 100;
  const n = Math.max(1, tenureMonths || 1);

  const { monthlyEMI } = calculateEMI(P, annualRate, n);

  let currentBalance = P;
  const monthly: AmortizationMonth[] = [];
  const yearlyMap = new Map<number, AmortizationMonth[]>();

  for (let m = 1; m <= n; m++) {
    const yearNumber = Math.ceil(m / 12);
    const openingBalance = currentBalance;
    const interestPaid = r > 0 ? roundTo2(openingBalance * r) : 0;

    let principalPaid = roundTo2(monthlyEMI - interestPaid);
    let emi = monthlyEMI;

    // Handle final month adjustment
    if (m === n || principalPaid >= openingBalance) {
      principalPaid = openingBalance;
      emi = roundTo2(principalPaid + interestPaid);
      currentBalance = 0;
    } else {
      currentBalance = roundTo2(openingBalance - principalPaid);
    }

    const monthData: AmortizationMonth = {
      month: m,
      yearNumber,
      openingBalance,
      emi,
      principalPaid,
      interestPaid,
      closingBalance: currentBalance,
    };

    monthly.push(monthData);

    const yearList = yearlyMap.get(yearNumber) || [];
    yearList.push(monthData);
    yearlyMap.set(yearNumber, yearList);

    if (currentBalance <= 0) break;
  }

  const yearly: AmortizationYear[] = Array.from(yearlyMap.entries()).map(
    ([yearNumber, months]) => {
      const openingBalance = months[0].openingBalance;
      const closingBalance = months[months.length - 1].closingBalance;
      const totalEmi = roundTo2(months.reduce((acc, curr) => acc + curr.emi, 0));
      const totalPrincipal = roundTo2(
        months.reduce((acc, curr) => acc + curr.principalPaid, 0)
      );
      const totalInterest = roundTo2(
        months.reduce((acc, curr) => acc + curr.interestPaid, 0)
      );

      return {
        yearNumber,
        openingBalance,
        totalEmi,
        totalPrincipal,
        totalInterest,
        closingBalance,
        months,
      };
    }
  );

  return { monthly, yearly };
}

/**
 * Calculates the impact of loan prepayments (lump sum or monthly recurring)
 */
export function calculatePrepayment(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  prepaymentType: PrepaymentType,
  prepaymentAmount: number,
  startMonth: number = 12,
  impactType: PrepaymentImpact = 'reduce_tenure'
): PrepaymentResult {
  const original = calculateEMI(principal, annualRate, tenureMonths);
  const r = (annualRate / 12) / 100;
  const originalEMI = original.monthlyEMI;

  let currentBalance = principal;
  let totalInterestPaid = 0;
  let monthsCount = 0;
  let newMonthlyEMI = originalEMI;

  if (prepaymentType === 'lump_sum') {
    // Run up to startMonth with standard amortization
    for (let m = 1; m <= tenureMonths; m++) {
      if (currentBalance <= 0) break;

      const interest = r > 0 ? roundTo2(currentBalance * r) : 0;
      let principalPaid = roundTo2(newMonthlyEMI - interest);

      if (m === startMonth) {
        // Apply lump sum prepayment
        const extra = Math.min(currentBalance, prepaymentAmount);
        currentBalance = roundTo2(Math.max(0, currentBalance - extra));

        if (impactType === 'reduce_emi' && currentBalance > 0) {
          const remainingMonths = tenureMonths - m;
          if (remainingMonths > 0) {
            const factor = Math.pow(1 + r, remainingMonths);
            newMonthlyEMI = roundTo2((currentBalance * r * factor) / (factor - 1));
          }
        }
      }

      if (principalPaid >= currentBalance) {
        principalPaid = currentBalance;
        currentBalance = 0;
      } else {
        currentBalance = roundTo2(currentBalance - principalPaid);
      }

      totalInterestPaid = roundTo2(totalInterestPaid + interest);
      monthsCount = m;

      if (currentBalance <= 0) break;
    }
  } else {
    // Recurring extra monthly payment added to each EMI starting from startMonth
    for (let m = 1; m <= tenureMonths; m++) {
      if (currentBalance <= 0) break;

      const interest = r > 0 ? roundTo2(currentBalance * r) : 0;
      const extraPayment = m >= startMonth ? prepaymentAmount : 0;
      const totalPayment = originalEMI + extraPayment;
      let principalPaid = roundTo2(totalPayment - interest);

      if (principalPaid >= currentBalance) {
        principalPaid = currentBalance;
        currentBalance = 0;
      } else {
        currentBalance = roundTo2(currentBalance - principalPaid);
      }

      totalInterestPaid = roundTo2(totalInterestPaid + interest);
      monthsCount = m;

      if (currentBalance <= 0) break;
    }
  }

  const interestSaved = roundTo2(Math.max(0, original.totalInterest - totalInterestPaid));
  const tenureSavedMonths = Math.max(0, tenureMonths - monthsCount);

  return {
    originalTotalInterest: original.totalInterest,
    originalTenureMonths: tenureMonths,
    newTotalInterest: totalInterestPaid,
    newTenureMonths: monthsCount,
    interestSaved,
    tenureSavedMonths,
    newEMI: impactType === 'reduce_emi' ? newMonthlyEMI : originalEMI,
    impactType,
  };
}

/**
 * Compare two loan offers (Loan A vs Loan B)
 */
export function compareLoans(
  loanA: { principal: number; annualRate: number; tenureYears: number; processingFeePercent: number },
  loanB: { principal: number; annualRate: number; tenureYears: number; processingFeePercent: number }
): {
  optionA: LoanComparisonItem;
  optionB: LoanComparisonItem;
  emiDifference: number;
  totalCostDifference: number;
  cheaperOption: 'A' | 'B' | 'Equal';
} {
  const calcA = calculateEMI(loanA.principal, loanA.annualRate, loanA.tenureYears * 12);
  const feeA = roundTo2((loanA.principal * loanA.processingFeePercent) / 100);
  const totalCostA = roundTo2(calcA.totalPayment + feeA);

  const calcB = calculateEMI(loanB.principal, loanB.annualRate, loanB.tenureYears * 12);
  const feeB = roundTo2((loanB.principal * loanB.processingFeePercent) / 100);
  const totalCostB = roundTo2(calcB.totalPayment + feeB);

  const optionA: LoanComparisonItem = {
    name: 'Loan Option A',
    principal: loanA.principal,
    annualRate: loanA.annualRate,
    tenureYears: loanA.tenureYears,
    processingFeePercent: loanA.processingFeePercent,
    monthlyEMI: calcA.monthlyEMI,
    totalInterest: calcA.totalInterest,
    processingFeeAmount: feeA,
    totalCost: totalCostA,
  };

  const optionB: LoanComparisonItem = {
    name: 'Loan Option B',
    principal: loanB.principal,
    annualRate: loanB.annualRate,
    tenureYears: loanB.tenureYears,
    processingFeePercent: loanB.processingFeePercent,
    monthlyEMI: calcB.monthlyEMI,
    totalInterest: calcB.totalInterest,
    processingFeeAmount: feeB,
    totalCost: totalCostB,
  };

  const emiDifference = roundTo2(Math.abs(calcA.monthlyEMI - calcB.monthlyEMI));
  const totalCostDifference = roundTo2(Math.abs(totalCostA - totalCostB));
  const cheaperOption = totalCostA < totalCostB ? 'A' : totalCostB < totalCostA ? 'B' : 'Equal';

  return {
    optionA,
    optionB,
    emiDifference,
    totalCostDifference,
    cheaperOption,
  };
}
