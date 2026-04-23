
'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, amountToWords } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { BankAdvice } from '@/types';
import { Loader2, Printer, FileDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { advices } from '@/lib/data';
import { usePrintSettings } from '@/hooks/use-print-settings';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';


export default function PrintAdvicePage() {
  const params = useParams();
  const companyLogoPlaceholder = PlaceHolderImages.find(p => p.id === 'company-logo');
  const companySealPlaceholder = PlaceHolderImages.find(p => p.id === 'company-seal');

  const { settings, isLoading: isLoadingSettings } = usePrintSettings();
  const [advice, setAdvice] = useState<BankAdvice | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(true);

  useEffect(() => {
    const foundAdvice = advices.find((a) => a.id === params.id);
    if (foundAdvice) {
      setAdvice(foundAdvice);
    }
    setIsLoadingAdvice(false);
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!advice) return;

    const header = [
      "SL",
      "ID",
      "Name",
      "Designation",
      "Bank_Name",
      "Branch_Name",
      "AccountNumber",
      "Routing",
      "NetPay"
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
      'Total :',
      advice.employees.length,
      'In Words :',
      amountToWords(advice.totalAmount),
      '',
      '',
      '',
      'GrandTotal',
      advice.totalAmount
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...dataForExcel, [], totalRow]);
    
    // Set column widths
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
  const watermarkEnabled = settings?.watermarkEnabled || false;
  const watermarkUrl = settings?.watermarkUrl || settings?.companyLogoUrl || companyLogoPlaceholder?.imageUrl;
  
  const headerSettings = {
    headerLine1: settings?.headerLine1 || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    headerLine2: settings?.headerLine2 || 'Gazipur Palli Bidyut Samity-2',
    headerLine3: settings?.headerLine3 || 'সদর দপ্তর, রাজেন্দ্রপুর, গাজীপুর',
    headerLine4: settings?.headerLine4 || 'টেলিফোন: ০২-৯২০১৭৮৩, E-mail: gazipbs2@gmail.com',
  };


  return (
    <div className="bg-muted/30">
        <div className="p-4 max-w-5xl mx-auto flex justify-end gap-2 no-print">
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
          className="relative p-8 max-w-5xl mx-auto font-serif bg-white text-black text-xs print:text-xs print:shadow-none mb-8"
        >
          {watermarkEnabled && watermarkUrl && (
            <Image
              src={watermarkUrl}
              alt="Watermark"
              fill
              sizes="100vw"
              className="absolute inset-0 object-contain object-center opacity-10 pointer-events-none z-0"
              style={{
                transform: 'rotate(-30deg) scale(0.8)',
              }}
            />
          )}

          <div className="relative z-10">
             <header className="grid grid-cols-3 items-center pb-4 font-sans border-b-2 border-black">
              <div className="flex items-center">
                {finalLogoUrl && <Image src={finalLogoUrl} alt="Company Logo" width={80} height={80} data-ai-hint={companyLogoPlaceholder?.imageHint} className="object-contain" />}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold whitespace-nowrap font-nikosh">{headerSettings.headerLine1}</h1>
                <h2 className="text-xl">{headerSettings.headerLine2}</h2>
              </div>
              <div className="text-right">
                 {finalSealUrl && <Image src={finalSealUrl} alt="Company Seal" width={70} height={70} data-ai-hint={companySealPlaceholder?.imageHint} className="ml-auto opacity-70 object-contain" />}
                <p className="text-xs font-nikosh">{headerSettings.headerLine3}</p>
                <p className="text-xs font-nikosh">{headerSettings.headerLine4}</p>
              </div>
            </header>

            <div className="flex justify-between mt-4">
              <div>
                <p>Ref.No: {advice.refNo}</p>
              </div>
              <div className="text-right">
                <p>Date: {new Date(advice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
             <div className="flex justify-end mt-1">
                <p className="font-bold">Advice No: {advice.adviceNumber}</p>
            </div>


            <main className="mt-8">
              <div className="space-y-1">
                  <p>Manager</p>
                  <p>{advice.bankName}, {advice.bankBranch}</p>
              </div>
              
              <p className="mt-4"><span className="font-bold">Subject: {advice.subject}</span></p>

              <p className="mt-4 leading-relaxed">
                You are requested to debit our Account No. {advice.debitAccount} by an amount of {formatCurrency(advice.totalAmount)}
                ( {amountToWords(advice.totalAmount)} ). The amount is to be transferred via BEFTN to employees' personal savings accounts as per the advice.
              </p>
              
              <div className="mt-4">
                <table className="w-full text-xs border-collapse border border-black">
                  <thead className="text-left bg-gray-100">
                    <tr className="border-b border-black">
                      <th className="p-1 border-r border-black font-semibold text-center">SL</th>
                      <th className="p-1 border-r border-black font-semibold">ID</th>
                      <th className="p-1 border-r border-black font-semibold">Name</th>
                      <th className="p-1 border-r border-black font-semibold">Designation</th>
                      <th className="p-1 border-r border-black font-semibold">Bank_Name</th>
                      <th className="p-1 border-r border-black font-semibold">Branch_Name</th>
                      <th className="p-1 border-r border-black font-semibold">AccountNumber</th>
                      <th className="p-1 border-r border-black font-semibold">Routing</th>
                      <th className="p-1 text-right font-semibold">NetPay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advice.employees.map((item, index) => (
                      <tr key={item.employee.id} className="border-b border-black">
                        <td className="p-1 border-r border-black text-center">{index + 1}</td>
                        <td className="p-1 border-r border-black font-mono">{item.employee.id}</td>
                        <td className="p-1 border-r border-black">{item.employee.name}</td>
                        <td className="p-1 border-r border-black">{item.employee.designation}</td>
                        <td className="p-1 border-r border-black">{item.employee.bankName}</td>
                        <td className="p-1 border-r border-black">{item.employee.branch}</td>
                        <td className="p-1 border-r border-black font-mono">{item.employee.accountNumber}</td>
                        <td className="p-1 border-r border-black font-mono">{item.employee.routing}</td>
                        <td className="p-1 text-right font-mono">{new Intl.NumberFormat('en-IN').format(item.netPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 flex justify-between items-center text-xs">
                  <p className="font-bold">Total : {advice.employees.length}</p>
                  <p className="font-bold">In Words : {amountToWords(advice.totalAmount)}</p>
                  <p className="font-bold">GrandTotal {formatCurrency(advice.totalAmount)}</p>
              </div>
            </main>

            <footer className="mt-24 grid grid-cols-2 gap-16 text-center text-sm">
                <div>
                    <div className="border-t border-black w-48 mx-auto pt-2">
                      AGM Finance
                      <br/>
                      Gazipur Palli Bidyut Samity-2
                    </div>
                </div>
                <div>
                    <div className="border-t border-black w-48 mx-auto pt-2">
                      Senior General Manager
                      <br/>
                      Gazipur Palli Bidyut Samity-2
                    </div>
                </div>
            </footer>
          </div>
        </div>
    </div>
  );
}

    