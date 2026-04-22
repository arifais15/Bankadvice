import { PageHeader } from '@/components/page-header';
import { PayeesClient } from './payees-client';
import { employees } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Registry | BankAdviceFlow',
};

export default function PayeesPage() {
  // In a real app, you would fetch this from your database
  const employeeData = employees;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Employee Registry"
        description="Add, view, and manage individual employee records."
      />
      <PayeesClient data={employeeData} />
    </div>
  );
}
