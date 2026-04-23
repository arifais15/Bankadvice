'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { advices, employees } from '@/lib/data';
import { AdviceComposer } from '@/app/(app)/advices/new/advice-composer';
import type { Employee } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditAdvicePage() {
  const params = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [advice, setAdvice] = React.useState(null);

  React.useEffect(() => {
    const adviceToEdit = advices.find((a) => a.id === params.id);
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
      <AdviceComposer allEmployees={employees || []} adviceToEdit={advice} key={advice?.id} />
    </div>
  );
}
