import type { Account, Budget, Transaction, AccountType, Reminder, TransactionLabel, TransactionCategory } from './types';
import { subDays, addDays } from 'date-fns';

export const accountTypes: AccountType[] = [
  { id: 'type_1', name: 'Checking', classification: 'asset', icon: 'Landmark' },
  { id: 'type_2', name: 'Savings', classification: 'asset', icon: 'Banknote' },
  { id: 'type_3', name: 'Credit Card', classification: 'liability', icon: 'CreditCard' },
  { id: 'type_4', name: 'Cash', classification: 'asset', icon: 'Wallet' },
  { id: 'type_5', name: 'Loan/IOU', classification: 'asset', icon: 'Scale' },
];

export const accounts: Account[] = [
  { id: 'acc_1', name: 'Checking Account', typeId: 'type_1', balance: 5230.5 },
  { id: 'acc_2', name: 'Savings Account', typeId: 'type_2', balance: 15820.75 },
  { id: 'acc_3', name: 'Visa Credit Card', typeId: 'type_3', balance: -890.21 },
  { id: 'acc_4', name: 'Cash Wallet', typeId: 'type_4', balance: 340.0 },
];

export const transactionCategories: TransactionCategory[] = [
  {
    name: 'Food & Drink',
    subcategories: ['Groceries', 'Restaurants', 'Coffee Shops', 'Bars'],
  },
  {
    name: 'Shopping',
    subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Books'],
  },
  {
    name: 'Transportation',
    subcategories: ['Gasoline', 'Public Transit', 'Ride Share', 'Parking'],
  },
  {
    name: 'Subscriptions',
    subcategories: ['Streaming', 'Software', 'Gym', 'News'],
  },
  {
    name: 'Utilities',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone'],
  },
  {
    name: 'Health & Fitness',
    subcategories: ['Gym Membership', 'Doctor', 'Pharmacy'],
  },
  {
    name: 'Entertainment',
    subcategories: ['Movies', 'Concerts', 'Games'],
  },
  { name: 'Salary', subcategories: [] },
  { name: 'Freelance', subcategories: [] },
  { name: 'Reimbursement', subcategories: [] },
  { name: 'Transfers', subcategories: [] },
  { name: 'Other', subcategories: [] },
];

export const transactionLabels: TransactionLabel[] = [
    { name: 'Personal', description: 'For personal expenses and purchases.'},
    { name: 'Work', description: 'Work-related expenses that may be reimbursable.' },
    { name: 'Household', description: 'Shared expenses for the home.'},
    { name: 'Reimbursable', description: 'Expenses that will be reimbursed.' }
];

