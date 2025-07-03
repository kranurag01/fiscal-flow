'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { accounts, accountTypes } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CreditCard, Landmark, PlusCircle, Wallet, HelpCircle, TrendingUp, BadgePercent, Home, Car, PiggyBank, Scale } from 'lucide-react';

const iconMap: { [key: string]: React.ReactNode } = {
  Landmark: <Landmark className="h-6 w-6 text-muted-foreground" />,
  Banknote: <Banknote className="h-6 w-6 text-muted-foreground" />,
  CreditCard: <CreditCard className="h-6 w-6 text-muted-foreground" />,
  Wallet: <Wallet className="h-6 w-6 text-muted-foreground" />,
  TrendingUp: <TrendingUp className="h-6 w-6 text-muted-foreground" />,
  BadgePercent: <BadgePercent className="h-6 w-6 text-muted-foreground" />,
  Home: <Home className="h-6 w-6 text-muted-foreground" />,
  Car: <Car className="h-6 w-6 text-muted-foreground" />,
  PiggyBank: <PiggyBank className="h-6 w-6 text-muted-foreground" />,
  Scale: <Scale className="h-6 w-6 text-muted-foreground" />,
  HelpCircle: <HelpCircle className="h-6 w-6 text-muted-foreground" />,
};


export default function AccountsPage() {
  const getAccountType = (typeId: string) => accountTypes.find(t => t.id === typeId);

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
        {accounts.map((account) => {
          const accountType = getAccountType(account.typeId);
          const icon = accountType ? iconMap[accountType.icon] || iconMap['HelpCircle'] : iconMap['HelpCircle'];

          return (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              <p className="text-xs text-muted-foreground capitalize">{accountType?.name || 'Unknown'}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>
    </div>
  );
}
