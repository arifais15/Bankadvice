'use server';
/**
 * @fileOverview A Genkit flow for generating descriptive text for bank advice documents.
 *
 * - generateAdviceNarrative - A function that handles the generation of bank advice narrative.
 * - GenerateAdviceNarrativeInput - The input type for the generateAdviceNarrative function.
 * - GenerateAdviceNarrativeOutput - The return type for the generateAdviceNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdviceNarrativeInputSchema = z.object({
  purpose: z
    .string()
    .describe('The purpose of the bank advice, e.g., "Payroll", "Vendor Payment", "Expense Reimbursement".'),
  context: z
    .string()
    .describe('Additional context or details for the bank advice, e.g., "for October salaries", "invoice #12345", "travel expenses for Q3".'),
});
export type GenerateAdviceNarrativeInput = z.infer<
  typeof GenerateAdviceNarrativeInputSchema
>;

const GenerateAdviceNarrativeOutputSchema = z.object({
  narrative: z.string().describe('The suggested descriptive text for the bank advice.'),
});
export type GenerateAdviceNarrativeOutput = z.infer<
  typeof GenerateAdviceNarrativeOutputSchema
>;

export async function generateAdviceNarrative(
  input: GenerateAdviceNarrativeInput
): Promise<GenerateAdviceNarrativeOutput> {
  return generateAdviceNarrativeFlow(input);
}

const generateAdviceNarrativePrompt = ai.definePrompt({
  name: 'generateAdviceNarrativePrompt',
  input: {schema: GenerateAdviceNarrativeInputSchema},
  output: {schema: GenerateAdviceNarrativeOutputSchema},
  prompt: `You are an AI assistant that helps compose professional bank advice documents.

Based on the following purpose and context, generate a concise and descriptive narrative for a bank advice document. The narrative should be suitable for official financial communication.

Purpose: {{{purpose}}}
Context: {{{context}}}

Suggested Narrative:`,
});

const generateAdviceNarrativeFlow = ai.defineFlow(
  {
    name: 'generateAdviceNarrativeFlow',
    inputSchema: GenerateAdviceNarrativeInputSchema,
    outputSchema: GenerateAdviceNarrativeOutputSchema,
  },
  async (input) => {
    const {output} = await generateAdviceNarrativePrompt(input);
    return output!;
  }
);
