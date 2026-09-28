import { Transaction, BudgetGoal, UserAccount } from '../types/finance';
import { SyncQueueItem } from './idb';

const API_BASE = '/api';

export async function fetchUsersApi(): Promise<UserAccount[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
  return res.json();
}

export async function saveUserApi(user: UserAccount): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(`Failed to save user: ${res.statusText}`);
  return res.json();
}

export async function fetchTransactionsApi(userId?: string): Promise<Transaction[]> {
  const url = userId ? `${API_BASE}/transactions?userId=${encodeURIComponent(userId)}` : `${API_BASE}/transactions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  return res.json();
}

export async function createTransactionApi(tx: Transaction): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  });
  if (!res.ok) throw new Error(`Failed to create transaction: ${res.statusText}`);
  return res.json();
}

export async function deleteTransactionApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete transaction: ${res.statusText}`);
  return res.json();
}

export async function syncOfflineQueueApi(items: SyncQueueItem[]): Promise<{
  success: boolean;
  syncedCount: number;
  results: Array<{ id: string; success: boolean }>;
}> {
  const res = await fetch(`${API_BASE}/transactions/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`Failed to sync offline queue: ${res.statusText}`);
  return res.json();
}

export async function fetchGoalsApi(userId?: string): Promise<BudgetGoal[]> {
  const url = userId ? `${API_BASE}/goals?userId=${encodeURIComponent(userId)}` : `${API_BASE}/goals`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch goals: ${res.statusText}`);
  return res.json();
}

export async function saveGoalApi(goal: BudgetGoal): Promise<BudgetGoal> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error(`Failed to save goal: ${res.statusText}`);
  return res.json();
}

export async function sendCoupleInviteApi(
  inviterId: string,
  partnerEmail: string
): Promise<{
  success: boolean;
  status: 'connected' | 'pending';
  partner?: UserAccount;
  inviteId?: string;
  partnerEmail?: string;
  inviteLink?: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/couple/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviterId, partnerEmail }),
  });
  if (!res.ok) throw new Error(`Falha ao processar convite: ${res.statusText}`);
  return res.json();
}

export async function unlinkCoupleApi(inviterId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/couple/unlink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviterId }),
  });
  if (!res.ok) throw new Error(`Falha ao desvincular casal: ${res.statusText}`);
  return res.json();
}

// ================= RECURRING TRANSACTIONS =================

export async function fetchRecurringTransactionsApi(userId?: string): Promise<any[]> {
  const url = userId
    ? `${API_BASE}/recurring?userId=${encodeURIComponent(userId)}`
    : `${API_BASE}/recurring`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch recurring transactions: ${res.statusText}`);
  return res.json();
}

export async function saveRecurringTransactionApi(item: any): Promise<any> {
  const res = await fetch(`${API_BASE}/recurring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`Failed to save recurring transaction: ${res.statusText}`);
  return res.json();
}

export async function deleteRecurringTransactionApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/recurring/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete recurring transaction: ${res.statusText}`);
  return res.json();
}

export async function processDueRecurringApi(): Promise<{
  success: boolean;
  generatedCount: number;
  newTransactions: Transaction[];
}> {
  const res = await fetch(`${API_BASE}/recurring/process`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to process recurring transactions: ${res.statusText}`);
  return res.json();
}


