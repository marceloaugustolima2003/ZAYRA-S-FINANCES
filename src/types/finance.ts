export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  institution: string;
  paymentMethod: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO format: '2026-10-15'
  time: string; // '14:22'
  notes?: string;
  iconName?: string;
}

export interface CategoryExpense {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  color: string;
  strokeColor: string;
  accentBg: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // e.g. 'Dez/2024'
  createdAt: string;
  icon: string;
  color: string;
}

export interface CategoryBudget {
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  lastSync: string;
  status: 'active' | 'syncing' | 'error';
  color: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'alert' | 'success' | 'info';
}

export interface AdvisoryOpportunity {
  id: string;
  title: string;
  subtitle: string;
  yieldRate: string;
  term: string;
  minInvestment: number;
  risk: 'Baixo' | 'Moderado' | 'Alto';
  description: string;
  issuer: string;
}
