'use client';

import React, { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, amountToWords } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { BankAdvice } from '@/types';
import { Loader2, Printer, FileDown, ArrowLeft } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { usePrintSettings } from '@/hooks/use-print-settings';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';


export default function PrintAdvicePage() {
  const params = useParams();
  const firestore = useFirestore();
  const companyLogoPlaceholder = PlaceHolderImages.find(p => p.id === 'company-logo');
  const companySealPlaceholder = PlaceHolderImages.find(p => p.id === 'company-seal');

  const { settings, isLoading: isLoadingSettings } = usePrintSettings();
  
  const adviceRef = useMemo(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'advices', params.id as string);
  }, [firestore, params.id]);

  const { data: advice, isLoading: isLoadingAdvice } = useDoc<BankAdvice>(adviceRef as any);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!advice) return;

    const header = [
      "SL", "ID", "Name", "Designation", "Bank_Name", "Branch_Name", "AccountNumber", "Routing", "NetPay"
    ];

    const dataForExcel = advice.employees.map((item, index) => ([
      index + 1,
      item.employee.id,
      item.employee.name,
      item.employee.designation,
      item.employee.bankName,
      item.employee.branch,
      item.employee.accountNumber,
      item.employee.routing,
      item.netPayment,
    ]));

    const totalRow = [
      'Total :', advice.employees.length, 'In Words :', amountToWords(advice.totalAmount), '', '', '', 'GrandTotal', advice.totalAmount
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...dataForExcel, [], totalRow]);
    const cols = [{ wch: 5 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advice Details');
    XLSX.writeFile(workbook, `${advice.adviceNumber}.xlsx`);
  };

  if (isLoadingAdvice || isLoadingSettings) {
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  if (!advice) {
    notFound();
  }
  
  const finalLogoUrl = settings?.companyLogoUrl || companyLogoPlaceholder?.imageUrl;
  const finalSealUrl = settings?.companySealUrl || companySealPlaceholder?.imageUrl;
  const sealEnabled = settings?.companySealEnabled;
  const watermarkEnabled = settings?.watermarkEnabled || false;
  const watermarkUrl = settings?.watermarkUrl || settings?.companyLogoUrl || companyLogoPlaceholder?.imageUrl;
  
  const headerSettings = {
    headerLine1: settings?.headerLine1 || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    headerLine2: settings?.headerLine2 || 'Gazipur Palli Bidyut Samity-2',
    headerLine3: settings?.headerLine3 || 'সদর দপ্তর, রাজেন্দ্রপুর, গাজীপুর',
    headerLine4: settings?.headerLine4 || 'টেলিফোন: ০২-৯২০১৭৮৩, E-mail: gazipbs2@gmail.com',
  };


  return (
    <div className="bg-muted/30 print:bg-white min-h-screen">
        <div className="p-4 max-w-7xl mx-auto flex justify-end gap-2 no-print">
            <Button asChild variant="outline">
              <Link href={`/advices/${advice.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to Excel
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
        
        <div 
          className={cn(
            "relative p-12 max-w-7xl mx-auto font-serif bg-white text-black text-sm shadow-lg mb-8 min-h-[210mm]",
            "print:p-0 print:m-0 print:shadow-none print:max-w-none print:mb-0"
          )}
        >
          {/* Watermark Section - Centered and robust for both screen and print */}
          {watermarkEnabled && watermarkUrl && (
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.08] print:opacity-[0.1]">
              <div className="relative w-[600px] h-[600px] transform -rotate-30">
                <Image
                  src={watermarkUrl}
                  alt="Watermark"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}

          <div className="relative z-10">
             <header className="grid grid-cols-[1fr_2.5fr_1fr] items-center gap-4 pb-4 font-sans border-b-2 border-black">
                <div className="flex items-center justify-start">
                  {finalLogoUrl && <Image src={finalLogoUrl} alt="Company Logo" width={90} height={90} unoptimized className="object-contain" />}
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold font-nikosh leading-tight">{headerSettings.headerLine1}</h1>
                  <h2 className="text-2xl font-semibold leading-tight">{headerSettings.headerLine2}</h2>
                  <p className="text-base font-nikosh mt-2">{headerSettings.headerLine3}</p>
                  <p className="text-sm font-nikosh">{headerSettings.headerLine4}</p>
                </div>
                <div className="flex items-center justify-end">
                  {sealEnabled && finalSealUrl && <Image src={finalSealUrl} alt="Company Seal" width={85} height={85} unoptimized className="opacity-80 object-contain" />}
                </div>
            </header>

            <div className="flex justify-between mt-8 text-base">
              <div>
                <p><span className="font-semibold">Ref.No:</span> {advice.refNo}</p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold">Date:</span> {format(new Date(advice.date), 'dd-MMM-yyyy')}</p>
              </div>
            </div>
            
             <div className="flex justify-end mt-2">
                <p className="font-bold text-lg">Advice No: {advice.adviceNumber}</p>
            </div>


            <main className="mt-10">
              <div className="space-y-1 text-base">
                  <p className='font-bold'>The Manager</p>
                  <p>{advice.bankName}</p>
                  <p>{advice.bankBranch}</p>
              </div>
              
              <p className="mt-8 font-bold text-base border-b border-black inline-block pb-1">Subject: {advice.subject}</p>

              <p className="mt-6 leading-relaxed text-justify text-base">
                You are requested to debit our Account No. <span className="font-bold">{advice.debitAccount}</span> by an amount of <span className="font-bold">{formatCurrency(advice.totalAmount)}</span>
                ( {amountToWords(advice.totalAmount)} ). The amount is to be transferred via BEFTN to employees' personal savings accounts as per the list provided below.
              </p>
              
              <div className="mt-8">
                <table className="w-full border-collapse border border-black table-fixed text-[11px]">
                  <thead className="text-left bg-gray-50">
                    <tr className="border-b-2 border-black">
                      <th className="p-2 border-r border-black font-bold text-center" style={{width: '4%'}}>SL</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '8%'}}>ID</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '22%'}}>Employee Name</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '15%'}}>Designation</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '12%'}}>Bank Name</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '12%'}}>Branch Name</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '12%'}}>A/C Number</th>
                      <th className="p-2 border-r border-black font-bold" style={{width: '6%'}}>Routing</th>
                      <th className="p-2 text-right font-bold" style={{width: '9%'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advice.employees.map((item, index) => (
                      <tr key={item.employee.id} className="border-b border-black hover:bg-gray-50">
                        <td className="p-2 border-r border-black text-center">{index + 1}</td>
                        <td className="p-2 border-r border-black font-mono">{item.employee.id}</td>
                        <td className="p-2 border-r border-black font-medium">{item.employee.name}</td>
                        <td className="p-2 border-r border-black">{item.employee.designation}</td>
                        <td className="p-2 border-r border-black">{item.employee.bankName}</td>
                        <td className="p-2 border-r border-black">{item.employee.branch}</td>
                        <td className="p-2 border-r border-black font-mono">{item.employee.accountNumber}</td>
                        <td className="p-2 border-r border-black font-mono">{item.employee.routing}</td>
                        <td className="p-2 text-right font-mono font-semibold">{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(item.netPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-black font-bold bg-gray-50">
                    <tr>
                        <td className="p-2 border-r border-black text-center" colSpan={2}>TOTAL</td>
                        <td className="p-2 border-r border-black" colSpan={6}>
                          <span className="mr-2">Count: {advice.employees.length}</span>
                          <span className="mx-2">|</span>
                          <span className="ml-2">In Words: {amountToWords(advice.totalAmount)}</span>
                        </td>
                        <td className="p-2 text-right font-mono text-base">{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(advice.totalAmount)}</td>
                    </tr>
                   </tfoot>
                </table>
              </div>
            </main>

            <footer className="mt-32 grid grid-cols-2 gap-20 text-center text-base pb-10">
                <div className="flex flex-col items-center">
                    <div className="border-t-2 border-black w-full pt-2">
                      <p className="font-bold">AGM Finance</p>
                      <p className="text-sm">Gazipur Palli Bidyut Samity-2</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t-2 border-black w-full pt-2">
                      <p className="font-bold">Senior General Manager</p>
                      <p className="text-sm">Gazipur Palli Bidyut Samity-2</p>
                    </div>
                </div>
            </footer>
          </div>
        </div>
    </div>
  );
}
