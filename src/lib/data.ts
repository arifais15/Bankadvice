import type { Payee, BankAdvice } from '@/types';

export const payees: Payee[] = [
  {
    id: 'payee-001',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    bankName: 'Global Trust Bank',
    accountNumber: '1234567890',
    branchCode: 'GTB001',
  },
  {
    id: 'payee-002',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    bankName: 'Pioneer Financial',
    accountNumber: '0987654321',
    branchCode: 'PFN002',
  },
  {
    id: 'payee-003',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    bankName: 'Unity Savings & Loan',
    accountNumber: '1122334455',
    branchCode: 'USL003',
  },
  {
    id: 'payee-004',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    bankName: 'Global Trust Bank',
    accountNumber: '2233445566',
    branchCode: 'GTB001',
  },
  {
    id: 'payee-005',
    name: 'Ethan Hunt',
    email: 'ethan.h@example.com',
    bankName: 'Pioneer Financial',
    accountNumber: '3344556677',
    branchCode: 'PFN004',
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
        payees: [
            { payee: payees[0], netPayment: 5200.50 },
            { payee: payees[1], netPayment: 4800.75 },
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
        payees: [
            { payee: payees[2], netPayment: 1500.00 },
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
        payees: [
            { payee: payees[3], netPayment: 350.20 },
            { payee: payees[4], netPayment: 875.90 },
        ],
        status: 'Draft',
        totalAmount: 1226.10,
    }
];
