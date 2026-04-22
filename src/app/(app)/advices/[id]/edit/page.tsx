'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { AdviceComposer } from '@/app/(app)/advices/new/advice-composer';
import { employees as fallbackEmployees, advices as fallbackAdvices } from '@/lib/data';
import type { BankAdvice, Employee } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditAdvicePage() {
  const params = useParams();
  const [advice, setAdvice] = React.useState<BankAdvice | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
        const storedAdvices = localStorage.getItem('advices');
        const allAdvices: BankAdvice[] = storedAdvices ? JSON.parse(storedAdvices) : fallbackAdvices;
        const currentAdvice = allAdvices.find((a) => a.id === params.id);
    
        const storedEmployees = localStorage.getItem('employees');
        const allEmployees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : fallbackEmployees;
        
        if (currentAdvice) {
          setAdvice(currentAdvice);
        }
        setEmployees(allEmployees);
    } catch (e) {
        // Handle potential JSON parsing errors
        console.error("Failed to parse data from localStorage", e);
        setAdvice(null);
        setEmployees(fallbackEmployees);
    } finally {
        setIsLoading(false);
    }
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
      <AdviceComposer allEmployees={employees} adviceToEdit={advice} />
    </div>
  );
}
