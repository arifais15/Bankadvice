export type Payee = {
  id: string;
  name: string;
  email: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
};

export type AdvicePayeeItem = {
  payee: Payee;
  netPayment: number;
};

export type BankAdvice = {
  id: string;
  adviceNumber: string;
  subject: string;
  debitAccount: string;
  date: string; // ISO string
  narrative: string;
  payees: AdvicePayeeItem[];
  status: 'Draft' | 'Issued' | 'Archived';
  totalAmount: number;
};
