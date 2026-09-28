import { create } from 'zustand';
import { Unsubscribe } from 'firebase/firestore';
import { UserAccount, Transaction, BudgetGoal, WeeklyDataPoint, RecurringTransaction } from '../types/finance';
import {
  getStoredTransactions,
  saveStoredTransaction,
  saveStoredTransactionsBatch,
  deleteStoredTransaction,
  getStoredGoals,
  saveStoredGoal,
  saveStoredGoalsBatch,
  getStoredUsers,
  saveStoredUser,
  saveStoredUsersBatch,
  getStoredRecurringTransactions,
  saveStoredRecurringTransaction,
  saveStoredRecurringTransactionsBatch,
  deleteStoredRecurringTransaction,
  addToSyncQueue,
  getPendingSyncQueue,
  removeSyncQueueItem,
  clearAllSyncQueue,
  SyncQueueItem,
} from '../lib/idb';
import {
  testFirestoreConnection,
  fetchFirestoreUsers,
  saveFirestoreUser,
  deleteFirestoreUser,
  subscribeFirestoreUsers,
  fetchFirestoreTransactions,
  saveFirestoreTransaction,
  deleteFirestoreTransaction,
  subscribeFirestoreTransactions,
  fetchFirestoreGoals,
  saveFirestoreGoal,
  subscribeFirestoreGoals,
  fetchFirestoreRecurring,
  saveFirestoreRecurring,
  deleteFirestoreRecurring,
  subscribeFirestoreRecurring,
  sendFirestoreCoupleInvite,
  unlinkFirestoreCouple,
} from '../services/firestoreService';

export type ViewMode = 'individual' | 'couple';

export type EnhancedTransaction = Transaction & { _isOfflinePending?: boolean };

// Active Firestore Realtime Listeners
let unsubUsers: Unsubscribe | null = null;
let unsubTxs: Unsubscribe | null = null;
let unsubGoals: Unsubscribe | null = null;
let unsubRecurring: Unsubscribe | null = null;

interface FinanceState {
  users: UserAccount[];
  currentUser: UserAccount | null;
  partnerUser: UserAccount | null;
  pendingInviteEmail: string | null;
  viewMode: ViewMode;
  transactions: EnhancedTransaction[];
  goals: BudgetGoal[];
  recurringTransactions: RecurringTransaction[];
  isOnline: boolean;
  isFirestoreConnected: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  error: string | null;

