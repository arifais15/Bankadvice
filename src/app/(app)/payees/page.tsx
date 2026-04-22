import { PageHeader } from '@/components/page-header';
import { PayeesClient } from './payees-client';
import { payees } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payee Registry | BankAdviceFlow',
};

export default function PayeesPage() {
  // In a real app, you would fetch this from your database
  const payeeData = payees;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Payee Registry"
        description="Add, view, and manage individual payee records."
      />
      <PayeesClient data={payeeData} />
    </div>
  );
}
