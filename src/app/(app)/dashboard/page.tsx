import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { advices, employees } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { FileText, Users, Banknote } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | BankAdviceFlow',
};

export default function DashboardPage() {
  const totalAdvices = advices.length;
  const totalEmployees = employees.length;
  const totalAmountIssued = advices
    .filter((a) => a.status === 'Issued')
    .reduce((sum, a) => sum + a.totalAmount, 0);

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
            <div className="text-2xl font-bold">{totalAdvices}</div>
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
            <div className="text-2xl font-bold">{totalEmployees}</div>
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
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmountIssued)}
            </div>
            <p className="text-xs text-muted-foreground">
              across all issued advices
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
