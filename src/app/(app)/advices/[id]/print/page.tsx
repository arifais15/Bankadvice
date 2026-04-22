'use client';

import React, { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { advices } from '@/lib/data';
import { formatCurrency, amountToWords } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function PrintAdvicePage() {
  const params = useParams();
  const advice = advices.find((a) => a.id === params.id);
  const companyLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  const companySeal = PlaceHolderImages.find(p => p.id === 'company-seal');

  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  if (!advice) {
    useEffect(() => notFound(), []);
    return null;
  }
  
  return (
    <div className="p-8 max-w-5xl mx-auto font-serif bg-white text-black text-sm print:text-xs">
      <header className="flex justify-between items-start pb-4">
        <div className="flex items-center gap-4">
          {companyLogo && <Image src={companyLogo.imageUrl} alt="Company Logo" width={80} height={80} data-ai-hint={companyLogo.imageHint} />}
          <div>
            <h1 className="text-2xl font-bold font-sans">গাজীপুর পল্লী বিদ্যুৎ সমিতি-২</h1>
            <h2 className="text-xl font-sans">Gazipur Palli Bidyut Samity-2</h2>
          </div>
        </div>
        <div className="text-right">
          <div className="flex justify-end items-center gap-2">
            <div className="font-sans">
              <p className="font-bold">সদর দপ্তর</p>
              <p>রাজেন্দ্রপুর গাজীপুর</p>
              <p>টেলিফোন: ০২-৯২০১৭৮৩</p>
              <p>E-mail: gazipbs2@gmail.com</p>
            </div>
             {companySeal && <Image src={companySeal.imageUrl} alt="Company Seal" width={70} height={70} data-ai-hint={companySeal.imageHint}/>}
          </div>
        </div>
      </header>

      <div className="border-t-2 border-b-2 border-black my-2"></div>

      <div className="flex justify-between mt-4">
        <div>
          <p>Ref.No: {advice.refNo}</p>
        </div>
        <div className="text-right">
          <p>Date: {new Date(advice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold">Advice No: {advice.adviceNumber}</p>
        </div>
      </div>

      <main className="mt-8">
        <div className="space-y-1">
            <p>Manager</p>
            <p>{advice.bankName}</p>
            <p>{advice.bankBranch}</p>
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
                <th className="p-1 border-r border-black font-semibold">SL</th>
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
                  <td className="p-1 border-r border-black">{item.employee.id}</td>
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
  );
}
