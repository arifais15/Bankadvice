import { PageHeader } from '@/components/page-header';
import { PayeesClient } from './payees-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Registry | BankAdviceFlow',
};

export default function PayeesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Employee Registry"
        description="Add, view, and manage individual employee records."
      />
      <PayeesClient />
    </div>
  );
}
