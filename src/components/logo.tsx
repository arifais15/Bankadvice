'use client';

import React from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Logo({ className }: { className?: string }) {
  const fallbackLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLogo = () => {
      const storedSettings = localStorage.getItem('printSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setLogoUrl(settings.companyLogoUrl || undefined);
      }
      setIsLoading(false);
    };

    fetchLogo();

    // Listen for changes from the settings page
    const handleStorageChange = () => {
      fetchLogo();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const finalLogoUrl = logoUrl || fallbackLogo?.imageUrl;
  
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
