import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Logo({ className }: { className?: string }) {
  const companyLogo = PlaceHolderImages.find(p => p.id === 'company-logo');
  
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 font-semibold text-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
         {companyLogo ? (
            <Image src={companyLogo.imageUrl} alt="Logo" width={32} height={32} data-ai-hint={companyLogo.imageHint} className="rounded-sm" />
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
