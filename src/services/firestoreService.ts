import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserAccount, Transaction, BudgetGoal, RecurringTransaction } from '../types/finance';

// ================= ERROR HANDLING AS MANDATED BY FIREBASE SKILL =================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Application Startup
export async function testFirestoreConnection(): Promise<boolean> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connection.');
    }
    return false;
  }
}

// ================= SEED DATA DEFAULTS =================

export const INITIAL_FIRESTORE_USERS: UserAccount[] = [
  {
    id: 'user_marcelo',
    name: 'Marcelo Augusto',
    shortName: 'Marcelo',
    email: 'marceloaugustolima2003@gmail.com',
    avatarColor: '#0E1B25',
    neonColor: '#00F0FF',
    avatarInitial: 'M',
    bankName: 'Nubank',
    primaryCard: 'Nubank Ultravioleta',
    accountNumber: 'Ag 0001 • C/C 84920-1',
    monthlySalary: 8200.0,
    initialBalance: 4250.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_zayra_partner',
    name: 'Gabriela Duarte',
    shortName: 'Gabi',
    email: 'gabi.duarte@email.com',
    avatarColor: '#23121E',
    neonColor: '#FF70A6',
    avatarInitial: 'G',
    bankName: 'Inter',
    primaryCard: 'Inter Black Mastercard',
    accountNumber: 'Ag 0001 • C/C 39102-8',
    monthlySalary: 7400.0,
    initialBalance: 3900.0,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_FIRESTORE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    userId: 'user_marcelo',
    description: 'Pão de Açúcar Mercado Casal',
    amount: 342.8,
    type: 'expense',
    category: 'Alimentação',
    categoryIcon: '🛒',
    categoryColor: '#FF7A00',
    date: 'Hoje, 14:32',
    cardName: 'Nubank Ultravioleta',
    note: 'Compras da semana para o jantar especial',
  },
  {
    id: 'tx_seed_2',
    userId: 'user_zayra_partner',
    description: 'Jantar Romântico & Vinhos',
    amount: 215.5,
    type: 'expense',
    category: 'Lazer',
    categoryIcon: '🥂',
    categoryColor: '#00F0FF',
    date: 'Ontem, 20:15',
    cardName: 'Inter Black Mastercard',
    note: 'Comemoração de aniversário de namoro',
  },
  {
    id: 'tx_seed_3',
    userId: 'user_marcelo',
    description: 'Consultoria UI/UX & Código',
    amount: 1950.0,
    type: 'income',
    category: 'Consultoria',
    categoryIcon: '✨',
    categoryColor: '#00F0FF',
    date: '25 Set',
    cardName: 'Nubank',
    note: 'Projeto freela internacional',
  },
  {
    id: 'tx_seed_4',
    userId: 'user_zayra_partner',
    description: 'Ração Especial & Pet Shop Zayra',
    amount: 189.9,
    type: 'expense',
    category: 'Pet Shop',
    categoryIcon: '🐾',
    categoryColor: '#FF70A6',
    date: '24 Set',
    cardName: 'Inter Black Mastercard',
    note: 'Ração super premium & brinquedos para a Zayra',
  },
  {
    id: 'tx_seed_5',
    userId: 'user_marcelo',
    description: 'Uber & Transporte Urbano',
    amount: 42.6,
    type: 'expense',
    category: 'Transporte',
    categoryIcon: '⛽',
    categoryColor: '#39FF14',
    date: '23 Set',
    cardName: 'Nubank Ultravioleta',
  },
  {
    id: 'tx_seed_6',
    userId: 'user_zayra_partner',
    description: 'Dividendos & Rendimentos CDI',
    amount: 430.0,
    type: 'income',
    category: 'Investimentos',
    categoryIcon: '📈',
    categoryColor: '#39FF14',
    date: '22 Set',
    cardName: 'Inter',
    note: 'Rendimentos da caixinha de reserva',
  },
];

