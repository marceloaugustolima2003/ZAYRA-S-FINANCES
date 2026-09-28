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
