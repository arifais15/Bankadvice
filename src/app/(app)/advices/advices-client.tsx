'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
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
import { MoreHorizontal, Printer, Eye, Edit, Loader2, User, Globe } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { BankAdvice } from '@/types';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function AdvicesClient() {
  const firestore = useFirestore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const advicesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'advices'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: advices, isLoading } = useCollection<BankAdvice>(advicesQuery as any);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Advice No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advices && advices.length > 0 ? (
              advices.map((advice) => (
                <TableRow key={advice.id}>
                  <TableCell className="font-medium">
                    {advice.adviceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {advice.type === 'External' ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {advice.type || 'Employee'}
                    </div>
                  </TableCell>
                  <TableCell>{advice.subject}</TableCell>
                  <TableCell>
                    {mounted ? format(new Date(advice.date), 'dd-MMM-yyyy') : '---'}
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
                    <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/advices/${advice.id}/print`} title="Print">
                                <Printer className="h-4 w-4" />
                                <span className="sr-only">Print</span>
                            </Link>
                        </Button>
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
                            <Link href={`/advices/${advice.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No advices found in Firestore.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
