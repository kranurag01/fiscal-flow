'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export function SpendingOverview() {
  const data = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find((item) => item.name === date);
      if (existing) {
        existing.total += curr.amount;
      } else {
        acc.push({ name: date, total: curr.amount });
      }
      return acc;
    }, [] as { name: string; total: number }[])
    .slice(-10); // last 10 days with expenses

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>Your expenses over the last few days.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${formatCurrency(value, 'INR', 0)}`}
            />
            <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
                formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
