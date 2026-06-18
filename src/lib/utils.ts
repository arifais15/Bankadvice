import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return 'Tk. ' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generates a formatted advice number.
 * @param sequence The integer sequence number for the advice.
 */
export function generateAdviceNumber(sequence: number): string {
  return `AO-${sequence}`;
}

export function amountToWords(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWords = (num: number): string => {
        if (num < 20) {
            return ones[num];
        }
        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        }
        if (num < 1000) {
            return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numToWords(num % 100) : '');
        }
        if (num < 100000) {
            return numToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
        }
        if (num < 10000000) {
            return numToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numToWords(num % 100000) : '');
        }
        return numToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numToWords(num % 10000000) : '');

    };

    if (amount === 0) return 'Zero Taka Only';
    
    const taka = Math.floor(amount);
    const poisha = Math.round((amount - taka) * 100);

    let words = numToWords(taka) + ' Taka';
    
    if (poisha > 0) {
        words += ' and ' + numToWords(poisha) + ' Poisha';
    }

    return words.replace(/\s\s+/g, ' ').trim() + ' Only';
}
