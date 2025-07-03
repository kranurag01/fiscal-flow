export type Transaction = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
  transferId?: string;
};

export type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit-card' | 'cash';
  balance: number;
};

export type Budget = {
  id:string;
  category: string;
  amount: number;
  spent: number;
};
