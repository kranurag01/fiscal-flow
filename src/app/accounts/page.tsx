'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { accounts as initialAccounts, accountTypes } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CreditCard, Landmark, PlusCircle, Wallet, HelpCircle, TrendingUp, BadgePercent, Home, Car, PiggyBank, Scale } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Account } from '@/lib/types';


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

const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required.'),
  typeId: z.string({ required_error: 'Account type is required.' }),
  balance: z.coerce.number(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;


export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      balance: 0,
    },
  });

  function onSubmit(data: AccountFormValues) {
    const newAccount: Account = {
      id: `acc_${new Date().getTime()}`,
      ...data,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setIsDialogOpen(false);
    form.reset();
  }

  const getAccountType = (typeId: string) => accountTypes.find(t => t.id === typeId);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Enter the details for your new account.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Savings" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map(type => (
                               <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Balance</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Create Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
