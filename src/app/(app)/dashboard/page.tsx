'use client';
import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { advices as fallbackAdvices, employees as fallbackEmployees } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { FileText, Users, Banknote, Loader2 } from 'lucide-react';
import type { BankAdvice, Employee } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalAdvices: 0,
    totalEmployees: 0,
    totalAmountIssued: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const storedAdvices = localStorage.getItem('advices');
    const advices: BankAdvice[] = storedAdvices ? JSON.parse(storedAdvices) : fallbackAdvices;

    const storedEmployees = localStorage.getItem('employees');
    const employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : fallbackEmployees;

    const totalAdvices = advices.length;
    const totalEmployees = employees.length;
    const totalAmountIssued = advices
      .filter((a: BankAdvice) => a.status === 'Issued')
      .reduce((sum: number, a: BankAdvice) => sum + a.totalAmount, 0);

    setStats({ totalAdvices, totalEmployees, totalAmountIssued });
    setIsLoading(false);
  }, []);

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
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalAdvices}</div>}
            <p className="text-xs text-muted-foreground">
              advices created in total
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
             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalEmployees}</div>}
            <p className="text-xs text-muted-foreground">
              employees in your registry
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
             {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalAmountIssued)}</div>}
            <p className="text-xs text-muted-foreground">
              across all issued advices
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
