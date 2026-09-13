import {
  PrecisionMode,
  CurrencySymbol,
  TaxMode,
  CustomOperation,
  CalculationResult,
} from './types';
import { formatNumber, formatPercent, formatCurrency } from './format';

/**
 * 1. What is X% of Y?
 */
export function calculatePercentageOf(
  percent: number,
  total: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  const result = (percent / 100) * total;
  const formattedResult = formatNumber(result, precision);
  const formattedPercent = formatNumber(percent, precision);
  const formattedTotal = formatNumber(total, precision);

  return {
    primaryValue: formattedResult,
    primaryLabel: 'Result',
    summaryText: `${formattedPercent}% of ${formattedTotal} is ${formattedResult}`,
    formula: 'Result = (Percentage ÷ 100) × Number',
    formulaExample: `(${formattedPercent} ÷ 100) × ${formattedTotal} = ${formattedResult}`,
  };
}

/**
 * 2. X is what percentage of Y?
 */
export function calculatePercentageFromValues(
  part: number,
  whole: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  if (whole === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Result',
      summaryText: 'Cannot calculate percentage when the denominator (Y) is zero.',
      formula: 'Percentage = (X ÷ Y) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'The second value (Y) cannot be zero for this calculation.',
    };
  }

  const result = (part / 100) * (whole ? (part / whole) * 100 : 0);
  const percentVal = (part / whole) * 100;
  const formattedPercent = formatPercent(percentVal, precision);
  const formattedPart = formatNumber(part, precision);
  const formattedWhole = formatNumber(whole, precision);

  return {
    primaryValue: formattedPercent,
    primaryLabel: 'Percentage',
    summaryText: `${formattedPart} is ${formattedPercent} of ${formattedWhole}`,
    formula: 'Percentage = (Part ÷ Whole) × 100',
    formulaExample: `(${formattedPart} ÷ ${formattedWhole}) × 100 = ${formattedPercent}`,
  };
}

/**
 * 3. Percentage Increase
 */
export function calculatePercentageIncrease(
  original: number,
  newValue: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  if (original === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Increase',
      summaryText: 'Cannot calculate percentage increase from an original value of zero.',
      formula: 'Increase % = ((New - Original) ÷ Original) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'Original value cannot be zero.',
    };
  }

  const diff = newValue - original;
  const percentIncrease = (diff / original) * 100;
  const formattedIncrease = formatPercent(percentIncrease, precision);
  const formattedDiff = formatNumber(diff, precision);
  const formattedOrig = formatNumber(original, precision);
  const formattedNew = formatNumber(newValue, precision);

  return {
    primaryValue: `${formattedIncrease}`,
    primaryLabel: 'Percentage Increase',
    summaryText: `An increase from ${formattedOrig} to ${formattedNew} is ${formattedIncrease}`,
    formula: 'Increase % = ((New Value - Original Value) ÷ Original Value) × 100',
    formulaExample: `((${formattedNew} - ${formattedOrig}) ÷ ${formattedOrig}) × 100 = ${formattedIncrease}`,
    secondaryValues: [
      {
        label: 'Increase Amount',
        value: formattedDiff,
        badge: diff >= 0 ? '+ Increase' : '- Decrease',
      },
      {
        label: 'Original Value',
        value: formattedOrig,
      },
      {
        label: 'New Value',
        value: formattedNew,
      },
    ],
  };
}

/**
 * 4. Percentage Decrease
 */
export function calculatePercentageDecrease(
  original: number,
  newValue: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  if (original === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Decrease',
      summaryText: 'Cannot calculate percentage decrease from an original value of zero.',
      formula: 'Decrease % = ((Original - New) ÷ Original) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'Original value cannot be zero.',
    };
  }

  const diff = original - newValue;
  const percentDecrease = (diff / original) * 100;
  const formattedDecrease = formatPercent(percentDecrease, precision);
  const formattedDiff = formatNumber(diff, precision);
  const formattedOrig = formatNumber(original, precision);
  const formattedNew = formatNumber(newValue, precision);

  return {
    primaryValue: `${formattedDecrease}`,
    primaryLabel: 'Percentage Decrease',
    summaryText: `A decrease from ${formattedOrig} to ${formattedNew} is ${formattedDecrease}`,
    formula: 'Decrease % = ((Original Value - New Value) ÷ Original Value) × 100',
    formulaExample: `((${formattedOrig} - ${formattedNew}) ÷ ${formattedOrig}) × 100 = ${formattedDecrease}`,
    secondaryValues: [
      {
        label: 'Decrease Amount',
        value: formattedDiff,
      },
      {
        label: 'Original Value',
        value: formattedOrig,
      },
      {
        label: 'New Value',
        value: formattedNew,
      },
    ],
  };
}

