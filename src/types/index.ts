export type Employee = {
  id: string;
  name: string;
  designation: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  routing: string;
};

export type AdviceEmployeeItem = {
  employee: Employee;
  netPayment: number;
};

export type BankAdvice = {
  id: string;
  adviceNumber: string;
  subject: string;
  debitAccount: string;
  date: string; // ISO string
  narrative: string;
  employees: AdviceEmployeeItem[];
  status: 'Draft' | 'Issued' | 'Archived';
  totalAmount: number;
};
