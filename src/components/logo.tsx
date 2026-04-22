import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 font-semibold text-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Landmark className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-lg group-data-[collapsible=icon]:hidden">
        BankAdviceFlow
      </span>
    </div>
  );
}
