'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { accounts } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CreditCard, Landmark, PlusCircle, Wallet } from 'lucide-react';

const iconMap = {
  checking: <Landmark className="h-6 w-6 text-muted-foreground" />,
  savings: <Banknote className="h-6 w-6 text-muted-foreground" />,
  'credit-card': <CreditCard className="h-6 w-6 text-muted-foreground" />,
  cash: <Wallet className="h-6 w-6 text-muted-foreground" />,
};

export default function AccountsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              {iconMap[account.type]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              <p className="text-xs text-muted-foreground capitalize">{account.type.replace('-', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