export const INITIAL_FIRESTORE_GOALS: BudgetGoal[] = [
  {
    id: 'goal_m1',
    userId: 'user_marcelo',
    title: 'Alimentação & Supermercado',
    spent: 890,
    limit: 1600,
    percentage: 55,
    color: '#FF7A00',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '🛒',
  },
  {
    id: 'goal_m2',
    userId: 'user_marcelo',
    title: 'Lazer & Restaurantes',
    spent: 420,
    limit: 800,
    percentage: 52,
    color: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    icon: '🥂',
  },
  {
    id: 'goal_g1',
    userId: 'user_zayra_partner',
    title: 'Alimentação & Delivery',
    spent: 650,
    limit: 1400,
    percentage: 46,
    color: '#FF0055',
    glowColor: 'rgba(255, 0, 85, 0.45)',
    icon: '🍔',
  },
  {
    id: 'goal_g2',
    userId: 'user_zayra_partner',
    title: 'Moradia & Contas Fixas',
    spent: 1250,
    limit: 2200,
    percentage: 56,
    color: '#0066FF',
    glowColor: 'rgba(0, 102, 255, 0.45)',
    icon: '🏠',
  },
  {
    id: 'goal_g3',
    userId: 'user_zayra_partner',
    title: 'Pet Zayra & Cuidados',
    spent: 310,
    limit: 600,
    percentage: 51,
    color: '#FF70A6',
    glowColor: 'rgba(255, 112, 166, 0.45)',
    icon: '🐾',
  },
];

export const INITIAL_FIRESTORE_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec_seed_1',
    userId: 'user_marcelo',
    description: 'Salário Tech & Consultoria',
    amount: 8200.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 5,
    cardName: 'Nubank',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-05',
    nextDueDate: '2026-10-05',
  },
  {
    id: 'rec_seed_2',
    userId: 'user_marcelo',
    description: 'Netflix 4K Ultra HD (Casal)',
    amount: 55.9,
    type: 'expense',
    category: 'Lazer',
    categoryIcon: '🎬',
    categoryColor: '#FF0055',
    frequency: 'monthly',
    dayOfMonth: 10,
    cardName: 'Nubank Ultravioleta',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-10',
    nextDueDate: '2026-10-10',
  },
  {
    id: 'rec_seed_3',
    userId: 'user_marcelo',
    description: 'Spotify Premium Duo',
    amount: 34.9,
    type: 'expense',
    category: 'Lazer',
    categoryIcon: '🎵',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 15,
    cardName: 'Nubank Ultravioleta',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-15',
    nextDueDate: '2026-10-15',
  },
  {
    id: 'rec_seed_4',
    userId: 'user_zayra_partner',
    description: 'Salário & Dividendos',
    amount: 7400.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 5,
    cardName: 'Inter',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-05',
    nextDueDate: '2026-10-05',
  },
  {
    id: 'rec_seed_5',
    userId: 'user_zayra_partner',
    description: 'Condomínio Residencial',
    amount: 890.0,
    type: 'expense',
    category: 'Moradia',
    categoryIcon: '🏠',
    categoryColor: '#0066FF',
    frequency: 'monthly',
    dayOfMonth: 1,
    cardName: 'Inter Black Mastercard',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-01',
    nextDueDate: '2026-10-01',
  },
  {
    id: 'rec_seed_6',
    userId: 'user_zayra_partner',
    description: 'Plano Saúde & Cuidados Zayra Pet',
    amount: 180.0,
    type: 'expense',
    category: 'Pet Shop',
    categoryIcon: '🐾',
    categoryColor: '#FF70A6',
    frequency: 'monthly',
    dayOfMonth: 20,
    cardName: 'Inter Black Mastercard',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-20',
    nextDueDate: '2026-10-20',
  },
];

// ================= USERS FIRESTORE SERVICE =================