/**
 * 5. Percentage Change
 */
export function calculatePercentageChange(
  original: number,
  newValue: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  if (original === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Change',
      summaryText: 'Cannot calculate percentage change when the original value is zero.',
      formula: 'Change % = ((New - Original) ÷ Original) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'Original value cannot be zero.',
    };
  }

  const diff = newValue - original;
  const percentChange = (diff / original) * 100;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;
  const direction = isIncrease ? 'Increase' : isDecrease ? 'Decrease' : 'No Change';

  const formattedPercent = formatPercent(Math.abs(percentChange), precision);
  const formattedDiff = formatNumber(Math.abs(diff), precision);
  const formattedOrig = formatNumber(original, precision);
  const formattedNew = formatNumber(newValue, precision);

  return {
    primaryValue: `${isIncrease ? '+' : isDecrease ? '-' : ''}${formattedPercent}`,
    primaryLabel: 'Percentage Change',
    summaryText: `${formattedOrig} changed to ${formattedNew} is a ${formattedPercent} ${direction.toLowerCase()}`,
    formula: 'Change % = ((New Value - Original Value) ÷ Original Value) × 100',
    formulaExample: `((${formattedNew} - ${formattedOrig}) ÷ ${formattedOrig}) × 100 = ${isIncrease ? '+' : isDecrease ? '-' : ''}${formattedPercent}`,
    secondaryValues: [
      {
        label: 'Direction',
        value: direction,
        badge: direction,
        colorClass: isIncrease
          ? 'text-emerald-600 dark:text-emerald-400'
          : isDecrease
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-600',
      },
      {
        label: 'Absolute Change',
        value: formattedDiff,
      },
      {
        label: 'Original Value',
        value: formattedOrig,
      },
    ],
  };
}

/**
 * 6. Discount Calculator
 */
export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  currency: CurrencySymbol = '₹',
  precision: PrecisionMode = 2
): CalculationResult {
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;

  const formattedFinal = formatCurrency(finalPrice, currency, precision);
  const formattedDiscount = formatCurrency(discountAmount, currency, precision);
  const formattedOrig = formatCurrency(originalPrice, currency, precision);
  const formattedPercent = formatNumber(discountPercent, 'auto');

  return {
    primaryValue: formattedFinal,
    primaryLabel: 'Final Price',
    summaryText: `A ${formattedPercent}% discount on ${formattedOrig} saves ${formattedDiscount}, making the final price ${formattedFinal}`,
    formula: 'Final Price = Original Price - (Original Price × (Discount % ÷ 100))',
    formulaExample: `${formattedOrig} - (${formattedOrig} × ${formattedPercent}%) = ${formattedFinal}`,
    secondaryValues: [
      {
        label: 'Amount Saved',
        value: formattedDiscount,
        badge: 'Savings',
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Original Price',
        value: formattedOrig,
      },
      {
        label: 'Discount Rate',
        value: `${formattedPercent}%`,
      },
    ],
  };
}

/**
 * 7. Tax Calculator
 */
export function calculateTax(
  price: number,
  taxPercent: number,
  mode: TaxMode = 'add_tax',
  currency: CurrencySymbol = '₹',
  precision: PrecisionMode = 2
): CalculationResult {
  const formattedPercent = formatNumber(taxPercent, 'auto');

  if (mode === 'add_tax') {
    const taxAmount = price * (taxPercent / 100);
    const finalPrice = price + taxAmount;

    const formattedFinal = formatCurrency(finalPrice, currency, precision);
    const formattedTax = formatCurrency(taxAmount, currency, precision);
    const formattedOrig = formatCurrency(price, currency, precision);

    return {
      primaryValue: formattedFinal,
      primaryLabel: 'Final Price (Inc. Tax)',
      summaryText: `${formattedOrig} plus ${formattedPercent}% tax (${formattedTax}) equals ${formattedFinal}`,
      formula: 'Final Price = Base Price + (Base Price × (Tax % ÷ 100))',
      formulaExample: `${formattedOrig} + (${formattedOrig} × ${formattedPercent}%) = ${formattedFinal}`,
      secondaryValues: [
        {
          label: 'Tax Amount',
          value: formattedTax,
        },
        {
          label: 'Price Before Tax',
          value: formattedOrig,
        },
        {
          label: 'Tax Rate',
          value: `${formattedPercent}%`,
        },
      ],
    };
  } else {
    // Reverse Tax: Extracting pre-tax price from tax-inclusive price
    const preTaxPrice = price / (1 + taxPercent / 100);
    const taxAmount = price - preTaxPrice;

    const formattedPreTax = formatCurrency(preTaxPrice, currency, precision);
    const formattedTax = formatCurrency(taxAmount, currency, precision);
    const formattedTotal = formatCurrency(price, currency, precision);

    return {
      primaryValue: formattedPreTax,
      primaryLabel: 'Pre-Tax Price',
      summaryText: `From a total of ${formattedTotal} with ${formattedPercent}% tax, the pre-tax price is ${formattedPreTax} and tax is ${formattedTax}`,
      formula: 'Pre-Tax Price = Final Price ÷ (1 + (Tax % ÷ 100))',
      formulaExample: `${formattedTotal} ÷ (1 + ${formattedPercent} ÷ 100) = ${formattedPreTax}`,
      secondaryValues: [
        {
          label: 'Tax Included',
          value: formattedTax,
        },
        {
          label: 'Total Paid',
          value: formattedTotal,
        },
        {
          label: 'Tax Rate',
          value: `${formattedPercent}%`,
        },
      ],
    };
  }
}

