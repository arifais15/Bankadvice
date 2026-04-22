import { PageHeader } from '@/components/page-header';
import { AdviceComposer } from './advice-composer';
import { employees } from '@/lib/data';
import type { Metadata } from 'next';

// This metadata is now static as the page content is dynamic
export const metadata: Metadata = {
  title: 'New Advice | BankAdviceFlow',
};

export default function NewAdvicePage() {
  // In a real app, you'd fetch this from your DB
  // This now serves as fallback data if localStorage is empty.
  const employeeList = employees;

  return (
    <div className="flex flex-col gap-8">
      {/* The header is now inside the composer */}
      <AdviceComposer allEmployees={employeeList} />
    </div>
  );
}