export async function fetchFirestoreUsers(): Promise<UserAccount[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default initial users into Firestore
      await seedFirestoreInitialData();
      return INITIAL_FIRESTORE_USERS;
    }
    return snap.docs.map((d) => d.data() as UserAccount);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirestoreUser(user: UserAccount): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreUser(userId: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeFirestoreUsers(onUpdate: (users: UserAccount[]) => void): Unsubscribe {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const users = snapshot.docs.map((d) => d.data() as UserAccount);
      if (users.length > 0) {
        onUpdate(users);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ================= TRANSACTIONS FIRESTORE SERVICE =================

export async function fetchFirestoreTransactions(): Promise<Transaction[]> {
  const path = 'transactions';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as Transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirestoreTransaction(tx: Transaction): Promise<void> {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveFirestoreTransactionsBatch(txs: Transaction[]): Promise<void> {
  const path = 'transactions';
  try {
    const batch = writeBatch(db);
    for (const tx of txs) {
      batch.set(doc(db, 'transactions', tx.id), tx);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreTransaction(id: string): Promise<void> {
  const path = `transactions/${id}`;
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeFirestoreTransactions(onUpdate: (txs: Transaction[]) => void): Unsubscribe {
  const path = 'transactions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const txs = snapshot.docs.map((d) => d.data() as Transaction);
      onUpdate(txs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ================= BUDGET GOALS FIRESTORE SERVICE =================

export async function fetchFirestoreGoals(): Promise<BudgetGoal[]> {
  const path = 'goals';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as BudgetGoal);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirestoreGoal(goal: BudgetGoal): Promise<void> {
  const path = `goals/${goal.id}`;
  try {
    await setDoc(doc(db, 'goals', goal.id), goal, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeFirestoreGoals(onUpdate: (goals: BudgetGoal[]) => void): Unsubscribe {
  const path = 'goals';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const goals = snapshot.docs.map((d) => d.data() as BudgetGoal);
      onUpdate(goals);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ================= RECURRING TRANSACTIONS FIRESTORE SERVICE =================

export async function fetchFirestoreRecurring(): Promise<RecurringTransaction[]> {
  const path = 'recurring';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as RecurringTransaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFirestoreRecurring(rec: RecurringTransaction): Promise<void> {
  const path = `recurring/${rec.id}`;
  try {
    await setDoc(doc(db, 'recurring', rec.id), rec, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreRecurring(id: string): Promise<void> {
  const path = `recurring/${id}`;
  try {
    await deleteDoc(doc(db, 'recurring', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeFirestoreRecurring(onUpdate: (items: RecurringTransaction[]) => void): Unsubscribe {
  const path = 'recurring';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as RecurringTransaction);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ================= COUPLE INVITES FIRESTORE SERVICE =================

export async function sendFirestoreCoupleInvite(
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
  const cleanEmail = partnerEmail.toLowerCase().trim();

  // Check if target user exists in Firestore
  const users = await fetchFirestoreUsers();
  const existingPartner = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existingPartner) {
    const inviteDoc = {
      id: `invite_${Date.now()}`,
      inviterId,
      partnerEmail: cleanEmail,
      status: 'accepted' as const,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'invites', inviteDoc.id), inviteDoc);

    return {
      success: true,
      status: 'connected',
      partner: existingPartner,
      message: `Conta de ${existingPartner.name} vinculada com sucesso ao seu casal no Firestore!`,
    };
  }

  // Create pending invite
  const newInvite = {
    id: `invite_${Date.now()}`,
    inviterId,
    partnerEmail: cleanEmail,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'invites', newInvite.id), newInvite);

  return {
    success: true,
    status: 'pending',
    inviteId: newInvite.id,
    partnerEmail: cleanEmail,
    inviteLink: `${window.location.origin}/#register?coupleInvite=${newInvite.id}&inviter=${inviterId}`,
    message: `Convite de casal registrado no Firestore para ${cleanEmail}. Link pronto para envio!`,
  };
}

export async function unlinkFirestoreCouple(inviterId: string): Promise<void> {
  const path = 'invites';
  try {
    const snap = await getDocs(collection(db, path));
    const toDelete = snap.docs.filter((d) => d.data().inviterId === inviterId);
    for (const d of toDelete) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= SEED DATA FUNCTION =================

export async function seedFirestoreInitialData(): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const user of INITIAL_FIRESTORE_USERS) {
      batch.set(doc(db, 'users', user.id), user);
    }

    for (const tx of INITIAL_FIRESTORE_TRANSACTIONS) {
      batch.set(doc(db, 'transactions', tx.id), tx);
    }

    for (const goal of INITIAL_FIRESTORE_GOALS) {
      batch.set(doc(db, 'goals', goal.id), goal);
    }

    for (const rec of INITIAL_FIRESTORE_RECURRING) {
      batch.set(doc(db, 'recurring', rec.id), rec);
    }

    await batch.commit();
    console.log('[Firestore] Base initial data seeded successfully to cloud Firestore.');
  } catch (error) {
    console.warn('[Firestore] Notice during initial seeding:', error);
  }
}
