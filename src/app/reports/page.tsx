'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell, Line, LineChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { subDays, format } from 'date-fns';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ReportsPage() {
  const last30Days = subDays(new Date(), 30);
  const recentTransactions = transactions.filter(t => new Date(t.date) >= last30Days);
  
  // Income vs Expense Data
  const incomeVsExpenseData = recentTransactions.reduce((acc, curr) => {
    const day = format(new Date(curr.date), 'MMM dd');
    if (!acc[day]) {
      acc[day] = { date: day, income: 0, expense: 0 };
    }
    if (curr.type === 'income') {
      acc[day].income += curr.amount;
    } else if (curr.type === 'expense') {
      acc[day].expense += curr.amount;
    }
    return acc;
  }, {} as Record<string, { date: string, income: number, expense: number }>);
  const incomeVsExpenseChartData = Object.values(incomeVsExpenseData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  // Spending by Category Data
  const spendingByCategory = recentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(spendingByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // Cash Flow Data
  let runningBalance = 25000; // Starting with a mock balance
  const cashFlowData = incomeVsExpenseChartData.map(d => {
    runningBalance = runningBalance + d.income - d.expense;
    return {
      date: d.date,
      balance: runningBalance,
    }
  });


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Tabs defaultValue="income-expense" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income-expense">Income vs. Expense</TabsTrigger>
          <TabsTrigger value="spending-category">Spending by Category</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income-expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, 'USD', 0)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" />
                  <Bar dataKey="expense" fill="hsl(var(--chart-2))" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending-category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value, 'USD', 0)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" name="Account Balance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
