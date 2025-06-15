
export interface PaymentData {
  method: 'cash' | 'credit' | 'debit' | 'pix' | 'check' | 'bank_transfer' | 'other';
  total: number;
  installments?: number;
  fees?: number;
  otherDetails?: string;
}
