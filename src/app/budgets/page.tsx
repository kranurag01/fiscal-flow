'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { budgets, transactions } from '@/lib/data';
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
import { Label } from '@/components/ui/label';
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

export default function BudgetsPage() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<EstimateBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uniqueCategories = [...new Set(transactions.map((t) => t.category))];

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

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <Dialog open={open} onOpenChange={setOpen}>
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input id="amount" type="number" className="col-span-3" placeholder="e.g., ₹500.00" />
              </div>
              <div className="col-span-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEstimateBudget}
                  disabled={isEstimating}
                >
                  {isEstimating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Estimate with AI
                </Button>
              </div>
              {estimation && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>AI-Powered Estimation</AlertTitle>
                  <AlertDescription>
                    Suggested budget: <strong>{formatCurrency(estimation.estimatedBudget)}</strong>.
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
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const progress = (budget.spent / budget.amount) * 100;
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
                  <span className="font-bold">{formatCurrency(budget.spent)}</span>
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
