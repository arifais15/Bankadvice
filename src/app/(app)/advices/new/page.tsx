import { AdviceComposer } from './advice-composer';
import type { Metadata } from 'next';
import { employees } from '@/lib/data';

export const metadata: Metadata = {
  title: 'New Advice | BankAdviceFlow',
};

export default function NewAdvicePage() {
  return (
    <div className="flex flex-col gap-8">
      <AdviceComposer allEmployees={employees} />
    </div>
  );
}
