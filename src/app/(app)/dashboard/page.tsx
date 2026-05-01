'use client';

import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { FileText, Users, Banknote, Loader2 } from 'lucide-react';
import type { BankAdvice, Employee } from '@/types';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const advicesQuery = React.useMemo(() => firestore ? collection(firestore, 'advices') : null, [firestore]);
  const employeesQuery = React.useMemo(() => firestore ? collection(firestore, 'employees') : null, [firestore]);

  const { data: advices, isLoading: isLoadingAdvices } = useCollection<BankAdvice>(advicesQuery as any);
  const { data: employees, isLoading: isLoadingEmployees } = useCollection<Employee>(employeesQuery as any);

  const stats = React.useMemo(() => {
    const totalAdvices = advices?.length || 0;
    const totalEmployees = employees?.length || 0;
    const totalAmountIssued = (advices || [])
      .filter((a) => a.status === 'Issued')
      .reduce((sum, a) => sum + a.totalAmount, 0);
    
    return { totalAdvices, totalEmployees, totalAmountIssued };
  }, [advices, employees]);

  const isLoading = isLoadingAdvices || isLoadingEmployees;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Welcome Back"
        description="Here's a quick overview of your bank advice activity."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{stats.totalAdvices}</div>}
            <p className="text-xs text-muted-foreground">
              advices created in Firestore
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{stats.totalEmployees}</div>}
            <p className="text-xs text-muted-foreground">
              employees in your cloud registry
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Amount Issued
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalAmountIssued)}</div>}
            <p className="text-xs text-muted-foreground">
              across all issued advices
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
