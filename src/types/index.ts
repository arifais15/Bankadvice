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
  type: 'Employee' | 'External';
};

export type PrintSettings = {
  companyLogoUrl?: string;
  companySealUrl?: string;
  companySealEnabled?: boolean;
  watermarkEnabled?: boolean;
  watermarkUrl?: string;
  headerLine1?: string;
  headerLine2?: string;
  headerLine3?: string;
  headerLine4?: string;
  signatory1Name?: string;
  signatory1Designation?: string;
  signatory2Name?: string;
  signatory2Designation?: string;
};
