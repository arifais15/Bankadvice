import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateAdviceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `BA-${year}-${randomSuffix}`;
}
