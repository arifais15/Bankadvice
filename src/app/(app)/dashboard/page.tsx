'use client';
import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { FileText, Users, Banknote } from 'lucide-react';
import type { BankAdvice, Employee } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { advices as initialAdvices, employees as initialEmployees } from '@/lib/data';


export default function DashboardPage() {
  const [advices, setAdvices] = React.useState<BankAdvice[]>(initialAdvices);
  const [employees, setEmployees] = React.useState<Employee[]>(initialEmployees);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAdvices(initialAdvices);
      setEmployees(initialEmployees);
      setIsLoading(false);
    }, 500);
  }, []);

  const stats = React.useMemo(() => {
    const totalAdvices = advices?.length || 0;
    const totalEmployees = employees?.length || 0;
    const totalAmountIssued = (advices || [])
      .filter((a) => a.status === 'Issued')
      .reduce((sum, a) => sum + a.totalAmount, 0);
    
    return { totalAdvices, totalEmployees, totalAmountIssued };
  }, [advices, employees]);

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
