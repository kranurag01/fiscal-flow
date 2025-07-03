'use server';

/**
 * @fileOverview Predicts potential upcoming expenses based on past transaction data.
 *
 * - predictFutureExpenses - A function that predicts future expenses.
 * - PredictFutureExpensesInput - The input type for the predictFutureExpenses function.
 * - PredictFutureExpensesOutput - The return type for the predictFutureExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  amount: z.number().describe('The amount of the transaction.'),
  category: z.string().describe('The category of the transaction (e.g., groceries, rent).'),
  description: z.string().optional().describe('A description of the transaction.'),
});

const PredictFutureExpensesInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('A list of past transactions.'),
});
export type PredictFutureExpensesInput = z.infer<typeof PredictFutureExpensesInputSchema>;

const PredictedExpenseSchema = z.object({
  category: z.string().describe('The category of the predicted expense.'),
  description: z.string().describe('The description of the predicted expense.'),
  amount: z.number().describe('The predicted amount of the expense.'),
  date: z.string().describe('The predicted date of the expense (YYYY-MM-DD).'),
  confidence: z.number().describe('A confidence score (0-1) for the prediction.'),
});

const PredictFutureExpensesOutputSchema = z.object({
  predictedExpenses: z.array(PredictedExpenseSchema).describe('A list of predicted future expenses.'),
  summary: z.string().describe('A summary of the predicted expenses and key trends.'),
});
export type PredictFutureExpensesOutput = z.infer<typeof PredictFutureExpensesOutputSchema>;

export async function predictFutureExpenses(input: PredictFutureExpensesInput): Promise<PredictFutureExpensesOutput> {
  return predictFutureExpensesFlow(input);
}

const analyzeSpendingPatterns = ai.defineTool({
  name: 'analyzeSpendingPatterns',
  description: 'Analyzes past transaction data to identify spending patterns and trends.',
  inputSchema: z.object({
    transactions: z.array(TransactionSchema).describe('A list of past transactions.'),
  }),
  outputSchema: z.object({
    spendingPatterns: z.string().describe('A description of the identified spending patterns and trends.'),
  }),
  async (input) => {
    // Placeholder implementation for analyzing spending patterns.
    // In a real application, this would involve analyzing the transaction data
    // to identify trends, seasonality, and other patterns.
    return {
      spendingPatterns: `Analyzed ${input.transactions.length} transactions.  Spending patterns will be inserted here after analyzing transaction data.`,
    };
  },
});

const predictExpensesPrompt = ai.definePrompt({
  name: 'predictExpensesPrompt',
  input: {schema: PredictFutureExpensesInputSchema},
  output: {schema: PredictFutureExpensesOutputSchema},
  tools: [analyzeSpendingPatterns],
  prompt: `You are a financial advisor. Analyze the user's past transactions and spending patterns to predict potential upcoming expenses.

  Use the analyzeSpendingPatterns tool to identify spending patterns and trends from the transaction data.

  Based on the analyzed spending patterns and trends, predict potential upcoming expenses, including the category, description, amount, and date of each expense. Also include a confidence score (0-1) for each prediction.

  Finally, provide a summary of the predicted expenses and key trends.

  Here are the user's past transactions:
  Transactions: {{{transactions}}}
  `,
});

const predictFutureExpensesFlow = ai.defineFlow(
  {
    name: 'predictFutureExpensesFlow',
    inputSchema: PredictFutureExpensesInputSchema,
    outputSchema: PredictFutureExpensesOutputSchema,
  },
  async input => {
    const {output} = await predictExpensesPrompt(input);
    return output!;
  }
);
