import React from 'react';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
       <head>
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 20mm;
            }
          }
        `}</style>
      </head>
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
