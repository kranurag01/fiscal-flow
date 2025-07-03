'use server';

/**
 * @fileOverview Budget estimation flow based on past spending habits.
 *
 * - estimateBudget - Estimates a budget for a category based on past spending.
 * - EstimateBudgetInput - The input type for the estimateBudget function.
 * - EstimateBudgetOutput - The return type for the estimateBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateBudgetInputSchema = z.object({
  categoryId: z.string().describe('The ID of the category to estimate the budget for.'),
  transactionHistory: z.string().describe('A JSON string representing the transaction history for the specified category.'),
});
export type EstimateBudgetInput = z.infer<typeof EstimateBudgetInputSchema>;

const EstimateBudgetOutputSchema = z.object({
  estimatedBudget: z.number().describe('The estimated budget amount for the category.'),
  reasoning: z.string().describe('The reasoning behind the estimated budget.'),
});
export type EstimateBudgetOutput = z.infer<typeof EstimateBudgetOutputSchema>;

export async function estimateBudget(input: EstimateBudgetInput): Promise<EstimateBudgetOutput> {
  return estimateBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateBudgetPrompt',
  input: {schema: EstimateBudgetInputSchema},
  output: {schema: EstimateBudgetOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transaction history for category ID {{{categoryId}}} and estimate a reasonable monthly budget.

Transaction History:
{{{transactionHistory}}}

Provide the estimated budget amount and a brief explanation of your reasoning.

Ensure that the estimatedBudget is a floating point number.`,
});

const estimateBudgetFlow = ai.defineFlow(
  {
    name: 'estimateBudgetFlow',
    inputSchema: EstimateBudgetInputSchema,
    outputSchema: EstimateBudgetOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the transaction history to ensure valid JSON
      JSON.parse(input.transactionHistory);
    } catch (e: any) {
      throw new Error(`Invalid JSON format for transactionHistory: ${e.message}`);
    }

    const {output} = await prompt(input);
    return output!;
  }
);
