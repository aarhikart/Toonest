export type CalculatorTab =
  | 'percentage'
  | 'increase'
  | 'decrease'
  | 'change'
  | 'discount'
  | 'tax'
  | 'tip'
  | 'profit_loss'
  | 'difference'
  | 'custom';

export type PrecisionMode = 'auto' | 0 | 1 | 2 | 3 | 4;

export type CurrencySymbol = '₹' | '$' | '€' | '£' | '¥' | string;

export type TaxMode = 'add_tax' | 'reverse_tax';

export type CustomOperation =
  | 'add_percent'
  | 'subtract_percent'
  | 'percent_of'
  | 'increase_by'
  | 'decrease_by';

export interface CalculationResult {
  primaryValue: string;
  primaryLabel: string;
  summaryText: string;
  formula: string;
  formulaExample: string;
  secondaryValues?: {
    label: string;
    value: string;
    badge?: string;
    colorClass?: string;
  }[];
  isError?: boolean;
  errorMessage?: string;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  tab: CalculatorTab;
  title: string;
  result: string;
  formula: string;
  inputs: Record<string, any>;
}
