export type GSTMode = 'add' | 'remove';
export type GSTType = 'cgst_sgst' | 'igst';

export interface GSTCalculationResult {
  mode: GSTMode;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  finalAmount: number;
  type: GSTType;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
}

export interface DiscountGSTResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  priceAfterDiscount: number;
  gstRate: number;
  gstAmount: number;
  finalPayable: number;
  applyDiscountFirst: boolean;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstRate: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
}

export interface RateGroupSummary {
  rate: number;
  taxableAmount: number;
  gstAmount: number;
}

export interface InvoiceSummary {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGST: number;
  grandTotal: number;
  rateGroups: RateGroupSummary[];
}

export interface GSTHistoryItem {
  id: string;
  timestamp: number;
  mode: GSTMode;
  amount: number;
  gstRate: number;
  type: GSTType;
  taxableAmount: number;
  gstAmount: number;
  finalAmount: number;
}
