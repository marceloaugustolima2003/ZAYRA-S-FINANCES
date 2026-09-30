import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  Transaction,
  FinancialGoal,
  CategoryBudget,
} from '../types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_BUDGETS,
} from '../data/initialData';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in using Google Popup (standard for AI Studio web iframe)
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Register a new user with email, password, and full name
 */
export async function registerWithEmail(name: string, email: string, pass: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  try {
    await updateProfile(userCredential.user, { displayName: name });
  } catch (e) {
    console.error('Failed to update displayName:', e);
  }
  await syncUserProfile({
    ...userCredential.user,
    displayName: name,
    email: email,
  } as User);
  return userCredential.user;
}

/**
 * Log in with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

/**
 * Get user profile from Firestore /users/{uid}
 */
export async function getUserProfile(uid: string): Promise<{ displayName?: string; email?: string } | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as { displayName?: string; email?: string };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-Out Error:', error);
    throw error;
  }
}

/**
 * Listen for user auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Sync or create user profile in /users/{userId}
 */
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        displayName: user.displayName || 'Usuário Zayra',
        email: user.email || '',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Purge demo data if present in user's account
 */
export async function purgeDemoDataFromUser(userId: string): Promise<void> {
  const demoTxIds = ['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'];
  for (const id of demoTxIds) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', id));
    } catch {
      // ignore
    }
  }
  const demoGoalIds = ['goal-1', 'goal-2', 'goal-3'];
  for (const id of demoGoalIds) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'goals', id));
    } catch {
      // ignore
    }
  }
}

/**
 * Reset user wallet to completely clean state
 */
export async function resetUserWalletToZero(userId: string): Promise<void> {
  try {
    const txCol = collection(db, 'users', userId, 'transactions');
    const snap = await getDocs(txCol);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const goalsCol = collection(db, 'users', userId, 'goals');
    const goalsSnap = await getDocs(goalsCol);
    const goalDeletePromises = goalsSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(goalDeletePromises);
  } catch (err) {
    console.error('Error resetting user wallet:', err);
  }
}

/**
 * Initialize default category budget ceilings for new users without fake transactions
 */
export async function initUserBudgetsIfEmpty(userId: string): Promise<void> {
  try {
    const budgetCol = collection(db, 'users', userId, 'budgets');
    const existing = await getDocs(budgetCol);
    if (!existing.empty) return;

    for (const budget of INITIAL_BUDGETS) {
      const budgetId = `budget-${budget.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const cleanBudget = {
        userId,
        category: budget.category,
        limit: budget.limit,
        color: budget.color,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userId, 'budgets', budgetId), cleanBudget);
    }
  } catch (error) {
    console.warn('Initializing budgets error (non-fatal):', error);
  }
}

/**
 * Subscribe to real-time transactions
 */
export function subscribeTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void
) {
  const path = `users/${userId}/transactions`;
  const txCol = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    txCol,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        txs.push({
          id: d.id,
          title: data.title,
          category: data.category,
          institution: data.institution,
          paymentMethod: data.paymentMethod,
          amount: Number(data.amount) || 0,
          type: data.type as 'income' | 'expense',
          date: data.date,
          time: data.time,
          notes: data.notes,
          iconName: data.iconName,
        });
      });
      // Sort newest first
      txs.sort((a, b) => (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time));
      onData(txs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Add transaction to Firestore
 */
export async function addTransaction(
  userId: string,
  txData: Omit<Transaction, 'id'>
): Promise<string> {
  const newId = `tx-${Date.now()}`;
  const path = `users/${userId}/transactions/${newId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', newId);
    await setDoc(txRef, {
      ...txData,
      userId,
      createdAt: new Date().toISOString(),
    });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete transaction from Firestore
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(txRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to real-time goals
 */
export function subscribeGoals(
  userId: string,
  onData: (goals: FinancialGoal[]) => void
) {
  const path = `users/${userId}/goals`;
  const goalsCol = collection(db, 'users', userId, 'goals');

  return onSnapshot(
    goalsCol,
    (snapshot) => {
      const goals: FinancialGoal[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        goals.push({
          id: d.id,
          title: data.title,
          category: data.category,
          targetAmount: Number(data.targetAmount) || 0,
          currentAmount: Number(data.currentAmount) || 0,
          deadline: data.deadline,
          icon: data.icon || 'flag',
          color: data.color || '#a855f7',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      onData(goals);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Create a new goal in Firestore
 */
export async function addGoal(
  userId: string,
  goalData: Omit<FinancialGoal, 'id' | 'createdAt'>
): Promise<string> {
  const newId = `goal-${Date.now()}`;
  const path = `users/${userId}/goals/${newId}`;
  try {
    const goalRef = doc(db, 'users', userId, 'goals', newId);
    await setDoc(goalRef, {
      ...goalData,
      userId,
      createdAt: new Date().toISOString(),
    });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update existing goal amount in Firestore
 */
export async function contributeToGoalInFirestore(
  userId: string,
  goalId: string,
  newAmount: number
): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalRef, {
      currentAmount: newAmount,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribe to real-time budgets
 */
export function subscribeBudgets(
  userId: string,
  onData: (budgets: CategoryBudget[]) => void
) {
  const path = `users/${userId}/budgets`;
  const budgetsCol = collection(db, 'users', userId, 'budgets');

  return onSnapshot(
    budgetsCol,
    (snapshot) => {
      const budgets: CategoryBudget[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        budgets.push({
          category: data.category,
          spent: Number(data.spent) || 0,
          limit: Number(data.limit) || 1000,
          color: data.color || '#a855f7',
        });
      });
      onData(budgets);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Update budget limit in Firestore
 */
export async function updateBudgetLimitInFirestore(
  userId: string,
  category: string,
  newLimit: number
): Promise<void> {
  const budgetId = `budget-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const path = `users/${userId}/budgets/${budgetId}`;
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);
    await setDoc(
      budgetRef,
      {
        userId,
        category,
        limit: newLimit,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
