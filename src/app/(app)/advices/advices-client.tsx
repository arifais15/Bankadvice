'use client';

import * as React from 'react';
import Link from 'next/link';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Printer, 
  Eye, 
  Edit, 
  Loader2, 
  User, 
  Globe, 
  Download, 
  Calendar as CalendarIcon,
  FilterX
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { BankAdvice } from '@/types';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export function AdvicesClient() {
  const firestore = useFirestore();
  const [mounted, setMounted] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const advicesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'advices'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: advices, isLoading } = useCollection<BankAdvice>(advicesQuery as any);

  const filteredAdvices = React.useMemo(() => {
    if (!advices) return [];
    if (!dateRange?.from) return advices;

    return advices.filter((advice) => {
      const adviceDate = new Date(advice.date);
      const start = startOfDay(dateRange.from!);
      const end = endOfDay(dateRange.to || dateRange.from!);
      return isWithinInterval(adviceDate, { start, end });
    });
  }, [advices, dateRange]);

  const handleExportReport = () => {
    if (!filteredAdvices.length) return;

    const header = [
      "Advice No.",
      "Type",
      "Date",
      "Subject",
      "Ref.No",
      "Debit Account",
      "Bank",
      "Branch",
      "Total Amount",
      "Status",
      "Payee Count"
    ];

    const dataForExcel = filteredAdvices.map((advice) => ([
      advice.adviceNumber,
      advice.type || 'Employee',
      format(new Date(advice.date), 'dd-MMM-yyyy'),
      advice.subject,
      advice.refNo,
      advice.debitAccount,
      advice.bankName,
      advice.bankBranch,
      advice.totalAmount,
      advice.status,
      advice.employees.length
    ]));

    const grandTotal = filteredAdvices.reduce((sum, a) => sum + a.totalAmount, 0);
    const summaryRow = [
      "REPORT SUMMARY",
      "",
      dateRange?.from ? `From: ${format(dateRange.from, 'dd-MMM-yy')}` : "All Time",
      dateRange?.to ? `To: ${format(dateRange.to, 'dd-MMM-yy')}` : "",
      "",
      "",
      "",
      "GRAND TOTAL:",
      grandTotal,
      "",
      ""
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...dataForExcel, [], summaryRow]);
    
    // Auto-size columns
    const wscols = [
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, 
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advice History');
    
    const fileName = dateRange?.from 
      ? `Advice_Report_${format(dateRange.from, 'MMM_yyyy')}.xlsx`
      : 'Advice_History_Full.xlsx';

    XLSX.writeFile(workbook, fileName);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Filter by Date Range</label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {dateRange && (
              <Button variant="ghost" size="icon" onClick={() => setDateRange(undefined)} title="Clear Filter">
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleExportReport} 
          disabled={!filteredAdvices.length}
          className="w-full md:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report (Excel)
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Advice No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdvices.length > 0 ? (
                filteredAdvices.map((advice) => (
                  <TableRow key={advice.id}>
                    <TableCell className="font-medium pl-6">
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
                    <TableCell className="max-w-[200px] truncate">{advice.subject}</TableCell>
                    <TableCell>
                      {mounted ? format(new Date(advice.date), 'dd-MMM-yyyy') : '---'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(advice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          advice.status === 'Issued'
                            ? 'default'
                            : advice.status === 'Draft'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={cn(
                          advice.status === 'Issued' && "bg-green-100 text-green-800 hover:bg-green-100",
                          advice.status === 'Draft' && "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        )}
                      >
                        {advice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No advices found for the selected criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
