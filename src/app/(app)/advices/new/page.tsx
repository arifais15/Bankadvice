import { PageHeader } from '@/components/page-header';
import { AdviceComposer } from './advice-composer';
import { employees } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Advice | BankAdviceFlow',
};

export default function NewAdvicePage() {
  // In a real app, you'd fetch this from your DB
  const employeeList = employees;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New Bank Advice"
        description="Compile a new bank advice document for payment processing."
      />
      <AdviceComposer allEmployees={employeeList} />
    </div>
  );
}
