
export interface PaymentData {
  method: 'cash' | 'credit' | 'debit' | 'pix' | 'check' | 'transfer' | 'other';
  total: number;
  installments?: number;
  fees?: number;
}
