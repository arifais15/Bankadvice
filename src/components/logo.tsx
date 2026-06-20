'use client';

import React from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePrintSettings } from '@/hooks/use-print-settings';
import { Skeleton } from '@/components/ui/skeleton';


export function Logo({ className }: { className?: string }) {
  const fallbackLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  const { settings, isLoading } = usePrintSettings();
  
  const finalLogoUrl = settings?.companyLogoUrl || fallbackLogo?.imageUrl;

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 font-semibold text-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
         {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-sm" />
         ) : finalLogoUrl ? (
            <Image src={finalLogoUrl} alt="Logo" width={32} height={32} data-ai-hint={fallbackLogo?.imageHint || 'company logo'} className="rounded-sm object-contain" crossOrigin="anonymous" />
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
