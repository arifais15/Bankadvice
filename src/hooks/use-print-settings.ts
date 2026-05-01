'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import type { PrintSettings } from '@/types';
import { printSettings as defaultSettings } from '@/lib/settings';

export function usePrintSettings() {
  const firestore = useFirestore();
  const settingsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'print');
  }, [firestore]);

  const { data, isLoading } = useDoc<PrintSettings>(settingsRef as any);

  return { 
    settings: data ? { ...defaultSettings, ...data } : defaultSettings, 
    isLoading 
  };
}
