'use client';

import React, { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { advices } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/logo';

export default function PrintAdvicePage() {
  const params = useParams();
  const advice = advices.find((a) => a.id === params.id);

  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  if (!advice) {
    // This will show a 404 on the server render, but the client will handle it.
    // In a real app, you might want a more graceful loading/error state here.
    useEffect(() => notFound(), []);
    return null;
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto font-serif bg-white text-black">
      <header className="flex justify-between items-start pb-4 border-b-2 border-black">
        <Logo />
        <div className="text-right">
          <h1 className="text-3xl font-bold">Bank Payment Advice</h1>
          <p className="text-lg font-mono">{advice.adviceNumber}</p>
        </div>
      </header>

      <main className="mt-8 text-sm">
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <p>The Manager</p>
                <p>Your Bank Name</p>
                <p>Your Bank Branch</p>
            </div>
             <div className="text-right">
                <p><span className="font-bold">DATE:</span> {new Date(advice.date).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div className="mb-8">
            <p className="font-bold mb-4">Subject: {advice.subject}</p>
            <p>Dear Sir,</p>
        </div>
        
        <div className="mb-8 space-y-4">
             <p>{advice.narrative}</p>
             <p>Please credit the accounts of the following employees for the amounts specified against their names.</p>
        </div>

        <div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-semibold">EMPLOYEE NAME</th>
                <th className="p-3 font-semibold">BANK</th>
                <th className="p-3 font-semibold">ACCOUNT NO.</th>
                <th className="p-3 font-semibold text-right">NET PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {advice.employees.map((item) => (
                <tr key={item.employee.id} className="border-b">
                  <td className="p-3 font-medium">{item.employee.name}</td>
                  <td className="p-3">{item.employee.bankName}</td>
                  <td className="p-3 font-mono">{item.employee.accountNumber}</td>
                  <td className="p-3 font-mono text-right">
                    {formatCurrency(item.netPayment)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
                <tr className="font-bold border-t-2 border-black">
                    <td className="p-3" colSpan={2}>Total Number of Employees: {advice.employees.length}</td>
                    <td className="p-3 text-right">Total Amount:</td>
                    <td className="p-3 text-right">{formatCurrency(advice.totalAmount)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </main>

      <footer className="mt-24 grid grid-cols-2 gap-16 text-center text-sm">
          <div>
              <div className="border-t border-black w-48 mx-auto pt-2">
                Prepared by
              </div>
          </div>
          <div>
              <div className="border-t border-black w-48 mx-auto pt-2">
                Authorized Signatory
              </div>
          </div>
      </footer>
       <div className="text-center mt-12 text-xs text-gray-500 no-print">
        <p>This is a computer-generated document. No signature is required.</p>
        <p>BankAdviceFlow</p>
      </div>
    </div>
  );
}