  // Actions
  initStore: () => Promise<void>;
  switchUser: (userId: string) => void;
  setPartnerUser: (userId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  sendCoupleInvite: (email: string) => Promise<{
    success: boolean;
    status: 'connected' | 'pending';
    partner?: UserAccount;
    message: string;
    inviteLink?: string;
  }>;
  unlinkCouple: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<EnhancedTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  updateGoal: (goal: BudgetGoal) => Promise<void>;
  addRecurringTransaction: (rec: Omit<RecurringTransaction, 'id' | 'createdAt'>) => Promise<RecurringTransaction>;
  toggleRecurringTransaction: (id: string) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  processDueRecurring: () => Promise<number>;
  syncPendingQueue: () => Promise<void>;
  registerUser: (user: UserAccount) => Promise<void>;
  loginUser: (user: UserAccount) => void;
  logoutUser: () => void;
  dismissError: () => void;

  // Computed helper getters
  getUserExpenses: (userId: string) => number;
  getUserIncomes: (userId: string) => number;
  getUserBalance: (userId: string) => number;
  getCoupleTotalBalance: () => number;
  getCoupleTotalExpenses: () => number;
  getCoupleTotalIncomes: () => number;
  getWeeklyTrend: (userId: string) => WeeklyDataPoint[];
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  users: [],
  currentUser: null,
  partnerUser: null,
  pendingInviteEmail: null,
  viewMode: 'individual',
  transactions: [],
  goals: [],
  recurringTransactions: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isFirestoreConnected: false,
  isSyncing: false,
  pendingSyncCount: 0,
  lastSyncTime: null,
  error: null,

  initStore: async () => {
    // 1. Setup online / offline event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        set({ isOnline: true });
        // Automatically sync pending queue on reconnection!
        get().syncPendingQueue();
      });
      window.addEventListener('offline', () => {
        set({ isOnline: false, isFirestoreConnected: false });
      });
    }

    // 2. Read from IndexedDB first for instant, zero-latency launch
    try {
      const [localUsers, localTxs, localGoals, localRecurring, queue] = await Promise.all([
        getStoredUsers(),
        getStoredTransactions(),
        getStoredGoals(),
        getStoredRecurringTransactions(),
        getPendingSyncQueue(),
      ]);

      set({
        pendingSyncCount: queue.length,
        recurringTransactions: localRecurring,
      });

      if (localUsers.length > 0) {
        const storedActiveId = localStorage.getItem('zayras_active_user_id');
        const activeUser = localUsers.find((u) => u.id === storedActiveId) || localUsers[0];
        const partner = localUsers.find((u) => u.id !== activeUser.id) || null;

        set({
          users: localUsers,
          currentUser: activeUser,
          partnerUser: partner,
          transactions: localTxs,
          goals: localGoals,
          recurringTransactions: localRecurring,
        });
      }
    } catch (e) {
      console.warn('[Zayra DB] Error reading initial state from IndexedDB:', e);
    }

    // 3. Connect to Firebase Firestore
    if (navigator.onLine) {
      try {
        await testFirestoreConnection();

        // Fetch cloud data from Firestore
        const [cloudUsers, cloudTxs, cloudGoals, cloudRecurring] = await Promise.all([
          fetchFirestoreUsers(),
          fetchFirestoreTransactions(),
          fetchFirestoreGoals(),
          fetchFirestoreRecurring(),
        ]);

        if (cloudUsers.length > 0) {
          await Promise.all([
            saveStoredUsersBatch(cloudUsers),
            saveStoredTransactionsBatch(cloudTxs),
            saveStoredGoalsBatch(cloudGoals),
            saveStoredRecurringTransactionsBatch(cloudRecurring),
          ]);

          const state = get();
          const activeId = localStorage.getItem('zayras_active_user_id') || state.currentUser?.id;
          const activeUser = cloudUsers.find((u) => u.id === activeId) || cloudUsers[0];
          const partner = cloudUsers.find((u) => u.id !== activeUser.id) || null;

          // Merge: keep local pending transactions on top if any
          const pendingIds = new Set(
            (await getPendingSyncQueue())
              .filter((q) => q.action === 'create_transaction')
              .map((q) => q.payload?.id)
          );

          const currentTxs = get().transactions.filter((t) => t._isOfflinePending && pendingIds.has(t.id));
          const mergedTxs = [
            ...currentTxs,
            ...cloudTxs.filter((t) => !pendingIds.has(t.id)),
          ];

          set({
            users: cloudUsers,
            currentUser: activeUser,
            partnerUser: partner,
            transactions: mergedTxs,
            goals: cloudGoals,
            recurringTransactions: cloudRecurring,
            isFirestoreConnected: true,
            lastSyncTime: new Date(),
          });

          // 4. Attach Real-time Firestore Listeners
          if (unsubUsers) unsubUsers();
          if (unsubTxs) unsubTxs();
          if (unsubGoals) unsubGoals();
          if (unsubRecurring) unsubRecurring();

          unsubUsers = subscribeFirestoreUsers((newUsers) => {
            saveStoredUsersBatch(newUsers);
            const curState = get();
            const current = curState.currentUser
              ? newUsers.find((u) => u.id === curState.currentUser?.id) || newUsers[0]
              : newUsers[0];
            const pUser = current ? newUsers.find((u) => u.id !== current.id) || null : null;
            set({ users: newUsers, currentUser: current, partnerUser: pUser });
          });

          unsubTxs = subscribeFirestoreTransactions((newTxs) => {
            saveStoredTransactionsBatch(newTxs);
            set((curState) => {
              const pendingLocal = curState.transactions.filter((t) => t._isOfflinePending);
              const pendingTxIds = new Set(pendingLocal.map((t) => t.id));
              const merged = [...pendingLocal, ...newTxs.filter((t) => !pendingTxIds.has(t.id))];
              return { transactions: merged, lastSyncTime: new Date() };
            });
          });

          unsubGoals = subscribeFirestoreGoals((newGoals) => {
            saveStoredGoalsBatch(newGoals);
            set({ goals: newGoals });
          });

          unsubRecurring = subscribeFirestoreRecurring((newRec) => {
            saveStoredRecurringTransactionsBatch(newRec);
            set({ recurringTransactions: newRec });
          });

          // Check and process due recurring transactions automatically!
          await get().processDueRecurring();
        }
      } catch (err: any) {
        console.warn('[Zayra Firestore] Cloud fetch warning (falling back to IndexedDB):', err?.message);
        set({ isFirestoreConnected: false });
      }
    }
  },

  switchUser: (userId: string) => {
    const { users, currentUser } = get();
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // The other user becomes partner
    const partner = users.find((u) => u.id !== userId) || null;
    localStorage.setItem('zayras_active_user_id', userId);

    set({
      currentUser: target,
      partnerUser: partner,
    });
  },

  setPartnerUser: (userId: string) => {
    const { users } = get();
    const partner = users.find((u) => u.id === userId) || null;
    set({ partnerUser: partner });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },

  toggleViewMode: () => {
    const next = get().viewMode === 'individual' ? 'couple' : 'individual';
    set({ viewMode: next });
  },

  sendCoupleInvite: async (email: string) => {
    const { currentUser, users } = get();
    if (!currentUser) throw new Error('Nenhum usuário logado');

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === currentUser.email.toLowerCase()) {
      return {
        success: false,
        status: 'pending' as const,
        message: 'Você não pode convidar seu próprio e-mail!',
      };
    }

    try {
      const result = await sendFirestoreCoupleInvite(currentUser.id, cleanEmail);

      if (result.status === 'connected' && result.partner) {
        const partner = result.partner;
        const existsInLocalUsers = users.some((u) => u.id === partner.id);
        const nextUsers = existsInLocalUsers ? users : [...users, partner];

        set({
          users: nextUsers,
          partnerUser: partner,
          pendingInviteEmail: null,
          viewMode: 'couple',
        });

        await saveStoredUser(partner);
      } else {
        set({ pendingInviteEmail: cleanEmail });
      }

      return result;
    } catch (e: any) {
      console.warn('Firestore couple invite fallback to local search:', e);
      const localPartner = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (localPartner) {
        set({
          partnerUser: localPartner,
          pendingInviteEmail: null,
          viewMode: 'couple',
        });
        return {
          success: true,
          status: 'connected',
          partner: localPartner,
          message: `Conta de ${localPartner.shortName} vinculada ao casal com sucesso!`,
        };
      }

      set({ pendingInviteEmail: cleanEmail });
      return {
        success: true,
        status: 'pending',
        partnerEmail: cleanEmail,
        inviteLink: `${window.location.origin}/#register?coupleInvite=pending&partner=${encodeURIComponent(cleanEmail)}`,
        message: `Convite de casal registrado para ${cleanEmail}!`,
      };
    }
  },

  unlinkCouple: async () => {
    const { currentUser } = get();
    if (currentUser) {
      unlinkFirestoreCouple(currentUser.id).catch(() => {});
    }
    set({
      partnerUser: null,
      pendingInviteEmail: null,
      viewMode: 'individual',
    });
  },

  addTransaction: async (txData: Omit<Transaction, 'id'>) => {
    const isOnline = navigator.onLine;
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTx: EnhancedTransaction = {
      ...txData,
      id: txId,
      _isOfflinePending: !isOnline,
    };

    // 1. Immediately update Zustand state & IndexedDB for instantaneous local UI responsiveness
    set((state) => ({
      transactions: [newTx, ...state.transactions],
      pendingSyncCount: !isOnline ? state.pendingSyncCount + 1 : state.pendingSyncCount,
    }));

    await saveStoredTransaction(newTx);

    // 2. Update matching budget goals locally
    if (newTx.type === 'expense') {
      const state = get();
      const updatedGoals = state.goals.map((g) => {
        if (
          g.userId === newTx.userId &&
          newTx.category.toLowerCase().includes(g.title.toLowerCase().slice(0, 4))
        ) {
          const spent = g.spent + newTx.amount;
          const percentage = Math.min(100, Math.round((spent / g.limit) * 100));
          const updated = { ...g, spent, percentage };
          saveStoredGoal(updated);
          return updated;
        }
        return g;
      });
      set({ goals: updatedGoals });
    }

    // 3. Handle Sync: if offline, queue it! If online, post to Firestore.
    if (!isOnline) {
      await addToSyncQueue('create_transaction', newTx);
    } else {
      try {
        await saveFirestoreTransaction(newTx);
      } catch (e) {
        console.warn('[Zayra Offline Queue] Network drop during Firestore post, queuing to IndexedDB:', e);
        await addToSyncQueue('create_transaction', newTx);
        set((state) => ({
          pendingSyncCount: state.pendingSyncCount + 1,
          transactions: state.transactions.map((t) =>
            t.id === txId ? { ...t, _isOfflinePending: true } : t
          ),
        }));
      }
    }

    return newTx;
  },

  deleteTransaction: async (id: string) => {
    const isOnline = navigator.onLine;

    // 1. Remove from local store and IndexedDB immediately
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    await deleteStoredTransaction(id);

    // 2. Delete from Firestore or Queue
    if (!isOnline) {
      await addToSyncQueue('delete_transaction', { id });
      set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
    } else {
      try {
        await deleteFirestoreTransaction(id);
      } catch (e) {
        console.warn('[Zayra Offline Queue] Failed to delete in Firestore, queuing:', e);
        await addToSyncQueue('delete_transaction', { id });
        set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
      }
    }
  },

  updateGoal: async (goal: BudgetGoal) => {
    const isOnline = navigator.onLine;

    set((state) => ({
      goals: state.goals.map((g) => (g.id === goal.id ? goal : g)),
    }));
    await saveStoredGoal(goal);

    if (!isOnline) {
      await addToSyncQueue('update_goal', goal);
      set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
    } else {
      try {
        await saveFirestoreGoal(goal);
      } catch (e) {
        await addToSyncQueue('update_goal', goal);
        set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
      }
    }
  },

  addRecurringTransaction: async (recData: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    const isOnline = navigator.onLine;
    const now = new Date();
    const newRec: RecurringTransaction = {
      ...recData,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now.toISOString(),
      nextDueDate: recData.nextDueDate || new Date(now.getFullYear(), now.getMonth(), recData.dayOfMonth).toISOString().split('T')[0],
    };

    set((state) => ({
      recurringTransactions: [newRec, ...state.recurringTransactions],
    }));
    await saveStoredRecurringTransaction(newRec);

    if (isOnline) {
      try {
        await saveFirestoreRecurring(newRec);
      } catch (e) {
        await addToSyncQueue('save_recurring', newRec);
      }
    } else {
      await addToSyncQueue('save_recurring', newRec);
      set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
    }

    return newRec;
  },

  toggleRecurringTransaction: async (id: string) => {
    const isOnline = navigator.onLine;
    const { recurringTransactions } = get();
    const target = recurringTransactions.find((r) => r.id === id);
    if (!target) return;

    const updated: RecurringTransaction = { ...target, active: !target.active };

    set((state) => ({
      recurringTransactions: state.recurringTransactions.map((r) => (r.id === id ? updated : r)),
    }));
    await saveStoredRecurringTransaction(updated);

    if (isOnline) {
      try {
        await saveFirestoreRecurring(updated);
      } catch (e) {
        await addToSyncQueue('save_recurring', updated);
      }
    } else {
      await addToSyncQueue('save_recurring', updated);
      set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
    }
  },

  deleteRecurringTransaction: async (id: string) => {
    const isOnline = navigator.onLine;
    set((state) => ({
      recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
    }));
    await deleteStoredRecurringTransaction(id);

    if (isOnline) {
      try {
        await deleteFirestoreRecurring(id);
      } catch (e) {
        await addToSyncQueue('delete_recurring', { id });
      }
    } else {
      await addToSyncQueue('delete_recurring', { id });
      set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 }));
    }
  },

  processDueRecurring: async () => {
    const isOnline = navigator.onLine;
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let count = 0;

    const { recurringTransactions } = get();
    for (const item of recurringTransactions) {
      if (!item.active || !item.autoPost) continue;

      const lastMonth = item.lastProcessedDate?.substring(0, 7);
      if (lastMonth !== currentMonthYear) {
        const newTx: EnhancedTransaction = {
          id: `tx_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: item.userId,
          description: `${item.description} (Recorrente)`,
          amount: item.amount,
          type: item.type,
          category: item.category,
          categoryIcon: item.categoryIcon,
          categoryColor: item.categoryColor,
          date: `Dia ${item.dayOfMonth} (${now.toLocaleDateString('pt-BR', { month: 'short' })})`,
          cardName: item.cardName,
          note: `Lançamento mensal automático • ${item.frequency}`,
          isRecurring: true,
          recurringId: item.id,
          _isOfflinePending: !isOnline,
        };

        await get().addTransaction(newTx);

        // Update item last processed date in Firestore and IDB
        const updatedItem = {
          ...item,
          lastProcessedDate: now.toISOString().split('T')[0],
          nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, item.dayOfMonth).toISOString().split('T')[0],
        };
        await saveStoredRecurringTransaction(updatedItem);
        if (isOnline) {
          saveFirestoreRecurring(updatedItem).catch(() => {});
        }

        count++;
      }
    }

    return count;
  },

  syncPendingQueue: async () => {
    if (!navigator.onLine || get().isSyncing) return;

    try {
      set({ isSyncing: true, error: null });
      const queue = await getPendingSyncQueue();

      if (queue.length === 0) {
        set({ isSyncing: false, pendingSyncCount: 0 });
        return;
      }

      console.log(`[Zayra Firestore Sync] Processing ${queue.length} offline queued items to Firestore...`);

      for (const item of queue) {
        try {
          if (item.action === 'create_transaction' && item.payload) {
            const cleanTx = { ...item.payload };
            delete cleanTx._isOfflinePending;
            await saveFirestoreTransaction(cleanTx);
            await removeSyncQueueItem(item.id);
          } else if (item.action === 'delete_transaction' && item.payload?.id) {
            await deleteFirestoreTransaction(item.payload.id);
            await removeSyncQueueItem(item.id);
          } else if (item.action === 'update_goal' && item.payload) {
            await saveFirestoreGoal(item.payload);
            await removeSyncQueueItem(item.id);
          } else if (item.action === 'save_recurring' && item.payload) {
            await saveFirestoreRecurring(item.payload);
            await removeSyncQueueItem(item.id);
          } else if (item.action === 'delete_recurring' && item.payload?.id) {
            await deleteFirestoreRecurring(item.payload.id);
            await removeSyncQueueItem(item.id);
          } else if (item.action === 'create_user' && item.payload) {
            await saveFirestoreUser(item.payload);
            await removeSyncQueueItem(item.id);
          }
        } catch (itemErr) {
          console.warn('[Firestore Sync Item Error]:', itemErr);
        }
      }

      // Clean offline pending flags from transactions
      const remainingQueue = await getPendingSyncQueue();
      const pendingTxIds = new Set(
        remainingQueue
          .filter((q) => q.action === 'create_transaction')
          .map((q) => q.payload?.id)
      );

      set((state) => ({
        transactions: state.transactions.map((t) => ({
          ...t,
          _isOfflinePending: pendingTxIds.has(t.id),
        })),
        pendingSyncCount: remainingQueue.length,
        lastSyncTime: new Date(),
        isSyncing: false,
        isFirestoreConnected: true,
      }));
    } catch (err: any) {
      console.error('[Zayra Firestore Sync] Batch sync error:', err);
      set({
        isSyncing: false,
        error: 'Erro temporário ao sincronizar dados com o Firestore.',
      });
    }
  },

  registerUser: async (user: UserAccount) => {
    set((state) => {
      const exists = state.users.some((u) => u.id === user.id);
      const nextUsers = exists
        ? state.users.map((u) => (u.id === user.id ? user : u))
        : [...state.users, user];
      const partner = nextUsers.find((u) => u.id !== user.id) || null;
      return {
        users: nextUsers,
        currentUser: user,
        partnerUser: partner,
      };
    });

    localStorage.setItem('zayras_active_user_id', user.id);
    await saveStoredUser(user);

    if (navigator.onLine) {
      try {
        await saveFirestoreUser(user);
      } catch (e) {
        await addToSyncQueue('create_user', user);
      }
    } else {
      await addToSyncQueue('create_user', user);
    }
  },

  loginUser: (user: UserAccount) => {
    localStorage.setItem('zayras_active_user_id', user.id);
    const { users } = get();
    const partner = users.find((u) => u.id !== user.id) || null;
    set({
      currentUser: user,
      partnerUser: partner,
    });
  },

  logoutUser: () => {
    localStorage.removeItem('zayras_active_user_id');
    set({ currentUser: null, users: [], partnerUser: null });
  },

  dismissError: () => set({ error: null }),

  // Computed helper calculations
  getUserExpenses: (userId: string) => {
    return get()
      .transactions.filter((t) => t.userId === userId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getUserIncomes: (userId: string) => {
    return get()
      .transactions.filter((t) => t.userId === userId && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getUserBalance: (userId: string) => {
    const { users } = get();
    const user = users.find((u) => u.id === userId);
    const initial = user?.initialBalance || 0;
    const incomes = get().getUserIncomes(userId);
    const expenses = get().getUserExpenses(userId);
    return initial + incomes - expenses;
  },

  getCoupleTotalBalance: () => {
    const { users } = get();
    return users.reduce((sum, u) => sum + get().getUserBalance(u.id), 0);
  },

  getCoupleTotalExpenses: () => {
    return get()
      .transactions.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getCoupleTotalIncomes: () => {
    return get()
      .transactions.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getWeeklyTrend: (userId: string) => {
    const { transactions } = get();
    const baseBalance = get().getUserBalance(userId);
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return days.map((day, idx) => {
      // Deterministic smooth curve based on current balance
      const factor = 1 - (6 - idx) * 0.035;
      const variation = (idx % 2 === 0 ? 1 : -1) * (baseBalance * 0.02);
      return {
        day,
        value: Math.max(0, Math.round(baseBalance * factor + variation)),
      };
    });
  },
}));
