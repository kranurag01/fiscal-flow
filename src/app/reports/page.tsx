
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { accounts, budgets, transactions } from '@/lib/data';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { subDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AnalyticsPage() {
  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return transactionDate >= start && transactionDate <= end;
  });

  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netEarnings = monthlyIncome - monthlyExpense;

  const last30Days = subDays(new Date(), 30);
  const dailySummaryData = transactions
    .filter(t => new Date(t.date) >= last30Days)
    .reduce((acc, curr) => {
      const day = format(new Date(curr.date), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = { date: day, income: 0, expense: 0 };
      }
      if (curr.type === 'income') {
        acc[day].income += curr.amount;
      } else {
        acc[day].expense += curr.amount;
      }
      return acc;
    }, {} as Record<string, { date: string, income: number, expense: number }>);
  
  const dailySummaryChartData = Object.values(dailySummaryData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
    }));

  const budgetSummaryData = budgets.map(b => ({
    name: b.category,
    spent: b.spent,
    remaining: Math.max(0, b.amount - b.spent),
  }));

  const accountBalanceData = (() => {
    const dateInterval = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    let balances = accounts.reduce((acc, account) => {
      acc[account.id] = account.balance;
      return acc;
    }, {} as Record<string, number>);

    const dailyData = [];

    for (let i = dateInterval.length - 1; i >= 0; i--) {
      const date = dateInterval[i];
      const formattedDate = format(date, 'MMM dd');

      const dataPoint: Record<string, string | number> = { date: formattedDate };
      for (const accId in balances) {
        dataPoint[accId] = balances[accId];
      }
      dailyData.push(dataPoint);

      const txnsOnThisDay = transactions.filter(
        (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      txnsOnThisDay.forEach((t) => {
        if (t.type === 'income') {
          balances[t.accountId] -= t.amount;
        } else {
          balances[t.accountId] += t.amount;
        }
      });
    }

    return dailyData.reverse();
  })();

  const netWorthOverTimeData = (() => {
    const dateInterval = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    let currentNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const dailyData: { date: string; netWorth: number }[] = [];

    // Iterate backwards from today to 30 days ago
    for (let i = dateInterval.length - 1; i >= 0; i--) {
      const date = dateInterval[i];
      const formattedDate = format(date, 'MMM dd');
      
      // Push the net worth for the current day
      dailyData.push({ date: formattedDate, netWorth: currentNetWorth });

      // Find transactions for this day
      const txnsOnThisDay = transactions.filter(
        (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      // Adjust net worth by reversing the day's transactions
      txnsOnThisDay.forEach((t) => {
        // We ignore transfers for net worth calculation as it's an internal movement of funds
        if (t.category === 'Transfers') return;

        if (t.type === 'income') {
          // To go back in time, we subtract income
          currentNetWorth -= t.amount;
        } else {
          // To go back in time, we add back expenses
          currentNetWorth += t.amount;
        }
      });
    }
    // The data is in reverse chronological order, so reverse it
    return dailyData.reverse();
  })();

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
            <p className="text-xs text-muted-foreground">Total value of your assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Earnings (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netEarnings >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(netEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">Income minus expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Income (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">Total earnings this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expenses (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpense)}</div>
            <p className="text-xs text-muted-foreground">Total spending this month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Balances Over Time</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accountBalanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => formatCurrency(value, 'USD', 0)} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'hsl(var(--muted))'}} />
                <Legend />
                {accounts.map((account, index) => (
                  <Area key={account.id} type="monotone" dataKey={account.id} name={account.name} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.3} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Worth Over Time</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => formatCurrency(value, 'USD', 0)} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'hsl(var(--muted))'}} />
                <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>Income vs. Expense for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySummaryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis tickFormatter={(value) => formatCurrency(value, 'USD', 0)} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'hsl(var(--muted))'}}/>
                <Legend />
                <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--chart-2))" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
            <CardDescription>How you're tracking against your budgets</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetSummaryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, 'USD', 0)} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={100} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'hsl(var(--muted))'}} />
                <Legend />
                <Bar dataKey="spent" name="Spent" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="remaining" name="Remaining" stackId="a" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
