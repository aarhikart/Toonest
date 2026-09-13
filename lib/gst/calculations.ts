import {
  GSTMode,
  GSTType,
  GSTCalculationResult,
  DiscountGSTResult,
  InvoiceItem,
  InvoiceSummary,
  RateGroupSummary,
} from './types';

export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Standard Indian GST calculation
 * @param amount - In 'add' mode: Base/Taxable Amount. In 'remove' mode: Gross/Inclusive Amount.
 * @param gstRate - Percentage GST rate (e.g. 5, 12, 18, 28)
 * @param mode - 'add' (exclusive to inclusive) or 'remove' (inclusive to exclusive)
 * @param type - 'cgst_sgst' (intra-state) or 'igst' (inter-state)
 */
export function calculateGST(
  amount: number,
  gstRate: number,
  mode: GSTMode = 'add',
  type: GSTType = 'cgst_sgst'
): GSTCalculationResult {
  const safeAmount = Math.max(0, amount || 0);
  const safeRate = Math.max(0, gstRate || 0);

  let taxableAmount = 0;
  let gstAmount = 0;
  let finalAmount = 0;

  if (mode === 'add') {
    taxableAmount = safeAmount;
    gstAmount = (taxableAmount * safeRate) / 100;
    finalAmount = taxableAmount + gstAmount;
  } else {
    // Remove GST (Reverse calculation)
    // Inclusive Amount = Taxable + (Taxable * Rate / 100) = Taxable * (1 + Rate / 100)
    // Taxable = Inclusive / (1 + Rate / 100) = (Inclusive * 100) / (100 + Rate)
    finalAmount = safeAmount;
    taxableAmount = safeRate > 0 ? (safeAmount * 100) / (100 + safeRate) : safeAmount;
    gstAmount = safeAmount - taxableAmount;
  }

  taxableAmount = roundTo2(taxableAmount);
  gstAmount = roundTo2(gstAmount);
  finalAmount = roundTo2(finalAmount);

  const result: GSTCalculationResult = {
    mode,
    type,
    taxableAmount,
    gstRate: safeRate,
    gstAmount,
    finalAmount,
  };

  if (type === 'cgst_sgst') {
    result.cgstRate = safeRate / 2;
    result.cgstAmount = roundTo2(gstAmount / 2);
    result.sgstRate = safeRate / 2;
    result.sgstAmount = roundTo2(gstAmount - (result.cgstAmount || 0)); // Avoid 1 paisa rounding mismatch
  } else {
    result.igstRate = safeRate;
    result.igstAmount = gstAmount;
  }

  return result;
}

/**
 * Calculates Discount with GST
 * Standard commercial law (CGST Act Sec 15): Discount is applied to base price before GST
 */
export function calculateDiscountGST(
  originalPrice: number,
  discountPercent: number,
  gstRate: number,
  applyDiscountFirst: boolean = true
): DiscountGSTResult {
  const safePrice = Math.max(0, originalPrice || 0);
  const safeDiscount = Math.min(100, Math.max(0, discountPercent || 0));
  const safeRate = Math.max(0, gstRate || 0);

  let discountAmount = 0;
  let priceAfterDiscount = 0;
  let gstAmount = 0;
  let finalPayable = 0;

  if (applyDiscountFirst) {
    discountAmount = roundTo2((safePrice * safeDiscount) / 100);
    priceAfterDiscount = roundTo2(safePrice - discountAmount);
    gstAmount = roundTo2((priceAfterDiscount * safeRate) / 100);
    finalPayable = roundTo2(priceAfterDiscount + gstAmount);
  } else {
    // Discount applied on total after GST
    const baseGST = roundTo2((safePrice * safeRate) / 100);
    const totalWithGST = roundTo2(safePrice + baseGST);
    discountAmount = roundTo2((totalWithGST * safeDiscount) / 100);
    priceAfterDiscount = safePrice;
    gstAmount = baseGST;
    finalPayable = roundTo2(totalWithGST - discountAmount);
  }

  return {
    originalPrice: roundTo2(safePrice),
    discountPercent: safeDiscount,
    discountAmount,
    priceAfterDiscount,
    gstRate: safeRate,
    gstAmount,
    finalPayable,
    applyDiscountFirst,
  };
}

/**
 * Calculates line items and totals for a multi-item GST invoice
 */
export function calculateInvoice(
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    gstRate: number;
  }>,
  type: GSTType = 'cgst_sgst'
): { computedItems: InvoiceItem[]; summary: InvoiceSummary } {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalGST = 0;

  const rateGroupMap = new Map<number, { taxableAmount: number; gstAmount: number }>();

  const computedItems: InvoiceItem[] = items.map((item) => {
    const qty = Math.max(0, item.quantity || 0);
    const price = Math.max(0, item.unitPrice || 0);
    const discPct = Math.min(100, Math.max(0, item.discountPercent || 0));
    const rate = Math.max(0, item.gstRate || 0);

    const lineSubtotal = roundTo2(qty * price);
    const lineDiscount = roundTo2((lineSubtotal * discPct) / 100);
    const lineTaxable = roundTo2(lineSubtotal - lineDiscount);
    const lineGST = roundTo2((lineTaxable * rate) / 100);
    const lineTotal = roundTo2(lineTaxable + lineGST);

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;
    taxableAmount += lineTaxable;
    totalGST += lineGST;

    const existingGroup = rateGroupMap.get(rate) || { taxableAmount: 0, gstAmount: 0 };
    rateGroupMap.set(rate, {
      taxableAmount: roundTo2(existingGroup.taxableAmount + lineTaxable),
      gstAmount: roundTo2(existingGroup.gstAmount + lineGST),
    });

    return {
      id: item.id,
      name: item.name,
      quantity: qty,
      unitPrice: price,
      discountPercent: discPct,
      gstRate: rate,
      subtotal: lineSubtotal,
      discountAmount: lineDiscount,
      taxableAmount: lineTaxable,
      gstAmount: lineGST,
      total: lineTotal,
    };
  });

  subtotal = roundTo2(subtotal);
  totalDiscount = roundTo2(totalDiscount);
  taxableAmount = roundTo2(taxableAmount);
  totalGST = roundTo2(totalGST);
  const grandTotal = roundTo2(taxableAmount + totalGST);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (type === 'cgst_sgst') {
    cgstAmount = roundTo2(totalGST / 2);
    sgstAmount = roundTo2(totalGST - cgstAmount);
  } else {
    igstAmount = totalGST;
  }

  const rateGroups: RateGroupSummary[] = Array.from(rateGroupMap.entries())
    .sort(([rateA], [rateB]) => rateA - rateB)
    .map(([rate, data]) => ({
      rate,
      taxableAmount: data.taxableAmount,
      gstAmount: data.gstAmount,
    }));

  return {
    computedItems,
    summary: {
      subtotal,
      totalDiscount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalGST,
      grandTotal,
      rateGroups,
    },
  };
}
