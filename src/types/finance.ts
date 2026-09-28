export type UserId = string;

export interface UserAccount {
  id: UserId;
  name: string;
  shortName: string;
  email: string;
  password?: string;
  avatarColor: string;
  neonColor: string;
  avatarInitial: string;
  primaryCard: string;
  bankName: string;
  accountNumber: string;
  monthlySalary: number;
  initialBalance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: UserId; // The owner/account of this transaction
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  cardName: string;
  note?: string;
  isRecurring?: boolean;
  recurringId?: string;
  recurrenceFrequency?: 'monthly' | 'weekly' | 'yearly';
  recurrenceDay?: number;
}

export interface RecurringTransaction {
  id: string;
  userId: UserId;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  categoryIcon: string;
  categoryColor: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth: number; // 1 to 31
  cardName: string;
  active: boolean;
  autoPost: boolean; // automatically create entry or ask to confirm
  createdAt: string;
  lastProcessedDate?: string;
  nextDueDate: string;
}

export interface BudgetGoal {
  id: string;
  userId: UserId; // The owner of this goal
  title: string;
  spent: number;
  limit: number;
  percentage: number;
  color: string;
  glowColor: string;
  icon: string;
}

export interface WeeklyDataPoint {
  day: string;
  value: number;
}
