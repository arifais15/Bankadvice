import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Printer } from 'lucide-react';
import { advices } from '@/lib/data';
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
import type { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const advice = advices.find((a) => a.id === params.id);
  return {
    title: `${advice ? advice.adviceNumber : 'Advice'} | BankAdviceFlow`,
  };
}

export default function AdviceDetailsPage({ params }: { params: { id: string } }) {
  const advice = advices.find((a) => a.id === params.id);

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
          <Link href={`/advices/${advice.id}/print`} target="_blank">
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
                Debit Account: {advice.debitAccount}
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
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account No.</TableHead>
                    <TableHead className="text-right">Net Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advice.employees.map((item) => (
                    <TableRow key={item.employee.id}>
                      <TableCell className="font-medium">
                        {item.employee.name}
                      </TableCell>
                      <TableCell>{item.employee.bankName}</TableCell>
                      <TableCell>{item.employee.accountNumber}</TableCell>
                      <TableCell className="text-right">
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
