
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { reminders as initialReminders, accounts } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { BellRing, CalendarIcon, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Reminder } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


const reminderFormSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  frequency: z.enum(['once', 'weekly', 'monthly', 'yearly'], { required_error: 'Frequency is required.' }),
  accountId: z.string({ required_error: 'Account is required.' }),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function RemindersPage() {
  const [reminders, setReminders] = useState(initialReminders);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
  });

  function handleAdd(data: ReminderFormValues) {
    const newReminder: Reminder = {
      id: `rem_${new Date().getTime()}`,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate.toISOString(),
      frequency: data.frequency,
      accountId: data.accountId,
      isPaid: false,
    };
    setReminders((prev) => [newReminder, ...prev].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setAddOpen(false);
    form.reset();
  }

  function handleEdit(data: ReminderFormValues) {
    if (!selectedReminder) return;
    const updatedReminder: Reminder = {
      ...selectedReminder,
      ...data,
      dueDate: data.dueDate.toISOString(),
    }
    setReminders(prev => prev
        .map(r => r.id === selectedReminder.id ? updatedReminder : r)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    );
    setEditOpen(false);
    setSelectedReminder(null);
  }

  function handleDelete() {
    if (!selectedReminder) return;
    setReminders(prev => prev.filter(r => r.id !== selectedReminder.id));
    setDeleteOpen(false);
    setSelectedReminder(null);
  }
  
  const togglePaidStatus = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, isPaid: !r.isPaid } : r));
  };

  const getAccountName = (accountId: string) => {
    return accounts.find((acc) => acc.id === accountId)?.name || 'N/A';
  };
  
  const openEditDialog = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    form.reset({
      ...reminder,
      dueDate: new Date(reminder.dueDate),
    });
    setEditOpen(true);
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
          <Button onClick={() => { form.reset({description: '', frequency: 'once'}); setAddOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reminders.length === 0 ? (
             <Card className="md:col-span-2 lg:col-span-3 text-center py-16">
              <CardContent>
                <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Reminders Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click "Add Reminder" to set up a new payment reminder.
                </p>
              </CardContent>
            </Card>
          ) : (
            reminders.map((reminder) => (
            <Card key={reminder.id} className={cn(reminder.isPaid && 'bg-muted/50')}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{reminder.description}</span>
                  <Badge variant={reminder.isPaid ? "secondary" : "default"} className="capitalize">
                    {reminder.frequency}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Due on {format(new Date(reminder.dueDate), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reminder.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  From: {getAccountName(reminder.accountId)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`paid-switch-${reminder.id}`}
                    checked={reminder.isPaid}
                    onCheckedChange={() => togglePaidStatus(reminder.id)}
                  />
                  <Label htmlFor={`paid-switch-${reminder.id}`}>{reminder.isPaid ? 'Paid' : 'Unpaid'}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(reminder)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedReminder(reminder); setDeleteOpen(true);}}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={isEditOpen ? setEditOpen : setAddOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{isEditOpen ? 'Edit Reminder' : 'Add New Reminder'}</DialogTitle>
                  <DialogDescription>
                    {isEditOpen ? 'Update the details of your reminder.' : 'Set up a new payment reminder or recurring payment.'}
                  </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(isEditOpen ? handleEdit : handleAdd)} className="space-y-4">
                      <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Monthly Rent" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="amount" render={({ field }) => (
                          <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200.00" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="dueDate" render={({ field }) => (
                          <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel>
                              <Popover>
                                  <PopoverTrigger asChild><FormControl>
                                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                  </FormControl></PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus/>
                                  </PopoverContent>
                              </Popover><FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="frequency" render={({ field }) => (
                          <FormItem><FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="once">Once</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="yearly">Yearly</SelectItem>
                                  </SelectContent>
                              </Select><FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="accountId" render={({ field }) => (
                          <FormItem><FormLabel>Account</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {accounts.map(account => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}
                                  </SelectContent>
                              </Select><FormMessage />
                          </FormItem>
                      )} />
                      <DialogFooter>
                          <Button type="submit">{isEditOpen ? 'Save Changes' : 'Add Reminder'}</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the reminder for "{selectedReminder?.description}".</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedReminder(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    