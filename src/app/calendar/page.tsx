
'use client';

import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { transactions as allTransactions, accounts as allAccounts, accountTypes as allAccountTypes } from '@/lib/data';
import type { Transaction, Account, AccountType } from '@/lib/types';
import { format, isSameDay, isAfter } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Banknote, CreditCard, Landmark, Wallet, HelpCircle, TrendingUp, BadgePercent, Home, Car, PiggyBank, Scale, ArrowRightLeft } from 'lucide-react';


const iconMap: { [key: string]: React.ReactNode } = {
  Landmark: <Landmark className="h-5 w-5 text-muted-foreground" />,
  Banknote: <Banknote className="h-5 w-5 text-muted-foreground" />,
  CreditCard: <CreditCard className="h-5 w-5 text-muted-foreground" />,
  Wallet: <Wallet className="h-5 w-5 text-muted-foreground" />,
  TrendingUp: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
  BadgePercent: <BadgePercent className="h-5 w-5 text-muted-foreground" />,
  Home: <Home className="h-5 w-5 text-muted-foreground" />,
  Car: <Car className="h-5 w-5 text-muted-foreground" />,
  PiggyBank: <PiggyBank className="h-5 w-5 text-muted-foreground" />,
  Scale: <Scale className="h-5 w-5 text-muted-foreground" />,
  HelpCircle: <HelpCircle className="h-5 w-5 text-muted-foreground" />,
};


export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dailyData = useMemo(() => {
    if (!selectedDate) {
      return {
        transactionsForDay: [],
        balances: [],
        netWorth: 0,
      };
    }

    // 1. Filter transactions for the selected day
    const transactionsForDay = allTransactions.filter((t) =>
      isSameDay(new Date(t.date), selectedDate)
    );

    // 2. Calculate historical balances
    const historicalBalances: { [key: string]: number } = allAccounts.reduce((acc, account) => {
        acc[account.id] = account.balance;
        return acc;
    }, {} as { [key: string]: number });

    const futureTransactions = allTransactions
      .filter((t) => isAfter(new Date(t.date), selectedDate))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    futureTransactions.forEach((t) => {
      // Reverse the transaction to get the past balance
      if (t.type === 'income') {
        historicalBalances[t.accountId] -= t.amount;
      } else { // expense
        historicalBalances[t.accountId] += t.amount;
      }
    });

    const balances = allAccounts.map(acc => ({
        ...acc,
        balance: historicalBalances[acc.id] || 0
    }));

    // 3. Calculate net worth for that day
    const netWorth = balances.reduce((sum, account) => {
      const accountType = allAccountTypes.find(at => at.id === account.typeId);
      if (accountType?.classification === 'asset') {
        return sum + account.balance;
      } else if (accountType?.classification === 'liability') {
        // For liabilities, a negative balance is a debt, so we add it.
        return sum + account.balance;
      }
      return sum;
    }, 0);

    return { transactionsForDay, balances, netWorth };
  }, [selectedDate]);

  const { transactionsForDay, balances, netWorth } = dailyData;
  
  const getAccountName = (accountId: string) => {
    return allAccounts.find((acc) => acc.id === accountId)?.name || 'N/A';
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
       <h2 className="text-3xl font-bold tracking-tight">Calendar View</h2>
       <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card>
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="w-full"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                 {selectedDate ? (
                    <>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Summary for {format(selectedDate, 'PPP')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <Scale className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Net Worth</p>
                                    <p className="text-lg font-bold">{formatCurrency(netWorth)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium leading-none">Transactions</p>
                                    <p className="text-lg font-bold">{transactionsForDay.length} entries</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Balances</CardTitle>
                            <CardDescription>Balances at the end of the selected day.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-48">
                                <div className="space-y-4">
                                    {balances.map(account => {
                                        const accountType = allAccountTypes.find(at => at.id === account.typeId);
                                        const icon = accountType ? iconMap[accountType.icon] || iconMap['HelpCircle'] : iconMap['HelpCircle'];

                                        return (
                                        <div key={account.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {icon}
                                                <div>
                                                    <p className="font-medium">{account.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {accountType?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-semibold">{formatCurrency(account.balance)}</span>
                                        </div>
                                    )})}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>All transactions recorded on this day.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                                {transactionsForDay.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Account</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactionsForDay.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">{transaction.description}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{transaction.category}</Badge>
                                                </TableCell>
                                                <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                                                <TableCell className={`text-right font-semibold ${ transaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <p>No transactions on this date.</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-muted-foreground">Select a date to see the daily summary.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
       </div>
    </div>
  );
}

