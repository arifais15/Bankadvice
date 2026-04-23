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
  refNo: string;
  subject: string;
  debitAccount: string;
  bankName: string;
  bankBranch: string;
  date: string; // ISO string
  narrative: string;
  purpose?: string;
  context?: string;
  employees: AdviceEmployeeItem[];
  status: 'Draft' | 'Issued' | 'Archived';
  totalAmount: number;
};

export type PrintSettings = {
  companyLogoUrl?: string;
  companySealUrl?: string;
  watermarkEnabled?: boolean;
  watermarkUrl?: string;
  headerLine1?: string;
  headerLine2?: string;
  headerLine3?: string;
  headerLine4?: string;
};
