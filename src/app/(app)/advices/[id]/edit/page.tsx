'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, collection } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { AdviceComposer } from '@/app/(app)/advices/new/advice-composer';
import type { BankAdvice, Employee } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditAdvicePage() {
  const params = useParams();
  const firestore = useFirestore();

  const adviceRef = React.useMemo(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'advices', params.id as string)
  }, [firestore, params.id]);
  const { data: advice, isLoading: isAdviceLoading } = useDoc<BankAdvice>(adviceRef);
  
  const employeesCollection = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'employees');
  }, [firestore]);
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const isLoading = isAdviceLoading || areEmployeesLoading;

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
