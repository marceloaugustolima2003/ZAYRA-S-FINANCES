import { UserAccount, Transaction, BudgetGoal, UserId, WeeklyDataPoint } from '../types/finance';

const STORAGE_KEYS = {
  USERS: 'zayras_users_v4',
  ACTIVE_USER_ID: 'zayras_active_user_v4',
  TRANSACTIONS: 'zayras_transactions_v4',
  GOALS: 'zayras_goals_v4',
};

// Default seed account for public demo if storage is empty
export const DEFAULT_SEED_USERS: UserAccount[] = [
  {
    id: 'user_demo_1',
    name: 'Alexandre Silva',
    shortName: 'Alexandre',
    email: 'alexandre@zayras.app',
    password: 'password123',
    avatarColor: '#0E1B25',
    neonColor: '#00F0FF',
    avatarInitial: 'A',
    bankName: 'Nubank',
    primaryCard: 'Nubank Ultravioleta (•• 8019)',
    accountNumber: 'Ag 0001 • C/C 55210-9',
    monthlySalary: 8500.0,
    initialBalance: 6240.0,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'user_demo_2',
    name: 'Camila Rocha',
    shortName: 'Camila',
    email: 'camila@zayras.app',
    password: 'password123',
    avatarColor: '#16122C',
    neonColor: '#39FF14',
    avatarInitial: 'C',
    bankName: 'Itaú Personnalité',
    primaryCard: 'Itaú Black (•• 3192)',
    accountNumber: 'Ag 0280 • C/C 22481-4',
    monthlySalary: 9800.0,
    initialBalance: 7850.0,
    createdAt: '2026-09-05T10:00:00.000Z',
  },
];

export const DEFAULT_SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    userId: 'user_demo_1',
    description: 'Pão de Açúcar Supermercado',
    amount: 328.5,
    type: 'expense',
    category: 'Alimentação',
    categoryIcon: '🛒',
    categoryColor: '#FF7A00',
    date: 'Hoje, 14:15',
    cardName: 'Nubank Ultravioleta',
  },
  {
    id: 'tx_seed_2',
    userId: 'user_demo_1',
    description: 'Posto Ipiranga Combustível',
    amount: 180.0,
    type: 'expense',
    category: 'Transporte',
    categoryIcon: '⛽',
    categoryColor: '#39FF14',
    date: 'Ontem, 19:30',
    cardName: 'Nubank Débito',
  },
  {
    id: 'tx_seed_3',
    userId: 'user_demo_1',
    description: 'Salário / Prolabore Tech',
    amount: 8500.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    date: '05 Set',
    cardName: 'Conta Corrente',
  },
  {
    id: 'tx_seed_4',
    userId: 'user_demo_2',
    description: 'St. Marche Jardins',
    amount: 275.4,
    type: 'expense',
    category: 'Alimentação',
    categoryIcon: '🛒',
    categoryColor: '#FF7A00',
    date: 'Hoje, 12:20',
    cardName: 'Itaú Black',
  },
  {
    id: 'tx_seed_5',
    userId: 'user_demo_2',
    description: 'Restaurante D.O.M.',
    amount: 340.0,
    type: 'expense',
    category: 'Lazer & Gastronomia',
    categoryIcon: '🍷',
    categoryColor: '#00F0FF',
    date: '26 Set',
    cardName: 'Itaú Black',
  },
  {
    id: 'tx_seed_6',
    userId: 'user_demo_2',
    description: 'Faturamento Consultoria',
    amount: 9800.0,
    type: 'income',
    category: 'Recebimentos',
    categoryIcon: '✨',
    categoryColor: '#00F0FF',
    date: '05 Set',
    cardName: 'Conta Itaú',
  },
];

export const DEFAULT_SEED_GOALS: BudgetGoal[] = [
  {
    id: 'goal_seed_1',
    userId: 'user_demo_1',
    title: 'Alimentação & Mercado',
    spent: 850,
    limit: 1400,
    percentage: 61,
    color: '#FF7A00',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '🛒',
  },
  {
    id: 'goal_seed_2',
    userId: 'user_demo_1',
    title: 'Transporte & Carro',
    spent: 420,
    limit: 700,
    percentage: 60,
    color: '#39FF14',
    glowColor: 'rgba(57, 255, 20, 0.45)',
    icon: '⛽',
  },
  {
    id: 'goal_seed_3',
    userId: 'user_demo_1',
    title: 'Lazer & Rolês',
    spent: 310,
    limit: 900,
    percentage: 34,
    color: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    icon: '🎮',
  },
  {
    id: 'goal_seed_4',
    userId: 'user_demo_2',
    title: 'Mercado & Hortifrúti',
    spent: 790,
    limit: 1300,
    percentage: 60,
    color: '#FF7A00',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '🛒',
  },
  {
    id: 'goal_seed_5',
    userId: 'user_demo_2',
    title: 'Restaurantes & Lazer',
    spent: 560,
    limit: 1200,
    percentage: 46,
    color: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    icon: '🥂',
  },
];

// User Management
export function getAllUsers(): UserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_SEED_USERS));
      return DEFAULT_SEED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error('Error reading users from storage', e);
  }
  return DEFAULT_SEED_USERS;
}

export function saveAllUsers(users: UserAccount[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

export function getUserById(id: string): UserAccount | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): UserAccount | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
}

