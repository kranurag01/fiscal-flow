
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    accounts as initialAccounts, 
    accountTypes as initialAccountTypes, 
    transactionCategories as initialTransactionCategories,
    transactionLabels as initialTransactionLabels,
} from '@/lib/data';
import type { Account, AccountType, TransactionCategory, TransactionLabel } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CreditCard, Landmark, Pencil, PlusCircle, Trash2, Wallet, TrendingUp, BadgePercent, Home, Car, PiggyBank, Scale, HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const availableIcons = Object.keys(iconMap);

const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required.'),
  typeId: z.string({ required_error: 'Account type is required.' }),
  balance: z.coerce.number(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

function AccountsSettings({ accounts, setAccounts, accountTypes }: { accounts: Account[], setAccounts: React.Dispatch<React.SetStateAction<Account[]>>, accountTypes: AccountType[] }) {
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
  });

  function handleAdd(data: AccountFormValues) {
    const newAccount: Account = {
      id: `acc_${new Date().getTime()}`,
      ...data,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setAddOpen(false);
  }

  function handleEdit(data: AccountFormValues) {
    if (!selectedAccount) return;
    setAccounts(prev => prev.map(acc => acc.id === selectedAccount.id ? { ...acc, ...data } : acc));
    setEditOpen(false);
    setSelectedAccount(null);
  }

  function handleDelete() {
    if (!selectedAccount) return;
    setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
    setDeleteOpen(false);
    setSelectedAccount(null);
  }
  
  const getAccountType = (typeId: string) => accountTypes.find(t => t.id === typeId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Add, edit, or remove your financial accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => {
             const accountType = getAccountType(account.typeId);
             const icon = accountType ? iconMap[accountType.icon] || iconMap['HelpCircle'] : iconMap['HelpCircle'];
             return (
              <div key={account.id} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-4">
                  {icon}
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{accountType?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(account.balance)}</span>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedAccount(account); form.reset(account); setEditOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedAccount(account); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            )}
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => { form.reset({ name: '', balance: 0 }); setAddOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </CardFooter>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={isEditOpen ? setEditOpen : setAddOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{isEditOpen ? 'Edit Account' : 'Add New Account'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(isEditOpen ? handleEdit : handleAdd)} className="space-y-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl><Input placeholder="e.g., Main Savings" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="typeId" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {accountTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="balance" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Balance</FormLabel>
                              <FormControl><Input type="number" placeholder="e.g., 1000.00" {...field} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />
                      <DialogFooter>
                          <Button type="submit">{isEditOpen ? 'Save Changes' : 'Create Account'}</Button>
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
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account "{selectedAccount?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAccount(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const accountTypeFormSchema = z.object({
    name: z.string().min(1, 'Type name is required.'),
    classification: z.enum(['asset', 'liability'], { required_error: 'Classification is required.' }),
    icon: z.string().min(1, 'Icon is required.'),
});

type AccountTypeFormValues = z.infer<typeof accountTypeFormSchema>;

function AccountTypesSettings({ accountTypes, setAccountTypes }: { accountTypes: AccountType[], setAccountTypes: React.Dispatch<React.SetStateAction<AccountType[]>> }) {
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);
    
    const form = useForm<AccountTypeFormValues>({
        resolver: zodResolver(accountTypeFormSchema)
    });

    function handleAdd(data: AccountTypeFormValues) {
        const newAccountType: AccountType = {
            id: `type_${new Date().getTime()}`, ...data,
        };
        setAccountTypes((prev) => [...prev, newAccountType]);
        setAddOpen(false);
    }
    
    function handleEdit(data: AccountTypeFormValues) {
        if (!selectedType) return;
        setAccountTypes(prev => prev.map(t => t.id === selectedType.id ? { ...t, ...data } : t));
        setEditOpen(false);
        setSelectedType(null);
    }

    function handleDelete() {
        if (!selectedType) return;
        setAccountTypes(prev => prev.filter(t => t.id !== selectedType.id));
        setDeleteOpen(false);
        setSelectedType(null);
    }
    
    return (
      <>
        <Card>
            <CardHeader>
                <CardTitle>Account Types</CardTitle>
                <CardDescription>Define the types of accounts you use, like savings or credit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {accountTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between rounded-md border p-4">
                        <div className="flex items-center gap-4">
                            {iconMap[type.icon] || <HelpCircle className="h-5 w-5 text-muted-foreground" />}
                            <div>
                                <p className="font-medium">{type.name}</p>
                                <Badge variant={type.classification === 'asset' ? 'secondary' : 'destructive'} className="text-xs capitalize">{type.classification}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" onClick={() => { setSelectedType(type); form.reset(type); setEditOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedType(type); setDeleteOpen(true); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button onClick={() => { form.reset({ name: '', classification: 'asset', icon: 'HelpCircle'}); setAddOpen(true);}}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Account Type
                </Button>
            </CardFooter>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddOpen || isEditOpen} onOpenChange={isEditOpen ? setEditOpen : setAddOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditOpen ? 'Edit Account Type' : 'Add New Account Type'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(isEditOpen ? handleEdit : handleAdd)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Type Name</FormLabel><FormControl><Input placeholder="e.g., Investment" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="classification" render={({ field }) => (
                            <FormItem><FormLabel>Classification</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="asset">Asset</SelectItem>
                                        <SelectItem value="liability">Liability</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="icon" render={({ field }) => (
                            <FormItem><FormLabel>Icon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {availableIcons.map(iconName => (
                                            <SelectItem key={iconName} value={iconName}>
                                                <div className="flex items-center gap-2">{iconMap[iconName]}<span>{iconName}</span></div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit">{isEditOpen ? 'Save Changes' : 'Create Type'}</Button>
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
                <AlertDialogDescription>
                  This will permanently delete the account type "{selectedType?.name}". Any accounts using this type will be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedType(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );
}

const categoryFormSchema = z.object({
    name: z.string().min(1, 'Category name is required.'),
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const subcategoryFormSchema = z.object({
    name: z.string().min(1, 'Subcategory name is required.'),
});
type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;


function CategoriesSettings({ categories, setCategories }: { categories: TransactionCategory[], setCategories: React.Dispatch<React.SetStateAction<TransactionCategory[]>> }) {
    const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [isSubcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<{ categoryName: string; subcategoryName: string; } | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<TransactionCategory | null>(null);
    const [deletingSubcategory, setDeletingSubcategory] = useState<{ categoryName: string; subcategoryName: string; } | null>(null);
    
    const categoryForm = useForm<CategoryFormValues>();
    const subcategoryForm = useForm<SubcategoryFormValues>();

    function onCategorySubmit(data: CategoryFormValues) {
        if (editingCategory) { // Edit
            setCategories(prev => prev.map(cat => cat.name === editingCategory.name ? { ...cat, name: data.name } : cat));
            setEditingCategory(null);
        } else { // Add
            setCategories(prev => [...prev, { name: data.name, subcategories: [] }]);
        }
        setCategoryDialogOpen(false);
        categoryForm.reset();
    }
    
    function onSubcategorySubmit(data: SubcategoryFormValues) {
        if (!editingCategory && !editingSubcategory) return;
        const targetCategoryName = editingSubcategory?.categoryName || editingCategory?.name;
        if (!targetCategoryName) return;

        if (editingSubcategory) { // Edit
             setCategories(prev => prev.map(cat => 
                cat.name === targetCategoryName 
                    ? { ...cat, subcategories: cat.subcategories.map(s => s === editingSubcategory.subcategoryName ? data.name : s).sort() }
                    : cat
            ));
            setEditingSubcategory(null);
        } else { // Add
            setCategories(prev => prev.map(cat => 
                cat.name === targetCategoryName
                    ? { ...cat, subcategories: [...cat.subcategories, data.name].sort() }
                    : cat
            ));
        }
        setSubcategoryDialogOpen(false);
        subcategoryForm.reset();
        setEditingCategory(null);
    }

    function handleDeleteCategory() {
        if (!deletingCategory) return;
        setCategories(prev => prev.filter(cat => cat.name !== deletingCategory.name));
        setDeletingCategory(null);
    }
    
    function handleDeleteSubcategory() {
        if (!deletingSubcategory) return;
        setCategories(prev => prev.map(cat => 
            cat.name === deletingSubcategory.categoryName
                ? { ...cat, subcategories: cat.subcategories.filter(s => s !== deletingSubcategory.subcategoryName) }
                : cat
        ));
        setDeletingSubcategory(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Categories</CardTitle>
                    <CardDescription>Manage your transaction categories and subcategories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {categories.map((category) => (
                            <AccordionItem value={category.name} key={category.name}>
                                <div className="flex items-center">
                                    <AccordionTrigger className="flex-grow">{category.name}</AccordionTrigger>
                                    <div className="flex items-center gap-1 pr-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(category); categoryForm.reset({name: category.name}); setCategoryDialogOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingCategory(category)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent>
                                    <div className="space-y-2 pl-4">
                                        {category.subcategories.length > 0 ? (
                                            category.subcategories.map((sub) => (
                                                <div key={sub} className="flex items-center justify-between rounded-md border p-3">
                                                    <p className="font-medium">{sub}</p>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingSubcategory({categoryName: category.name, subcategoryName: sub }); subcategoryForm.reset({name: sub}); setSubcategoryDialogOpen(true);}}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingSubcategory({ categoryName: category.name, subcategoryName: sub })}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No subcategories defined.</p>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => { setEditingCategory(category); subcategoryForm.reset(); setSubcategoryDialogOpen(true);}}>
                                            <PlusCircle className="mr-2 h-3 w-3" /> Add Subcategory
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
                 <CardFooter>
                     <Button onClick={() => { setEditingCategory(null); categoryForm.reset(); setCategoryDialogOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                 </CardFooter>
            </Card>

            {/* Add/Edit Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField control={categoryForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input placeholder="e.g., Personal Care" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Subcategory Dialog */}
            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSubcategory ? `Edit Subcategory` : `Add Subcategory to "${editingCategory?.name}"`}</DialogTitle>
                    </DialogHeader>
                    <Form {...subcategoryForm}>
                        <form onSubmit={subcategoryForm.handleSubmit(onSubcategorySubmit)} className="space-y-4">
                            <FormField control={subcategoryForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Subcategory Name</FormLabel><FormControl><Input placeholder="e.g., Haircut" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">{editingSubcategory ? 'Save Changes' : 'Add Subcategory'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialogs */}
            <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the "{deletingCategory?.name}" category and all its subcategories.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={!!deletingSubcategory} onOpenChange={() => setDeletingSubcategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the "{deletingSubcategory?.subcategoryName}" subcategory.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSubcategory}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

const labelFormSchema = z.object({
    name: z.string().min(1, 'Label name is required.'),
    description: z.string().optional(),
});
type LabelFormValues = z.infer<typeof labelFormSchema>;

function LabelsSettings({ labels, setLabels }: { labels: TransactionLabel[], setLabels: React.Dispatch<React.SetStateAction<TransactionLabel[]>> }) {
    const [isAddOpen, setAddOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<TransactionLabel | null>(null);

    const form = useForm<LabelFormValues>({ 
        resolver: zodResolver(labelFormSchema),
        defaultValues: { name: '', description: '' },
    });

    function handleAdd(data: LabelFormValues) {
        setLabels(prev => [...prev, {name: data.name, description: data.description || ''}].sort((a,b) => a.name.localeCompare(b.name)));
        setAddOpen(false);
        form.reset();
    }
    
    function handleEdit(data: LabelFormValues) {
        if (!selectedLabel) return;
        setLabels(prev => prev.map(l => l.name === selectedLabel.name ? { ...l, ...data } : l).sort((a, b) => a.name.localeCompare(b.name)));
        setEditOpen(false);
        setSelectedLabel(null);
    }
    
    function handleDelete() {
        if (!selectedLabel) return;
        setLabels(prev => prev.filter(l => l.name !== selectedLabel.name));
        setDeleteOpen(false);
        setSelectedLabel(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Labels</CardTitle>
                    <CardDescription>Organize your transactions with custom labels.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {labels.map(label => (
                            <div key={label.name} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">{label.name}</p>
                                    {label.description && <p className="text-sm text-muted-foreground">{label.description}</p>}
                                </div>
                                 <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedLabel(label); form.reset(label); setEditOpen(true);}}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedLabel(label); setDeleteOpen(true); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={() => { form.reset({ name: '', description: ''}); setAddOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Label
                    </Button>
                 </CardFooter>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={isEditOpen ? setEditOpen : setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? 'Edit Label' : 'Add New Label'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(isEditOpen ? handleEdit : handleAdd)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Label Name</FormLabel><FormControl><Input placeholder="e.g., Tax-deductible" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A brief explanation of the label" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="submit">{isEditOpen ? 'Save Changes' : 'Create Label'}</Button>
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
                    <AlertDialogDescription>This will permanently delete the label "{selectedLabel?.name}".</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedLabel(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


export default function ConfigurationPage() {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [accountTypes, setAccountTypes] = useState(initialAccountTypes);
    const [categories, setCategories] = useState(initialTransactionCategories);
    const [labels, setLabels] = useState(initialTransactionLabels);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
            <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="account-types">Account Types</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="labels">Labels</TabsTrigger>
                </TabsList>
                <TabsContent value="accounts">
                    <AccountsSettings accounts={accounts} setAccounts={setAccounts} accountTypes={accountTypes} />
                </TabsContent>
                <TabsContent value="account-types">
                   <AccountTypesSettings accountTypes={accountTypes} setAccountTypes={setAccountTypes} />
                </TabsContent>
                <TabsContent value="categories">
                   <CategoriesSettings categories={categories} setCategories={setCategories} />
                </TabsContent>
                <TabsContent value="labels">
                    <LabelsSettings labels={labels} setLabels={setLabels} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
