export type LoanType = 'home' | 'personal' | 'car' | 'education' | 'custom';
export type TenureType = 'years' | 'months';
export type PrepaymentType = 'lump_sum' | 'recurring_monthly';
export type PrepaymentImpact = 'reduce_tenure' | 'reduce_emi';

export interface EMICalculationResult {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  principalPercentage: number;
  interestPercentage: number;
}

export interface AmortizationMonth {
  month: number;
  yearNumber: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface AmortizationYear {
  yearNumber: number;
  openingBalance: number;
  totalEmi: number;
  totalPrincipal: number;
  totalInterest: number;
  closingBalance: number;
  months: AmortizationMonth[];
}

export interface PrepaymentResult {
  originalTotalInterest: number;
  originalTenureMonths: number;
  newTotalInterest: number;
  newTenureMonths: number;
  interestSaved: number;
  tenureSavedMonths: number;
  newEMI: number;
  impactType: PrepaymentImpact;
}

export interface LoanComparisonItem {
  name: string;
  principal: number;
  annualRate: number;
  tenureYears: number;
  processingFeePercent: number;
  monthlyEMI: number;
  totalInterest: number;
  processingFeeAmount: number;
  totalCost: number;
}

export interface EMIHistoryItem {
  id: string;
  timestamp: number;
  loanType: LoanType;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
}
