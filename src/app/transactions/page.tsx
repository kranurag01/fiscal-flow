
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  transactions as initialTransactions,
  accounts,
  transactionCategories,
  transactionLabels,
} from '@/lib/data';
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
  subcategory: z.string().optional(),
  label: z.string().optional(),
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


function TransactionsPageContent() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importAccountId, setImportAccountId] = useState<string | undefined>();
  const [importFile, setImportFile] = useState<File | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setOpenAdd(true);
      router.replace('/transactions', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (importFile && importAccountId) {
        handleFileParse(importFile, importAccountId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importFile, importAccountId]);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      type: 'expense',
    },
  });

  const transactionType = form.watch('type');
  const selectedCategory = form.watch('category');

  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryData = transactionCategories.find(c => c.name === selectedCategory);
    return categoryData?.subcategories || [];
  }, [selectedCategory]);

  useEffect(() => {
    form.setValue('subcategory', '');
  }, [selectedCategory, form]);


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
          subcategory: data.subcategory,
          label: data.label,
          accountId: data.accountId!,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    }
    setOpenAdd(false);
    form.reset({
        description: '',
        amount: undefined,
        type: 'expense',
        category: '',
        subcategory: '',
        label: '',
        accountId: undefined,
        fromAccountId: undefined,
        toAccountId: undefined,
    });
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Subcategory', 'Label', 'Account', 'Amount'];
    const csvRows = [headers.join(',')];

    transactions.forEach(transaction => {
      const signedAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      const row = [
        new Date(transaction.date).toLocaleDateString(),
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.category,
        transaction.subcategory || '',
        transaction.label || '',
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
  
  const handleFileParse = (file: File, accountId: string) => {
    setParsedData([]);
    setImportError(null);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const headers = results.meta.fields?.map(h => h.toLowerCase()) || [];
            
            const dateHeader = results.meta.fields?.[headers.indexOf('date')];
            const descHeader = results.meta.fields?.[headers.indexOf('description')];
            const costHeader = results.meta.fields?.[headers.find(h => h.includes('cost') || h.includes('amount'))!];
            const categoryHeader = results.meta.fields?.[headers.indexOf('category')];

            if (!dateHeader || !descHeader || !costHeader) {
                setImportError(`Invalid CSV format. Required columns must contain: Date, Description, and Cost/Amount.`);
                return;
            }
            
            const newTransactions: Transaction[] = [];
            const errors: string[] = [];

            (results.data as any[]).forEach((row, index) => {
                if (Object.values(row).every(val => val === "")) return; // Skip empty rows

                const amount = parseFloat(row[costHeader]);
                if (isNaN(amount)) {
                    errors.push(`Row ${index + 2}: Invalid amount "${row[costHeader]}".`);
                    return;
                }
                
                newTransactions.push({
                    id: `imported_${new Date().getTime()}_${index}`,
                    date: new Date(row[dateHeader]).toISOString(),
                    description: row[descHeader],
                    amount: Math.abs(amount),
                    // For simplified imports (like Splitwise), we assume it's an expense.
                    type: 'expense', 
                    category: row[categoryHeader] || 'Reimbursement', // Use category if present, else default
                    accountId: accountId,
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
    setImportFile(null);
    setImportAccountId(undefined);
  }

  const handleDownloadTemplate = () => {
    const csvContent = [
      "Date,Description,Cost",
      "2024-07-29,Lunch with client,-25.50",
      "2024-07-28,Monthly Salary,5000",
      "2024-07-27,New Keyboard,-150",
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          
          <Dialog open={openImport} onOpenChange={(isOpen) => {
            setOpenImport(isOpen);
            if (!isOpen) {
                setParsedData([]);
                setImportError(null);
                setImportFile(null);
                setImportAccountId(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Import Transactions</DialogTitle>
                  <DialogDescription>
                      Select an account and a CSV file to import. The file should contain columns for 'Date', 'Description', and 'Cost' or 'Amount'.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="flex justify-start">
                    <Button variant="outline" onClick={handleDownloadTemplate}>
                        <Download className="mr-2 h-4 w-4" /> Download Template
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FormLabel>Destination Account</FormLabel>
                            <Select onValueChange={setImportAccountId} value={importAccountId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                              <SelectContent>
                                {accounts.map(account => (
                                   <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <FormLabel>CSV File</FormLabel>
                            <Input 
                                type="file" 
                                accept=".csv"
                                onChange={(e) => e.target.files && setImportFile(e.target.files[0])}
                                disabled={!importAccountId}
                            />
                        </div>
                  </div>
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
                                          <TableCell
                                            className="text-right font-semibold text-destructive"
                                          >
                                          - {formatCurrency(transaction.amount)}
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
                      Import {parsedData.length > 0 ? parsedData.length : ''} transactions
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {transactionCategories
                                  .filter(c => c.name !== 'Transfers')
                                  .map(cat => (
                                  <SelectItem key={cat.name} value={cat.name}>
                                    {cat.name}
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
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''} disabled={subcategories.length === 0}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subcategories.map(sub => (
                                  <SelectItem key={sub} value={sub}>
                                    {sub}
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
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label (Optional)</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a label" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {transactionLabels.map(label => (
                                  <SelectItem key={label.name} value={label.name}>
                                    {label.name}
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
              <TableHead>Label</TableHead>
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
                    <div>
                      <Badge variant="outline">{transaction.category}</Badge>
                      {transaction.subcategory && <div className="text-xs text-muted-foreground mt-1">{transaction.subcategory}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.label && <Badge variant="secondary">{transaction.label}</Badge>}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsPageContent />
    </Suspense>
  )
}

    

    
