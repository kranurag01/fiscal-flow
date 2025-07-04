'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { transactions, accounts } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export function RecentTransactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getAccountName = (accountId: string) => {
    return accounts.find((acc) => acc.id === accountId)?.name || 'N/A';
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedTransaction(null)}>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>You made {transactions.slice(0, 5).length} recent transactions. Click to view details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map((transaction) => (
                <DialogTrigger asChild key={transaction.id} onClick={() => setSelectedTransaction(transaction)}>
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">{transaction.category}</div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                </DialogTrigger>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedTransaction && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>{selectedTransaction.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-muted-foreground">Amount</span>
              <span className={`font-bold text-right ${selectedTransaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                {selectedTransaction.type === 'income' ? '+' : '-'}
                {formatCurrency(selectedTransaction.amount)}
              </span>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-muted-foreground">Date</span>
              <span className="text-right">{format(new Date(selectedTransaction.date), 'PPP')}</span>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-muted-foreground">Type</span>
              <span className="text-right capitalize">{selectedTransaction.type}</span>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-muted-foreground">Account</span>
              <span className="text-right">{getAccountName(selectedTransaction.accountId)}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-muted-foreground">Category</span>
              <div className="text-right">
                <Badge variant="outline">{selectedTransaction.category}</Badge>
              </div>
            </div>
            {selectedTransaction.subcategory && (
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-muted-foreground">Subcategory</span>
                <span className="text-right">{selectedTransaction.subcategory}</span>
              </div>
            )}
            {selectedTransaction.label && (
               <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-muted-foreground">Label</span>
                <div className="text-right">
                    <Badge variant="secondary">{selectedTransaction.label}</Badge>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
