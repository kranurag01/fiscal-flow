'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accounts as initialAccounts, transactions } from '@/lib/data';
import type { Account } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CreditCard, Landmark, MoreVertical, Pencil, PlusCircle, Trash2, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const iconMap: { [key: string]: React.ReactNode } = {
  checking: <Landmark className="h-6 w-6 text-muted-foreground" />,
  savings: <Banknote className="h-6 w-6 text-muted-foreground" />,
  'credit-card': <CreditCard className="h-6 w-6 text-muted-foreground" />,
  cash: <Wallet className="h-6 w-6 text-muted-foreground" />,
};

const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required.'),
  type: z.enum(['checking', 'savings', 'credit-card', 'cash'], { required_error: 'Account type is required.' }),
  balance: z.coerce.number(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

function AccountsSettings({ accounts, setAccounts }: { accounts: Account[], setAccounts: React.Dispatch<React.SetStateAction<Account[]>> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'checking',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Add, edit, or remove your financial accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-4">
              {iconMap[account.type]}
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{account.type.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold">{formatCurrency(account.balance)}</span>
                <Button variant="ghost" size="icon" disabled>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
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
                  name="type"
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
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="credit-card">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
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
      </CardFooter>
    </Card>
  );
}

function CategoriesSettings() {
    const uniqueCategories = [...new Set(transactions.map((t) => t.category))].sort();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Categories</CardTitle>
                <CardDescription>Manage your transaction categories and subcategories.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {uniqueCategories.map(category => (
                        <div key={category} className="flex items-center justify-between rounded-md border p-3">
                            <p className="font-medium">{category}</p>
                             <Button variant="ghost" size="icon" disabled>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
             <CardFooter>
                 <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
             </CardFooter>
        </Card>
    )
}

function LabelsSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Labels</CardTitle>
                <CardDescription>Organize your transactions with custom labels.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md">
                    <p>Label management is coming soon.</p>
                </div>
            </CardContent>
        </Card>
    )
}


export default function ConfigurationPage() {
    const [accounts, setAccounts] = useState(initialAccounts);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
            <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="labels">Labels</TabsTrigger>
                </TabsList>
                <TabsContent value="accounts">
                    <AccountsSettings accounts={accounts} setAccounts={setAccounts} />
                </TabsContent>
                <TabsContent value="categories">
                   <CategoriesSettings />
                </TabsContent>
                <TabsContent value="labels">
                    <LabelsSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
