'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, amountToWords } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { BankAdvice } from '@/types';
import { Loader2, Printer, FileDown, ArrowLeft, FileType } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { usePrintSettings } from '@/hooks/use-print-settings';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintAdvicePage() {
  const params = useParams();
  const firestore = useFirestore();
  const adviceContentRef = useRef<HTMLDivElement>(null);
  const companyLogoPlaceholder = PlaceHolderImages.find(p => p.id === 'company-logo');

  const { settings, isLoading: isLoadingSettings } = usePrintSettings();
  const [mounted, setMounted] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const adviceRef = useMemo(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'advices', params.id as string);
  }, [firestore, params.id]);

  const { data: advice, isLoading: isLoadingAdvice } = useDoc<BankAdvice>(adviceRef as any);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!advice || !adviceContentRef.current) return;
    
    setIsExportingPdf(true);
    try {
      const element = adviceContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${advice.adviceNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    if (!advice) return;

    const header = [
      "SL", "ID", "Name", "Designation", "Bank_Name", "Branch_Name", "AccountNumber", "Routing", "Amount"
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
      'TOTAL', advice.employees.length, 'In Words:', amountToWords(advice.totalAmount), '', '', '', '', advice.totalAmount
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
  const finalSealUrl = settings?.companySealUrl;
  const sealEnabled = settings?.companySealEnabled;
  const watermarkEnabled = settings?.watermarkEnabled || false;
  const watermarkUrl = settings?.watermarkUrl || settings?.companyLogoUrl || companyLogoPlaceholder?.imageUrl;
  
  const headerSettings = {
    headerLine1: settings?.headerLine1 || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    headerLine2: settings?.headerLine2 || 'Gazipur Palli Bidyut Samity-2',
    headerLine3: settings?.headerLine3 || 'সদর দপ্তর, রাজেন্দ্রপুর, গাজীপুর',
    headerLine4: settings?.headerLine4 || 'টেলিফোন: ০২-৯২০১৭৮৩, E-mail: gazipbs2@gmail.com',
  };

  const contactLines = headerSettings.headerLine4.split(',').map(l => l.trim()).filter(Boolean);

  const cellStyle: React.CSSProperties = {
    height: '22pt',
    lineHeight: '22pt',
    verticalAlign: 'middle',
    padding: '0 4px',
    color: '#000000',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const routingCellStyle: React.CSSProperties = {
    ...cellStyle,
    whiteSpace: 'normal',
    lineHeight: '1.2',
    display: 'table-cell',
    wordBreak: 'break-all'
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
                Export Excel
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isExportingPdf}>
                {isExportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType className="mr-2 h-4 w-4" />}
                Download PDF
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
        
        <div 
          ref={adviceContentRef}
          className={cn(
            "relative p-12 max-w-[297mm] mx-auto font-serif bg-white text-black shadow-lg mb-8",
            "print:p-0 print:m-0 print:shadow-none print:max-w-none print:mb-0"
          )}
          style={{ color: '#000000' }}
        >
          {watermarkEnabled && watermarkUrl && (
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.08] print:opacity-[0.1]">
              <div className="relative w-[550px] h-[550px]">
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
             <header className="grid grid-cols-3 items-start pb-2 font-sans border-b border-black">
                <div className="flex flex-col items-start">
                  {finalLogoUrl && <Image src={finalLogoUrl} alt="Company Logo" width={90} height={90} unoptimized className="object-contain" />}
                </div>
                <div className="text-center">
                  <h1 className="text-[26px] font-bold font-nikosh leading-tight text-black">{headerSettings.headerLine1}</h1>
                  <h2 className="text-[22px] font-bold leading-tight text-black">{headerSettings.headerLine2}</h2>
                </div>
                <div className="text-right flex flex-col items-end gap-0.5">
                  {sealEnabled && finalSealUrl && <Image src={finalSealUrl} alt="Company Seal" width={70} height={70} unoptimized className="opacity-80 object-contain mb-1" />}
                  <p className="text-[13px] font-nikosh leading-tight font-bold text-black">{headerSettings.headerLine3}</p>
                  {contactLines.map((line, i) => (
                    <p key={i} className="text-[12px] font-nikosh leading-tight text-black">{line}</p>
                  ))}
                </div>
            </header>

            <div className="flex justify-between items-baseline mt-3 text-[15px]">
              <div className="flex items-center gap-1">
                <span className="font-bold">Ref.No:</span> <span className="text-black">{advice.refNo}</span>
              </div>
              <div className="flex items-center">
                <p><span className="font-bold">Date:</span> <span className="text-black">{mounted ? format(new Date(advice.date), 'dd-MMM-yyyy') : '---'}</span></p>
              </div>
            </div>

            <main className="mt-2">
              <div className="flex justify-between items-start border-b border-gray-200 pb-0.5">
                <div className="text-[15px]">
                    <p className='font-bold text-black'>Manager</p>
                    <p className="text-black">{advice.bankName}, {advice.bankBranch}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-[15px] text-black">Advice No: {advice.adviceNumber}</p>
                </div>
              </div>
              
              <p className="mt-4 font-bold text-[16px] underline text-black">Subject: {advice.subject}</p>

              <p className="mt-3 leading-tight text-justify text-[15px] text-black">
                You are requested to debit our Account No. <span className="font-bold">{advice.debitAccount}</span> by an amount of <span className="font-bold">{formatCurrency(advice.totalAmount)}</span>
                ( <span className="font-bold">{amountToWords(advice.totalAmount)}</span> ). The amount is to be transferred via BEFTN to employees' personal savings accounts as per the list provided below.
              </p>
              
              <div className="mt-4">
                <table className="w-full border-collapse border border-black table-fixed text-[13px] leading-none">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-black">
                      <th className="border-r border-black font-bold text-center" style={{ ...cellStyle, width: '3%' }}>SL</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '7%' }}>ID</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '26%' }}>Employee Name</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '16%' }}>Designation</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '10%' }}>Bank Name</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '10%' }}>Branch Name</th>
                      <th className="border-r border-black font-bold text-left" style={{ ...cellStyle, width: '13%' }}>A/C Number</th>
                      <th className="border-r border-black font-bold text-center" style={{ ...routingCellStyle, width: '9%', verticalAlign: 'middle', height: '22pt' }}>Routing</th>
                      <th className="text-right font-bold pr-1" style={{ ...cellStyle, width: '6%' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {advice.employees.map((item, index) => (
                      <tr key={item.employee.id} className="border-b border-black">
                        <td className="border-r border-black text-center" style={cellStyle}>{index + 1}</td>
                        <td className="border-r border-black font-mono text-left" style={cellStyle}>{item.employee.id}</td>
                        <td className="border-r border-black font-medium text-left" style={cellStyle}>{item.employee.name}</td>
                        <td className="border-r border-black text-left" style={cellStyle}>{item.employee.designation}</td>
                        <td className="border-r border-black text-left" style={cellStyle}>{item.employee.bankName}</td>
                        <td className="border-r border-black text-left" style={cellStyle}>{item.employee.branch}</td>
                        <td className="border-r border-black font-mono text-left" style={cellStyle}>{item.employee.accountNumber}</td>
                        <td className="border-r border-black font-mono text-center" style={routingCellStyle}>{item.employee.routing}</td>
                        <td className="text-right font-mono font-bold" style={cellStyle}>{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(item.netPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-black font-bold text-black">
                    <tr style={{ height: '24pt', lineHeight: '24pt', verticalAlign: 'middle' }}>
                        <td className="border-r border-black text-center" colSpan={2} style={{ color: '#000000' }}>TOTAL</td>
                        <td className="border-r border-black text-left pl-2" colSpan={6} style={{ color: '#000000' }}>
                          <span className="mr-2">Count: {advice.employees.length}</span>
                          <span className="mx-2 font-normal">|</span>
                          <span className="ml-2">In Words: {amountToWords(advice.totalAmount)}</span>
                        </td>
                        <td className="text-right font-mono text-[15px] pr-1" style={{ color: '#000000' }}>{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(advice.totalAmount)}</td>
                    </tr>
                   </tfoot>
                </table>
              </div>
            </main>

            <footer className="mt-28 grid grid-cols-2 gap-40 text-center text-[15px] pb-12">
                <div className="flex flex-col items-center">
                    <div className="border-t border-black w-full pt-1">
                      {settings?.signatory1Name && <p className="font-bold text-black">{settings.signatory1Name}</p>}
                      <p className="font-bold text-black">{settings?.signatory1Designation || 'AGM Finance'}</p>
                      <p className="text-[14px] text-black">{headerSettings.headerLine2}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-black w-full pt-1">
                      {settings?.signatory2Name && <p className="font-bold text-black">{settings.signatory2Name}</p>}
                      <p className="font-bold text-black">{settings?.signatory2Designation || 'Senior General Manager'}</p>
                      <p className="text-[14px] text-black">{headerSettings.headerLine2}</p>
                    </div>
                </div>
            </footer>
          </div>
        </div>
    </div>
  );
}
