'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Printer, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import type { BankAdvice } from '@/types';
import { advices } from '@/lib/data';

export default function AdviceDetailsPage() {
  const params = useParams();
  const [advice, setAdvice] = React.useState<BankAdvice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const foundAdvice = advices.find((a) => a.id === params.id);
    if (foundAdvice) {
      setAdvice(foundAdvice);
    }
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!advice) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={advice.adviceNumber}
        description={`Details for bank advice created on ${new Date(
          advice.date
        ).toLocaleDateString()}`}
      >
        <Button asChild variant="outline">
          <Link href={`/advices/${advice.id}/print`}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{advice.subject}</CardTitle>
              <CardDescription>
                Ref.No: {advice.refNo}
              </CardDescription>
            </div>
            <Badge
              variant={
                advice.status === 'Issued'
                  ? 'success'
                  : advice.status === 'Draft'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {advice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Recipient Bank</p>
              <p className="font-medium">{advice.bankName}, {advice.bankBranch}</p>
            </div>
             <div>
              <p className="text-muted-foreground">Debit Account</p>
              <p className="font-medium">{advice.debitAccount}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Narrative</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
              {advice.narrative}
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Employee Breakdown</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Account No.</TableHead>
                    <TableHead className="text-right">Net Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advice.employees.map((item) => (
                    <TableRow key={item.employee.id}>
                      <TableCell className="font-mono">{item.employee.id}</TableCell>
                      <TableCell className="font-medium">
                        {item.employee.name}
                      </TableCell>
                      <TableCell>{item.employee.designation}</TableCell>
                      <TableCell className="font-mono">{item.employee.accountNumber}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.netPayment)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 items-center bg-muted/50 py-4 px-6">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="font-bold text-xl">
            {formatCurrency(advice.totalAmount)}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
