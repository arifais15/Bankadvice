'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Printer, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { BankAdvice } from '@/types';

type AdvicesClientProps = {
  data: BankAdvice[];
};

export function AdvicesClient({ data }: AdvicesClientProps) {
  const [advices, setAdvices] = React.useState(data);

  const sortedAdvices = React.useMemo(() => {
    return [...advices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [advices]);

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Advice No.</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAdvices.length > 0 ? (
              sortedAdvices.map((advice) => (
                <TableRow key={advice.id}>
                  <TableCell className="font-medium">
                    {advice.adviceNumber}
                  </TableCell>
                  <TableCell>{advice.subject}</TableCell>
                  <TableCell>
                    {new Date(advice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(advice.totalAmount)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/advices/${advice.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/advices/${advice.id}/print`} target="_blank">
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No advices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
