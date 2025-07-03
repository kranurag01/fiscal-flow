'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { budgets as initialBudgets, transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { estimateBudget, EstimateBudgetOutput } from '@/ai/flows/estimate-budget';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Budget } from '@/lib/types';

const budgetFormSchema = z.object({
  category: z.string({ required_error: 'Please select a category.' }),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [open, setOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<EstimateBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  const selectedCategory = form.watch('category');

  const spendingByCategory = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category] += transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, []); // Static for now, would depend on transactions in a real app

  const uniqueCategories = [...new Set(transactions.map((t) => t.category))].filter(
    (cat) => cat !== 'Transfers' && !budgets.some((b) => b.category === cat)
  );

  const handleEstimateBudget = async () => {
    if (!selectedCategory) {
      setError('Please select a category first.');
      return;
    }
    setIsEstimating(true);
    setError(null);
    setEstimation(null);
    try {
      const categoryTransactions = transactions.filter((t) => t.category === selectedCategory);
      const result = await estimateBudget({
        categoryId: selectedCategory,
        transactionHistory: JSON.stringify(categoryTransactions),
      });
      setEstimation(result);
    } catch (e: any) {
      setError(e.message || 'Failed to estimate budget.');
    } finally {
      setIsEstimating(false);
    }
  };

  function onSubmit(data: BudgetFormValues) {
    const newBudget: Budget = {
      id: `bud_${new Date().getTime()}`,
      ...data,
    };
    setBudgets((prev) => [...prev, newBudget]);
    setOpen(false);
    form.reset();
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            form.reset();
            setEstimation(null);
            setError(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
              <DialogDescription>
                Set a new budget for a category. You can also use AI to get an estimate.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {uniqueCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., ₹500.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleEstimateBudget}
                    disabled={isEstimating || !selectedCategory}
                    type="button"
                  >
                    {isEstimating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Estimate with AI
                  </Button>
                  {estimation && (
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertTitle>AI-Powered Estimation</AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                            <span>
                                Suggested: <strong>{formatCurrency(estimation.estimatedBudget)}</strong>.
                            </span>
                            <Button variant="link" size="sm" type="button" onClick={() => form.setValue('amount', estimation.estimatedBudget, { shouldValidate: true })}>Use this amount</Button>
                        </div>
                        <p className="text-xs mt-1">{estimation.reasoning}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Save Budget</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const spent = spendingByCategory[budget.category] || 0;
          const progress = (spent / budget.amount) * 100;
          return (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-base">
                  <span>{budget.category}</span>
                  <span
                    className={`text-sm font-medium ${
                      progress > 100 ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {progress > 100 ? 'Overspent' : 'On Track'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-bold">{formatCurrency(spent)}</span>
                  <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
