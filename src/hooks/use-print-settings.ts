'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import type { PrintSettings } from '@/types';
import { printSettings as defaultSettings } from '@/lib/settings';

/**
 * Hook to fetch and provide print settings from Firestore with stable identity.
 * Memoizes the combined settings to prevent infinite re-renders in consumer components.
 */
export function usePrintSettings() {
  const firestore = useFirestore();
  
  const settingsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'print');
  }, [firestore]);

  const { data, isLoading } = useDoc<PrintSettings>(settingsRef as any);

  const settings = useMemo(() => {
    if (!data) return defaultSettings;
    return { ...defaultSettings, ...data };
  }, [data]);

  return { 
    settings, 
    isLoading 
  };
}
