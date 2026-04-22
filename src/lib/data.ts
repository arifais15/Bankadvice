import type { Employee, BankAdvice } from '@/types';

export const employees: Employee[] = [
  {
    id: '0006',
    name: 'Miss Israt Jahan',
    designation: 'Billing Assistant',
    bankName: 'Mutual Trust Bank Ltd',
    branch: 'Monipur Bazar Branch',
    accountNumber: '1311000214272',
    routing: '145330143',
  },
  {
    id: '0059',
    name: 'Mr. Abul Kalam Azad.',
    designation: 'Lineman Grade-1',
    bankName: 'Mutual Trust Bank Ltd',
    branch: 'Monipur Bazar Branch',
    accountNumber: '1311000327669',
    routing: '145330143',
  },
  {
    id: '0112',
    name: 'Mrs. Suraya Begum',
    designation: 'Billing Assistant',
    bankName: 'Mutual Trust Bank Ltd',
    branch: 'Monipur Bazar Branch',
    accountNumber: '1311000175494',
    routing: '145330143',
  },
  {
    id: '0124',
    name: 'Mrs.Shahida Sultana',
    designation: 'Computer Operator',
    bankName: 'Mutual Trust Bank Ltd',
    branch: 'Monipur Bazar Branch',
    accountNumber: '1311000202598',
    routing: '145330143',
  },
  {
    id: '0130',
    name: 'Md. Najrul Islam',
    designation: 'Lineman Grade-2',
    bankName: 'Mutual Trust Bank Ltd',
    branch: 'kapasia Branch',
    accountNumber: '1311000242974',
    routing: '145330880',
  },
];

export const advices: BankAdvice[] = [
    {
        id: 'adv-001',
        adviceNumber: 'BA-2024-1001',
        subject: 'Monthly Payroll - April 2024',
        debitAccount: '987654321-001',
        date: '2024-04-28T10:00:00.000Z',
        narrative: 'Processing of monthly salaries for all full-time employees for the month of April 2024.',
        employees: [
            { employee: employees[0], netPayment: 5200.50 },
            { employee: employees[1], netPayment: 4800.75 },
        ],
        status: 'Issued',
        totalAmount: 10001.25,
    },
    {
        id: 'adv-002',
        adviceNumber: 'BA-2024-1002',
        subject: 'Vendor Payments - April 2024',
        debitAccount: '987654321-002',
        date: '2024-04-25T14:30:00.000Z',
        narrative: 'Payment for services rendered by vendors in April. Invoices #V456, #V457.',
        employees: [
            { employee: employees[2], netPayment: 1500.00 },
        ],
        status: 'Issued',
        totalAmount: 1500.00,
    },
    {
        id: 'adv-003',
        adviceNumber: 'BA-2024-1003',
        subject: 'Expense Reimbursement - Q1 2024',
        debitAccount: '987654321-001',
        date: '2024-05-02T11:00:00.000Z',
        narrative: 'Reimbursement for approved travel and office expenses for Q1 2024.',
        employees: [
            { employee: employees[3], netPayment: 350.20 },
            { employee: employees[4], netPayment: 875.90 },
        ],
        status: 'Draft',
        totalAmount: 1226.10,
    }
];
