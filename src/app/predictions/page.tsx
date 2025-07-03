'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { predictFutureExpenses, PredictFutureExpensesOutput } from '@/ai/flows/predict-future-expenses';
import { Bot, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PredictionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictFutureExpensesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePredictions = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await predictFutureExpenses({
        transactions: transactions.slice(0, 20), // Use a subset for performance
      });
      setPrediction(result);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Predictions</h2>
        <Button onClick={handleGeneratePredictions} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Generate Predictions
            </>
          )}
        </Button>
      </div>

      {!prediction && !isLoading && (
        <Card className="text-center py-16">
          <CardContent>
            <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Predict Your Financial Future</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click "Generate Predictions" to let our AI analyze your recent transactions
              <br /> and forecast your upcoming expenses.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Prediction Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {prediction && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{prediction.summary}</p>
            </CardContent>
          </Card>
          
          <h3 className="text-2xl font-bold tracking-tight">Predicted Expenses</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prediction.predictedExpenses.map((expense, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{expense.category}</CardTitle>
                  <CardDescription>{expense.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <div className="text-xl font-bold">{formatCurrency(expense.amount)}</div>
                  <div className="text-sm text-muted-foreground">Predicted Date: {expense.date}</div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {Math.round(expense.confidence * 100)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
