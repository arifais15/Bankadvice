'use client';

import type { Employee, BankAdvice } from '@/types';
import { advices as initialAdvicesData, employees as initialEmployeesData } from '@/lib/data';

function getFromStorage<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') {
    return initialData;
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return initialData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
}

export const getAdvices = (): BankAdvice[] => getFromStorage<BankAdvice[]>('bankAdvices', initialAdvicesData);
export const saveAdvices = (advices: BankAdvice[]) => saveToStorage('bankAdvices', advices);

export const getEmployees = (): Employee[] => getFromStorage<Employee[]>('bankEmployees', initialEmployeesData);
export const saveEmployees = (employees: Employee[]) => saveToStorage('bankEmployees', employees);
