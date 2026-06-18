'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AdviceComposer } from '@/app/(app)/advices/new/advice-composer';
import type { BankAdvice } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditAdvicePage() {
  const params = useParams();
  const firestore = useFirestore();
  
  const adviceRef = React.useMemo(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'advices', params.id as string);
  }, [firestore, params.id]);

  const { data: advice, isLoading } = useDoc<BankAdvice>(adviceRef as any);

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
