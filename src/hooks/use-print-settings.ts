'use client';

import { useState, useEffect } from 'react';
import type { PrintSettings } from '@/types';
import { printSettings as defaultSettings } from '@/lib/settings';

export function usePrintSettings(): { settings: PrintSettings; isLoading: boolean } {
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('printSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Could not load settings from localStorage", error);
      // Fallback to default settings is already handled by initial state
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { settings, isLoading };
}
