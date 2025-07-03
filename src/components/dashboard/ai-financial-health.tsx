'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { analyzeSpendingHabits, AnalyzeSpendingHabitsOutput } from '@/ai/flows/analyze-spending';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function AiFinancialHealth() {
  const [insight, setInsight] = useState<AnalyzeSpendingHabitsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSpendingHabits({
        financialTransactions: JSON.stringify(transactions.slice(0, 20)),
      });
      setInsight(result);
    } catch (e: any) {
      setError(e.message || 'Failed to get insights.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Financial Health</CardTitle>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Analyzing spending...</p>
          </div>
        )}
        {error && (
            <div className="text-center p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="link" onClick={fetchInsight}>Try again</Button>
            </div>
        )}
        {insight && <p className="text-sm text-muted-foreground">{insight.spendingInsights}</p>}
      </CardContent>
    </Card>
  );
}
