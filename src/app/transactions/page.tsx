
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { transactions as initialTransactions, accounts } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Download, PlusCircle, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Papa from 'papaparse';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'Type is required.' }),
  category: z.string().optional(),
  accountId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'income' || data.type === 'expense') {
    if (!data.category || data.category.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required.',
        path: ['category'],
      });
    }
    if (!data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Account is required.',
        path: ['accountId'],
      });
    }
  } else if (data.type === 'transfer') {
    if (!data.fromAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'From account is required.',
        path: ['fromAccountId'],
      });
    }
    if (!data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'To account is required.',
        path: ['toAccountId'],
      });
    }
    if (data.fromAccountId && data.toAccountId && data.fromAccountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Accounts cannot be the same.',
        path: ['toAccountId'],
      });
    }
  }
});

type TransactionFormValues = z.infer<typeof formSchema>;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      type: 'expense',
    },
  });

  const transactionType = form.watch('type');

  const getAccountName = (accountId: string) => {
    return accounts.find((acc) => acc.id === accountId)?.name || 'N/A';
  };
  
  function onSubmit(data: TransactionFormValues) {
    if (data.type === 'transfer') {
      const transferId = `transfer_${new Date().getTime()}`;
      const fromAccountName = getAccountName(data.fromAccountId!);
      const toAccountName = getAccountName(data.toAccountId!);

      const expenseTransaction: Transaction = {
        id: `txn_${new Date().getTime()}_exp`,
        date: new Date().toISOString(),
        description: data.description || `Transfer to ${toAccountName}`,
        amount: data.amount,
        type: 'expense',
        category: 'Transfers',
        accountId: data.fromAccountId!,
        transferId,
      };

      const incomeTransaction: Transaction = {
        id: `txn_${new Date().getTime()}_inc`,
        date: new Date().toISOString(),
        description: data.description || `Transfer from ${fromAccountName}`,
        amount: data.amount,
        type: 'income',
        category: 'Transfers',
        accountId: data.toAccountId!,
        transferId,
      };
      setTransactions((prev) => [incomeTransaction, expenseTransaction, ...prev]);

    } else {
        const newTransaction: Transaction = {
          id: `txn_${new Date().getTime()}`,
          date: new Date().toISOString(),
          description: data.description,
          amount: data.amount,
          type: data.type as 'income' | 'expense',
          category: data.category!,
          accountId: data.accountId!,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    }
    setOpenAdd(false);
    form.reset({
        description: '',
        type: 'expense',
    });
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Amount'];
    const csvRows = [headers.join(',')];

    transactions.forEach(transaction => {
      const signedAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      const row = [
        new Date(transaction.date).toLocaleDateString(),
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.category,
        `"${getAccountName(transaction.accountId).replace(/"/g, '""')}"`,
        signedAmount,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleFileParse = (file: File) => {
    setParsedData([]);
    setImportError(null);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const requiredColumns = ['Date', 'Description', 'Category', 'Account', 'Amount'];
            if (!results.meta.fields || !requiredColumns.every(col => results.meta.fields!.includes(col))) {
                setImportError(`Invalid CSV format. Required columns are: ${requiredColumns.join(', ')}`);
                return;
            }
            
            const newTransactions: Transaction[] = [];
            const errors: string[] = [];

            (results.data as any[]).forEach((row, index) => {
                if (Object.values(row).every(val => val === "")) return; // Skip empty rows

                const account = accounts.find((acc) => acc.name === row.Account);
                if (!account) {
                    errors.push(`Row ${index + 2}: Account "${row.Account}" not found.`);
                    return;
                }

                const amount = parseFloat(row.Amount);
                if (isNaN(amount)) {
                    errors.push(`Row ${index + 2}: Invalid amount "${row.Amount}".`);
                    return;
                }

                if (row.Category === 'Transfers') {
                    errors.push(`Row ${index + 2}: CSV import for "Transfers" is not supported. Please add transfers manually.`);
                    return;
                }
                
                newTransactions.push({
                    id: `imported_${new Date().getTime()}_${index}`,
                    date: new Date(row.Date).toISOString(),
                    description: row.Description,
                    amount: Math.abs(amount),
                    type: amount >= 0 ? 'income' : 'expense',
                    category: row.Category,
                    accountId: account.id,
                });
            });

            if (errors.length > 0) {
                setImportError(errors.join('\n'));
                setParsedData([]);
            } else {
                setParsedData(newTransactions);
                setImportError(null);
            }
        },
        error: (error: any) => {
            setImportError(error.message);
        },
    });
  }

  const handleConfirmImport = () => {
    setTransactions(prev => [...parsedData, ...prev]);
    setOpenImport(false);
    setParsedData([]);
    setImportError(null);
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          
          <Dialog open={openImport} onOpenChange={setOpenImport}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Import Transactions</DialogTitle>
                  <DialogDescription>
                      Select a CSV file to import. Columns must be: Date, Description, Category, Account, Amount.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => e.target.files && handleFileParse(e.target.files[0])}
                  />
                  {importError && (
                      <Alert variant="destructive">
                          <AlertTitle>Import Error</AlertTitle>
                          <AlertDescription className="whitespace-pre-wrap text-xs">
                              {importError}
                          </AlertDescription>
                      </Alert>
                  )}
                  {parsedData.length > 0 && !importError && (
                      <>
                          <p className="text-sm font-medium">Previewing {parsedData.length} transactions:</p>
                          <ScrollArea className="h-64 rounded-md border">
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Date</TableHead>
                                          <TableHead>Description</TableHead>
                                          <TableHead>Category</TableHead>
                                          <TableHead>Account</TableHead>
                                          <TableHead className="text-right">Amount</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {parsedData.map((transaction) => (
                                      <TableRow key={transaction.id}>
                                          <TableCell>
                                          {new Date(transaction.date).toLocaleDateString()}
                                          </TableCell>
                                          <TableCell>{transaction.description}</TableCell>
                                          <TableCell>
                                              <Badge variant="outline">{transaction.category}</Badge>
                                          </TableCell>
                                          <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                                          <TableCell
                                          className={`text-right font-semibold ${
                                              transaction.type === 'income'
                                              ? 'text-primary'
                                              : 'text-destructive'
                                          }`}
                                          >
                                          {transaction.type === 'income' ? '+' : '-'}
                                          {formatCurrency(transaction.amount)}
                                          </TableCell>
                                      </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </ScrollArea>
                      </>
                  )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenImport(false)}>Cancel</Button>
                  <Button onClick={handleConfirmImport} disabled={parsedData.length === 0 || !!importError}>
                      Import {parsedData.length} transactions
                  </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details of your new transaction.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Coffee, Transfer to savings" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5.50" {...field} />
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
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {transactionType === 'transfer' ? (
                    <>
                      <FormField
                        control={form.control}
                        name="fromAccountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Account</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map(account => (
                                   <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="toAccountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Account</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map(account => (
                                   <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                       <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Food & Drink" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map(account => (
                                   <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <DialogFooter>
                    <Button type="submit">Add Transaction</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isTransfer =
                transaction.category === 'Transfers' && transaction.transferId;
              const relatedTransaction = isTransfer
                ? transactions.find(
                    (t) =>
                      t.transferId === transaction.transferId &&
                      t.id !== transaction.id
                  )
                : undefined;

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium flex items-center">
                    {transaction.description}
                    {isTransfer && relatedTransaction && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-2 cursor-pointer">
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {transaction.type === 'expense'
                                ? `Transfer to: ${getAccountName(
                                    relatedTransaction.accountId
                                  )}`
                                : `Transfer from: ${getAccountName(
                                    relatedTransaction.accountId
                                  )}`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      transaction.type === 'income'
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
