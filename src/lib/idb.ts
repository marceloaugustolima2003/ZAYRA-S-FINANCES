import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, BudgetGoal, UserAccount, RecurringTransaction } from '../types/finance';

export interface SyncQueueItem {
  id: string;
  action: 'create_transaction' | 'delete_transaction' | 'update_goal' | 'create_user' | 'save_recurring' | 'delete_recurring';
  payload: any;
  queuedAt: number;
  retryCount: number;
}

interface ZayrasFinancesDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction & { _isOfflinePending?: boolean };
    indexes: {
      'by-user': string;
      'by-date': string;
    };
  };
  goals: {
    key: string;
    value: BudgetGoal;
    indexes: {
      'by-user': string;
    };
  };
  users: {
    key: string;
    value: UserAccount;
    indexes: {
      'by-email': string;
    };
  };
  recurringTransactions: {
    key: string;
    value: RecurringTransaction;
    indexes: {
      'by-user': string;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-queued-at': number;
    };
  };
}

const DB_NAME = 'zayras_finances_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ZayrasFinancesDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ZayrasFinancesDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ZayrasFinancesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Transactions Store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-user', 'userId');
          txStore.createIndex('by-date', 'date');
        }

        // Goals Store
        if (!db.objectStoreNames.contains('goals')) {
          const goalsStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalsStore.createIndex('by-user', 'userId');
        }

        // Users Store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('by-email', 'email');
        }

        // Recurring Transactions Store
        if (!db.objectStoreNames.contains('recurringTransactions')) {
          const recStore = db.createObjectStore('recurringTransactions', { keyPath: 'id' });
          recStore.createIndex('by-user', 'userId');
        }

        // Sync Queue Store for Offline-first operations
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('by-queued-at', 'queuedAt');
        }
      },
    });
  }
  return dbPromise;
}

// ================= TRANSACTIONS =================

export async function getStoredTransactions(userId?: string): Promise<Transaction[]> {
  const db = await getDB();
  if (userId) {
    return db.getAllFromIndex('transactions', 'by-user', userId);
  }
  return db.getAll('transactions');
}

export async function saveStoredTransaction(tx: Transaction & { _isOfflinePending?: boolean }): Promise<void> {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function saveStoredTransactionsBatch(txs: Transaction[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('transactions', 'readwrite');
  for (const item of txs) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function deleteStoredTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
}

// ================= GOALS =================

export async function getStoredGoals(userId?: string): Promise<BudgetGoal[]> {
  const db = await getDB();
  if (userId) {
    return db.getAllFromIndex('goals', 'by-user', userId);
  }
  return db.getAll('goals');
}

export async function saveStoredGoal(goal: BudgetGoal): Promise<void> {
  const db = await getDB();
  await db.put('goals', goal);
}

export async function saveStoredGoalsBatch(goals: BudgetGoal[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('goals', 'readwrite');
  for (const item of goals) {
    await tx.store.put(item);
  }
  await tx.done;
}

// ================= USERS =================

export async function getStoredUsers(): Promise<UserAccount[]> {
  const db = await getDB();
  return db.getAll('users');
}

export async function saveStoredUser(user: UserAccount): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

export async function saveStoredUsersBatch(users: UserAccount[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('users', 'readwrite');
  for (const item of users) {
    await tx.store.put(item);
  }
  await tx.done;
}

// ================= RECURRING TRANSACTIONS =================

export async function getStoredRecurringTransactions(userId?: string): Promise<RecurringTransaction[]> {
  const db = await getDB();
  if (userId) {
    return db.getAllFromIndex('recurringTransactions', 'by-user', userId);
  }
  return db.getAll('recurringTransactions');
}

export async function saveStoredRecurringTransaction(item: RecurringTransaction): Promise<void> {
  const db = await getDB();
  await db.put('recurringTransactions', item);
}

export async function saveStoredRecurringTransactionsBatch(items: RecurringTransaction[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('recurringTransactions', 'readwrite');
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function deleteStoredRecurringTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('recurringTransactions', id);
}

// ================= SYNC QUEUE =================

export async function addToSyncQueue(
  action: SyncQueueItem['action'],
  payload: any
): Promise<SyncQueueItem> {
  const db = await getDB();
  const queueItem: SyncQueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    payload,
    queuedAt: Date.now(),
    retryCount: 0,
  };
  await db.put('syncQueue', queueItem);
  return queueItem;
}

export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function clearAllSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('syncQueue');
}