/**
 * 8. Tip Calculator
 */
export function calculateTip(
  billAmount: number,
  tipPercent: number,
  numPeople: number = 1,
  currency: CurrencySymbol = '₹',
  precision: PrecisionMode = 2
): CalculationResult {
  const people = Math.max(1, Math.floor(numPeople) || 1);
  const tipAmount = billAmount * (tipPercent / 100);
  const totalBill = billAmount + tipAmount;
  const perPersonTotal = totalBill / people;
  const perPersonTip = tipAmount / people;

  const formattedTip = formatCurrency(tipAmount, currency, precision);
  const formattedTotal = formatCurrency(totalBill, currency, precision);
  const formattedPerPerson = formatCurrency(perPersonTotal, currency, precision);
  const formattedPerPersonTip = formatCurrency(perPersonTip, currency, precision);
  const formattedBill = formatCurrency(billAmount, currency, precision);
  const formattedPercent = formatNumber(tipPercent, 'auto');

  return {
    primaryValue: formattedTotal,
    primaryLabel: 'Total Bill with Tip',
    summaryText: `A ${formattedPercent}% tip on ${formattedBill} is ${formattedTip}, bringing the total to ${formattedTotal}${
      people > 1 ? ` (${formattedPerPerson} each for ${people} people)` : ''
    }`,
    formula: 'Total Bill = Bill Amount + (Bill Amount × (Tip % ÷ 100))',
    formulaExample: `${formattedBill} + (${formattedBill} × ${formattedPercent}%) = ${formattedTotal}`,
    secondaryValues: [
      {
        label: 'Total Tip',
        value: formattedTip,
      },
      ...(people > 1
        ? [
            {
              label: 'Total Per Person',
              value: formattedPerPerson,
              badge: `${people} People`,
            },
            {
              label: 'Tip Per Person',
              value: formattedPerPersonTip,
            },
          ]
        : []),
      {
        label: 'Subtotal Bill',
        value: formattedBill,
      },
    ],
  };
}

/**
 * 9. Profit & Loss Calculator
 */
export function calculateProfitLoss(
  costPrice: number,
  sellingPrice: number,
  currency: CurrencySymbol = '₹',
  precision: PrecisionMode = 'auto'
): CalculationResult {
  if (costPrice === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Profit / Loss',
      summaryText: 'Cost price cannot be zero when calculating profit or loss percentage.',
      formula: 'Profit/Loss % = ((Selling Price - Cost Price) ÷ Cost Price) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'Cost price cannot be zero.',
    };
  }

  const diff = sellingPrice - costPrice;
  const isProfit = diff > 0;
  const isLoss = diff < 0;
  const percentage = (Math.abs(diff) / costPrice) * 100;

  const formattedAmount = formatCurrency(Math.abs(diff), currency, 2);
  const formattedPercent = formatPercent(percentage, precision);
  const formattedCP = formatCurrency(costPrice, currency, 2);
  const formattedSP = formatCurrency(sellingPrice, currency, 2);

  const statusLabel = isProfit ? 'Profit' : isLoss ? 'Loss' : 'Break-Even';

  return {
    primaryValue: `${statusLabel}: ${formattedAmount} (${formattedPercent})`,
    primaryLabel: statusLabel,
    summaryText: isProfit
      ? `You made a profit of ${formattedAmount} (${formattedPercent}) selling at ${formattedSP} with a cost of ${formattedCP}.`
      : isLoss
      ? `You incurred a loss of ${formattedAmount} (${formattedPercent}) selling at ${formattedSP} with a cost of ${formattedCP}.`
      : `Break-even: Selling price equals cost price (${formattedSP}).`,
    formula: isProfit
      ? 'Profit % = ((Selling Price - Cost Price) ÷ Cost Price) × 100'
      : isLoss
      ? 'Loss % = ((Cost Price - Selling Price) ÷ Cost Price) × 100'
      : 'Selling Price = Cost Price',
    formulaExample: isProfit
      ? `((${formattedSP} - ${formattedCP}) ÷ ${formattedCP}) × 100 = ${formattedPercent}`
      : isLoss
      ? `((${formattedCP} - ${formattedSP}) ÷ ${formattedCP}) × 100 = ${formattedPercent}`
      : `${formattedSP} - ${formattedCP} = 0`,
    secondaryValues: [
      {
        label: 'Outcome',
        value: statusLabel,
        badge: statusLabel,
        colorClass: isProfit
          ? 'text-emerald-600 dark:text-emerald-400'
          : isLoss
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-600',
      },
      {
        label: `${statusLabel} Amount`,
        value: formattedAmount,
      },
      {
        label: `${statusLabel} Percentage`,
        value: formattedPercent,
      },
    ],
  };
}

