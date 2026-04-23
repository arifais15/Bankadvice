'use client';

import React, { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { PrintSettings } from '@/types';

export function Logo({ className }: { className?: string }) {
  const fallbackLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  const [settings, setSettings] = useState<PrintSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('printSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Could not parse print settings from localStorage", error);
    }
    setIsLoading(false);
  }, []);
  
  const finalLogoUrl = settings?.companyLogoUrl || fallbackLogo?.imageUrl;
  
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 font-semibold text-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
         {isLoading ? null : finalLogoUrl ? (
            <Image src={finalLogoUrl} alt="Logo" width={32} height={32} data-ai-hint={fallbackLogo?.imageHint || 'company logo'} className="rounded-sm object-contain" />
         ) : (
            <Landmark className="h-5 w-5 text-primary-foreground" />
         )}
      </div>
      <span className="text-lg group-data-[collapsible=icon]:hidden">
        BankAdviceFlow
      </span>
    </div>
  );
}
