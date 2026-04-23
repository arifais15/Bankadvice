'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { getAdvices } from '@/lib/storage';
import { AdviceComposer } from '@/app/(app)/advices/new/advice-composer';
import type { BankAdvice } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditAdvicePage() {
  const params = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [advice, setAdvice] = React.useState<BankAdvice | null>(null);

  React.useEffect(() => {
    const allAdvices = getAdvices();
    const adviceToEdit = allAdvices.find((a) => a.id === params.id);
    if (adviceToEdit) {
      setAdvice(adviceToEdit);
    }
    setIsLoading(false);
  }, [params.id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!advice) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <AdviceComposer adviceToEdit={advice} key={advice?.id} />
    </div>
  );
}