/**
 * 10. Percentage Difference
 */
export function calculatePercentageDifference(
  valA: number,
  valB: number,
  precision: PrecisionMode = 'auto'
): CalculationResult {
  const average = (valA + valB) / 2;

  if (average === 0) {
    return {
      primaryValue: 'Error',
      primaryLabel: 'Percentage Difference',
      summaryText: 'The average of the two values cannot be zero.',
      formula: 'Difference % = (|A - B| ÷ ((A + B) ÷ 2)) × 100',
      formulaExample: 'Division by zero is undefined',
      isError: true,
      errorMessage: 'The average of Value A and Value B cannot be zero.',
    };
  }

  const absDiff = Math.abs(valA - valB);
  const diffPercent = (absDiff / Math.abs(average)) * 100;

  const formattedPercent = formatPercent(diffPercent, precision);
  const formattedAbsDiff = formatNumber(absDiff, precision);
  const formattedA = formatNumber(valA, precision);
  const formattedB = formatNumber(valB, precision);
  const formattedAvg = formatNumber(average, precision);

  return {
    primaryValue: formattedPercent,
    primaryLabel: 'Percentage Difference',
    summaryText: `The percentage difference between ${formattedA} and ${formattedB} is ${formattedPercent}`,
    formula: 'Difference % = (|Value A - Value B| ÷ ((Value A + Value B) ÷ 2)) × 100',
    formulaExample: `(|${formattedA} - ${formattedB}| ÷ ((${formattedA} + ${formattedB}) ÷ 2)) × 100 = ${formattedPercent}`,
    secondaryValues: [
      {
        label: 'Absolute Difference',
        value: formattedAbsDiff,
      },
      {
        label: 'Average Value',
        value: formattedAvg,
      },
    ],
  };
}

/**
 * 11. Custom Percentage Calculator
 */
export function calculateCustomOperation(
  base: number,
  percent: number,
  op: CustomOperation = 'add_percent',
  precision: PrecisionMode = 'auto'
): CalculationResult {
  let result: number;
  let formula = '';
  let formulaExample = '';
  let opName = '';

  const formattedBase = formatNumber(base, precision);
  const formattedPercent = formatNumber(percent, precision);

  switch (op) {
    case 'add_percent':
      result = base + base * (percent / 100);
      opName = 'Add Percentage';
      formula = 'Result = Base + (Base × (Percentage ÷ 100))';
      formulaExample = `${formattedBase} + (${formattedBase} × ${formattedPercent}%) = ${formatNumber(result, precision)}`;
      break;
    case 'subtract_percent':
      result = base - base * (percent / 100);
      opName = 'Subtract Percentage';
      formula = 'Result = Base - (Base × (Percentage ÷ 100))';
      formulaExample = `${formattedBase} - (${formattedBase} × ${formattedPercent}%) = ${formatNumber(result, precision)}`;
      break;
    case 'percent_of':
      result = base * (percent / 100);
      opName = 'Percentage of Number';
      formula = 'Result = Base × (Percentage ÷ 100)';
      formulaExample = `${formattedBase} × (${formattedPercent} ÷ 100) = ${formatNumber(result, precision)}`;
      break;
    case 'increase_by':
      result = base * (1 + percent / 100);
      opName = 'Increase by Percentage';
      formula = 'Result = Base × (1 + (Percentage ÷ 100))';
      formulaExample = `${formattedBase} × (1 + ${formattedPercent}%) = ${formatNumber(result, precision)}`;
      break;
    case 'decrease_by':
      result = base * (1 - percent / 100);
      opName = 'Decrease by Percentage';
      formula = 'Result = Base × (1 - (Percentage ÷ 100))';
      formulaExample = `${formattedBase} × (1 - ${formattedPercent}%) = ${formatNumber(result, precision)}`;
      break;
  }

  const formattedResult = formatNumber(result, precision);

  return {
    primaryValue: formattedResult,
    primaryLabel: opName,
    summaryText: formulaExample,
    formula,
    formulaExample,
  };
}