export function registerNewUser(data: {
  name: string;
  email: string;
  password?: string;
  bankName?: string;
  primaryCard?: string;
  accountNumber?: string;
  monthlySalary?: number;
  initialBalance?: number;
  neonColor?: string;
}): UserAccount {
  const users = getAllUsers();
  const trimmedName = data.name.trim();
  const firstName = trimmedName.split(' ')[0] || 'Usuário';
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const neon = data.neonColor || '#00F0FF';
  const bank = data.bankName?.trim() || 'Banco Principal';
  const initialBal = Number(data.initialBalance) || 0;

  const newUser: UserAccount = {
    id: newId,
    name: trimmedName,
    shortName: firstName,
    email: data.email.toLowerCase().trim(),
    password: data.password || 'password123',
    avatarColor: '#0E1B25',
    neonColor: neon,
    avatarInitial: initial,
    bankName: bank,
    primaryCard: data.primaryCard?.trim() || `${bank} Cartão`,
    accountNumber: data.accountNumber?.trim() || 'Ag 0001 • C/C 00000-0',
    monthlySalary: Number(data.monthlySalary) || 5000.0,
    initialBalance: initialBal,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);
  setActiveUserId(newId);

  // Create initial welcoming goals for this new user
  const initialGoals: BudgetGoal[] = [
    {
      id: `goal_${Date.now()}_1`,
      userId: newId,
      title: 'Alimentação & Mercado',
      spent: 0,
      limit: Math.round((newUser.monthlySalary * 0.25) || 1200),
      percentage: 0,
      color: '#FF7A00',
      glowColor: 'rgba(255, 122, 0, 0.45)',
      icon: '🛒',
    },
    {
      id: `goal_${Date.now()}_2`,
      userId: newId,
      title: 'Moradia & Contas',
      spent: 0,
      limit: Math.round((newUser.monthlySalary * 0.35) || 2000),
      percentage: 0,
      color: '#0066FF',
      glowColor: 'rgba(0, 102, 255, 0.45)',
      icon: '🏠',
    },
    {
      id: `goal_${Date.now()}_3`,
      userId: newId,
      title: 'Lazer & Hobbies',
      spent: 0,
      limit: Math.round((newUser.monthlySalary * 0.15) || 800),
      percentage: 0,
      color: '#00F0FF',
      glowColor: 'rgba(0, 240, 255, 0.45)',
      icon: '🥂',
    },
    {
      id: `goal_${Date.now()}_4`,
      userId: newId,
      title: 'Investimento & Reserva',
      spent: 0,
      limit: Math.round((newUser.monthlySalary * 0.20) || 1000),
      percentage: 0,
      color: '#39FF14',
      glowColor: 'rgba(57, 255, 20, 0.45)',
      icon: '📈',
    },
  ];

  const currentGoals = getSavedGoals();
  saveGoals([...currentGoals, ...initialGoals]);

  // If initial balance is greater than 0, create an initial deposit transaction
  if (initialBal > 0) {
    const currentTxs = getSavedTransactions();
    const depositTx: Transaction = {
      id: `tx_${Date.now()}_init`,
      userId: newId,
      description: 'Depósito / Saldo Inicial',
      amount: initialBal,
      type: 'income',
      category: 'Depósito Inicial',
      categoryIcon: '💰',
      categoryColor: '#39FF14',
      date: 'Hoje',
      cardName: newUser.bankName,
    };
    saveTransactions([depositTx, ...currentTxs]);
  }

  return newUser;
}

export function updateUserAccount(updated: UserAccount) {
  const users = getAllUsers();
  const next = users.map((u) => (u.id === updated.id ? updated : u));
  saveAllUsers(next);
}

export function deleteUserAccount(id: string) {
  const users = getAllUsers().filter((u) => u.id !== id);
  saveAllUsers(users);
  if (getActiveUserId() === id) {
    const remaining = users[0];
    if (remaining) {
      setActiveUserId(remaining.id);
    } else {
      clearActiveUserId();
    }
  }
}

// Active User
export function getActiveUserId(): string | null {
  if (typeof window === 'undefined') return DEFAULT_SEED_USERS[0].id;
  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  if (saved && getUserById(saved)) return saved;

  const users = getAllUsers();
  if (users.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, users[0].id);
    return users[0].id;
  }
  return null;
}

export function setActiveUserId(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }
}

export function clearActiveUserId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }
}

// Transactions
export function getSavedTransactions(): Transaction[] {
  if (typeof window === 'undefined') return DEFAULT_SEED_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_SEED_TRANSACTIONS));
      return DEFAULT_SEED_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error('Failed reading stored transactions', e);
  }
  return DEFAULT_SEED_TRANSACTIONS;
}

export function saveTransactions(transactions: Transaction[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
}

// Goals
export function getSavedGoals(): BudgetGoal[] {
  if (typeof window === 'undefined') return DEFAULT_SEED_GOALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_SEED_GOALS));
      return DEFAULT_SEED_GOALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error('Failed reading stored goals', e);
  }
  return DEFAULT_SEED_GOALS;
}

export function saveGoals(goals: BudgetGoal[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }
}

// Generates dynamic weekly spline data for any user
export function generateUserWeeklyTrend(
  transactions: Transaction[],
  userId: string,
  currentBalance: number
): WeeklyDataPoint[] {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'];
  
  // Calculate a natural curve that ends smoothly at the current balance
  const variance = Math.max(200, currentBalance * 0.08);
  const points: WeeklyDataPoint[] = [];

  for (let i = 0; i < days.length; i++) {
    if (i === days.length - 1) {
      points.push({ day: days[i], value: Math.round(currentBalance) });
    } else {
      const step = (i - (days.length - 1)) * (variance / 3);
      const wave = Math.sin(i * 1.2) * (variance * 0.4);
      const val = Math.max(100, Math.round(currentBalance + step + wave));
      points.push({ day: days[i], value: val });
    }
  }

  return points;
}
