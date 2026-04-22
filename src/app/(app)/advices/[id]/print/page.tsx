'use client';

import React, { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { advices as fallbackAdvices } from '@/lib/data';
import { formatCurrency, amountToWords } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { BankAdvice } from '@/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function PrintAdvicePage() {
  const params = useParams();
  const [advice, setAdvice] = React.useState<BankAdvice | null>(null);
  const companyLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  const companySeal = PlaceHolderImages.find(p => p.id === 'company-seal');

  const [watermarkSettings, setWatermarkSettings] = React.useState<{enabled: boolean, url: string | null}>({enabled: false, url: null});
  const [headerSettings, setHeaderSettings] = React.useState({
    headerLine1: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    headerLine2: 'Gazipur Palli Bidyut Samity-2',
    headerLine3: 'সদর দপ্তর, রাজেন্দ্রপুর, গাজীপুর',
    headerLine4: 'টেলিফোন: ০২-৯২০১৭৮৩, E-mail: gazipbs2@gmail.com',
  });


  useEffect(() => {
    const storedAdvices = localStorage.getItem('advices');
    const advices = storedAdvices ? JSON.parse(storedAdvices) : fallbackAdvices;
    const currentAdvice = advices.find((a: BankAdvice) => a.id === params.id);
    if(currentAdvice) {
        setAdvice(currentAdvice);
    }
    
    const storedSettings = localStorage.getItem('printSettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      if (settings.watermarkEnabled) {
        setWatermarkSettings({
          enabled: true,
          url: settings.watermarkUrl || companyLogo?.imageUrl || null
        });
      }
      setHeaderSettings({
        headerLine1: settings.headerLine1 || 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
        headerLine2: settings.headerLine2 || 'Gazipur Palli Bidyut Samity-2',
        headerLine3: settings.headerLine3 || 'সদর দপ্তর, রাজেন্দ্রপুর, গাজীপুর',
        headerLine4: settings.headerLine4 || 'টেলিফোন: ০২-৯২০১৭৮৩, E-mail: gazipbs2@gmail.com',
      });
    }

  }, [params.id, companyLogo?.imageUrl]);


  useEffect(() => {
    if (advice) {
        // Automatically trigger print dialog when component mounts
        setTimeout(() => {
          window.print();
        }, 500);
    }
  }, [advice]);

  if (!advice) {
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }
  
  return (
    <div 
      className={cn(
        "p-8 max-w-5xl mx-auto font-serif bg-white text-black text-xs print:text-xs",
        watermarkSettings.enabled && "watermark"
      )}
      style={watermarkSettings.url ? { '--watermark-url': `url("${watermarkSettings.url}")` } as React.CSSProperties : {}}
    >
      <div className="relative z-10">
         <header className="grid grid-cols-3 items-center pb-4 font-sans">
          <div className="flex items-center">
            {companyLogo && <Image src={companyLogo.imageUrl} alt="Company Logo" width={80} height={80} data-ai-hint={companyLogo.imageHint} />}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{headerSettings.headerLine1}</h1>
            <h2 className="text-xl">{headerSettings.headerLine2}</h2>
          </div>
          <div className="text-right">
             {companySeal && <Image src={companySeal.imageUrl} alt="Company Seal" width={70} height={70} data-ai-hint={companySeal.imageHint} className="ml-auto opacity-70" />}
            <p className="text-xs">{headerSettings.headerLine3}</p>
            <p className="text-xs">{headerSettings.headerLine4}</p>
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
              <p className="font-bold">Inword : {amountToWords(advice.totalAmount)}</p>
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
        <div className="text-center mt-12 text-xs text-gray-500 no-print">
          <p>BankAdviceFlow - A computer-generated document.</p>
        </div>
      </div>
    </div>
  );
}
