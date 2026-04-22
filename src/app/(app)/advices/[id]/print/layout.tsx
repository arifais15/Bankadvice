import React from 'react';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 20mm;
          }
        }
      `}</style>
      {children}
    </>
  );
}