export const transactions: Transaction[] = [
  {
    id: 'txn_1',
    date: subDays(new Date(), 1).toISOString(),
    description: 'Starbucks Coffee',
    amount: 5.75,
    type: 'expense',
    category: 'Food & Drink',
    subcategory: 'Coffee Shops',
    label: 'Personal',
    accountId: 'acc_3',
  },
  {
    id: 'txn_2',
    date: subDays(new Date(), 1).toISOString(),
    description: 'Monthly Salary',
    amount: 4500,
    type: 'income',
    category: 'Salary',
    accountId: 'acc_1',
  },
  {
    id: 'txn_3',
    date: subDays(new Date(), 2).toISOString(),
    description: 'Groceries from Whole Foods',
    amount: 154.32,
    type: 'expense',
    category: 'Food & Drink',
    subcategory: 'Groceries',
    label: 'Household',
    accountId: 'acc_3',
  },
  {
    id: 'txn_4',
    date: subDays(new Date(), 3).toISOString(),
    description: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    category: 'Subscriptions',
    subcategory: 'Streaming',
    accountId: 'acc_3',
  },
  {
    id: 'txn_5_exp',
    date: subDays(new Date(), 4).toISOString(),
    description: 'Transfer to Savings',
    amount: 1000,
    type: 'expense',
    category: 'Transfers',
    accountId: 'acc_1',
    transferId: 'transfer_1',
  },
  {
    id: 'txn_5_inc',
    date: subDays(new Date(), 4).toISOString(),
    description: 'Transfer to Savings',
    amount: 1000,
    type: 'income',
    category: 'Transfers',
    accountId: 'acc_2',
    transferId: 'transfer_1',
  },
  {
    id: 'txn_6',
    date: subDays(new Date(), 5).toISOString(),
    description: 'Dinner at Italian Restaurant',
    amount: 85.5,
    type: 'expense',
    category: 'Food & Drink',
    subcategory: 'Restaurants',
    accountId: 'acc_3',
  },
  {
    id: 'txn_7',
    date: subDays(new Date(), 6).toISOString(),
    description: 'Gasoline',
    amount: 55.20,
    type: 'expense',
    category: 'Transportation',
    subcategory: 'Gasoline',
    accountId: 'acc_1',
  },
  {
    id: 'txn_8',
    date: subDays(new Date(), 8).toISOString(),
    description: 'Freelance Project Payment',
    amount: 750,
    type: 'income',
    category: 'Freelance',
    accountId: 'acc_1',
  },
  {
    id: 'txn_9',
    date: subDays(new Date(), 10).toISOString(),
    description: 'Amazon Purchase',
    amount: 42.10,
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Home Goods',
    label: 'Personal',
    accountId: 'acc_3',
  },
  {
    id: 'txn_10',
    date: subDays(new Date(), 15).toISOString(),
    description: 'Gym Membership',
    amount: 49.99,
    type: 'expense',
    category: 'Health & Fitness',
    subcategory: 'Gym Membership',
    accountId: 'acc_3',
  },
  {
    id: 'txn_11',
    date: subDays(new Date(), 18).toISOString(),
    description: 'Movie Tickets',
    amount: 32.00,
    type: 'expense',
    category: 'Entertainment',
    subcategory: 'Movies',
    accountId: 'acc_3',
  },
  {
    id: 'txn_12',
    date: subDays(new Date(), 20).toISOString(),
    description: 'Groceries from Trader Joe\'s',
    amount: 98.75,
    type: 'expense',
    category: 'Food & Drink',
    subcategory: 'Groceries',
    label: 'Household',
    accountId: 'acc_1',
  },
  {
    id: 'txn_13',
    date: subDays(new Date(), 22).toISOString(),
    description: 'Electricity Bill',
    amount: 75.60,
    type: 'expense',
    category: 'Utilities',
    subcategory: 'Electricity',
    accountId: 'acc_1',
  },
  {
    id: 'txn_14',
    date: subDays(new Date(), 25).toISOString(),
    description: 'Lunch with colleagues',
    amount: 25.40,
    type: 'expense',
    category: 'Food & Drink',
    subcategory: 'Restaurants',
    label: 'Work',
    accountId: 'acc_4',
  },
  {
    id: 'txn_15',
    date: subDays(new Date(), 28).toISOString(),
    description: 'New Book',
    amount: 18.99,
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Books',
    accountId: 'acc_3',
  },
];


export const budgets: Budget[] = [
  { id: 'bud_1', category: 'Food & Drink', amount: 700 },
  { id: 'bud_2', category: 'Shopping', amount: 300 },
  { id: 'bud_3', category: 'Transportation', amount: 150 },
  { id: 'bud_4', category: 'Entertainment', amount: 100 },
  { id: 'bud_5', category: 'Subscriptions', amount: 50 },
  { id: 'bud_6', category: 'Health & Fitness', amount: 50 },
  { id: 'bud_7', category: 'Utilities', amount: 100 },
];

export const reminders: Reminder[] = [
  { id: 'rem_1', description: 'Rent Payment', amount: 1200, dueDate: addDays(new Date(), 5).toISOString(), frequency: 'monthly', accountId: 'acc_1', isPaid: false },
  { id: 'rem_2', description: 'Netflix Subscription', amount: 15.99, dueDate: addDays(new Date(), 10).toISOString(), frequency: 'monthly', accountId: 'acc_3', isPaid: false },
  { id: 'rem_3', description: 'Car Insurance', amount: 150, dueDate: addDays(new Date(), 20).toISOString(), frequency: 'yearly', accountId: 'acc_1', isPaid: true },
];
