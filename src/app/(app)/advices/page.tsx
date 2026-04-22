import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { AdvicesClient } from './advices-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advice History | BankAdviceFlow',
};

export default function AdvicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Advice History"
        description="View, manage, and track all previously created bank advices."
      >
        <Button asChild>
          <Link href="/advices/new">
            <PlusCircle />
            New Advice
          </Link>
        </Button>
      </PageHeader>
      <AdvicesClient />
    </div>
  );
}
