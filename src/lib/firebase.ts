import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, Transaction, BudgetGoal } from '../types/finance';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Functions
export async function loginWithGoogle(): Promise<{ user: FirebaseUser; account: UserAccount }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  // Check if user document already exists in Firestore
  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);

  let account: UserAccount;

  if (snap.exists()) {
    account = snap.data() as UserAccount;
  } else {
    // Create new profile for Google user
    const fullName = fbUser.displayName || 'Usuário Google';
    const firstName = fullName.split(' ')[0] || 'Usuário';
    const initial = firstName.charAt(0).toUpperCase() || 'U';

    account = {
      id: fbUser.uid,
      name: fullName,
      shortName: firstName,
      email: fbUser.email || '',
      avatarColor: '#0E1B25',
      neonColor: '#00F0FF',
      avatarInitial: initial,
      bankName: 'Nubank',
      primaryCard: 'Nubank Ultravioleta',
      accountNumber: `Ag 0001 • C/C ${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(Math.random() * 9)}`,
      monthlySalary: 7500.0,
      initialBalance: 3500.0,
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, account);

    // Create default goals in Firestore for this new user
    const initialGoals: BudgetGoal[] = [
      {
        id: `goal_${Date.now()}_1`,
        userId: fbUser.uid,
        title: 'Alimentação & Mercado',
        spent: 0,
        limit: Math.round(account.monthlySalary * 0.25),
        percentage: 0,
        color: '#FF7A00',
        glowColor: 'rgba(255, 122, 0, 0.45)',
        icon: '🛒',
      },
      {
        id: `goal_${Date.now()}_2`,
        userId: fbUser.uid,
        title: 'Moradia & Contas',
        spent: 0,
        limit: Math.round(account.monthlySalary * 0.35),
        percentage: 0,
        color: '#0066FF',
        glowColor: 'rgba(0, 102, 255, 0.45)',
        icon: '🏠',
      },
      {
        id: `goal_${Date.now()}_3`,
        userId: fbUser.uid,
        title: 'Lazer & Experiências',
        spent: 0,
        limit: Math.round(account.monthlySalary * 0.15),
        percentage: 0,
        color: '#00F0FF',
        glowColor: 'rgba(0, 240, 255, 0.45)',
        icon: '🥂',
      },
      {
        id: `goal_${Date.now()}_4`,
        userId: fbUser.uid,
        title: 'Investimento & Reserva',
        spent: 0,
        limit: Math.round(account.monthlySalary * 0.2),
        percentage: 0,
        color: '#39FF14',
        glowColor: 'rgba(57, 255, 20, 0.45)',
        icon: '📈',
      },
    ];

    for (const g of initialGoals) {
      await setDoc(doc(db, 'goals', g.id), g);
    }

    // Initial deposit transaction
    const depositTx: Transaction = {
      id: `tx_${Date.now()}_init`,
      userId: fbUser.uid,
      description: 'Depósito / Saldo Inicial Google Account',
      amount: account.initialBalance,
      type: 'income',
      category: 'Depósito Inicial',
      categoryIcon: '💰',
      categoryColor: '#39FF14',
      date: 'Hoje',
      cardName: account.bankName,
    };
    await setDoc(doc(db, 'transactions', depositTx.id), depositTx);
  }

  return { user: fbUser, account };
}

export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; account: UserAccount }> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);

  let account: UserAccount;
  if (snap.exists()) {
    account = snap.data() as UserAccount;
  } else {
    const firstName = (fbUser.displayName || email.split('@')[0] || 'Usuário');
    account = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      shortName: firstName,
      email: fbUser.email || email,
      avatarColor: '#0E1B25',
      neonColor: '#00F0FF',
      avatarInitial: firstName.charAt(0).toUpperCase() || 'U',
      bankName: 'Nubank',
      primaryCard: 'Nubank Ultravioleta',
      accountNumber: 'Ag 0001 • C/C 12345-6',
      monthlySalary: 6000.0,
      initialBalance: 2000.0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, account);
  }

  return { user: fbUser, account };
}

export async function registerWithEmail(
  data: {
    name: string;
    email: string;
    password: string;
    bankName?: string;
    primaryCard?: string;
    accountNumber?: string;
    monthlySalary?: number;
    initialBalance?: number;
    neonColor?: string;
  }
): Promise<{ user: FirebaseUser; account: UserAccount }> {
  const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const fbUser = result.user;

  const trimmedName = data.name.trim();
  const firstName = trimmedName.split(' ')[0] || 'Usuário';
  const initial = firstName.charAt(0).toUpperCase() || 'U';
  const bank = data.bankName?.trim() || 'Nubank';
  const initialBal = Number(data.initialBalance) || 0;

  const account: UserAccount = {
    id: fbUser.uid,
    name: trimmedName,
    shortName: firstName,
    email: data.email.toLowerCase().trim(),
    avatarColor: '#0E1B25',
    neonColor: data.neonColor || '#00F0FF',
    avatarInitial: initial,
    bankName: bank,
    primaryCard: data.primaryCard?.trim() || `${bank} Cartão`,
    accountNumber: data.accountNumber?.trim() || `Ag 0001 • C/C ${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(Math.random() * 9)}`,
    monthlySalary: Number(data.monthlySalary) || 5000.0,
    initialBalance: initialBal,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', fbUser.uid), account);

  // Create initial goals in Firestore
  const initialGoals: BudgetGoal[] = [
    {
      id: `goal_${Date.now()}_1`,
      userId: fbUser.uid,
      title: 'Alimentação & Mercado',
      spent: 0,
      limit: Math.round(account.monthlySalary * 0.25),
      percentage: 0,
      color: '#FF7A00',
      glowColor: 'rgba(255, 122, 0, 0.45)',
      icon: '🛒',
    },
    {
      id: `goal_${Date.now()}_2`,
      userId: fbUser.uid,
      title: 'Moradia & Contas',
      spent: 0,
      limit: Math.round(account.monthlySalary * 0.35),
      percentage: 0,
      color: '#0066FF',
      glowColor: 'rgba(0, 102, 255, 0.45)',
      icon: '🏠',
    },
    {
      id: `goal_${Date.now()}_3`,
      userId: fbUser.uid,
      title: 'Lazer & Experiências',
      spent: 0,
      limit: Math.round(account.monthlySalary * 0.15),
      percentage: 0,
      color: '#00F0FF',
      glowColor: 'rgba(0, 240, 255, 0.45)',
      icon: '🥂',
    },
    {
      id: `goal_${Date.now()}_4`,
      userId: fbUser.uid,
      title: 'Investimento & Reserva',
      spent: 0,
      limit: Math.round(account.monthlySalary * 0.2),
      percentage: 0,
      color: '#39FF14',
      glowColor: 'rgba(57, 255, 20, 0.45)',
      icon: '📈',
    },
  ];

  for (const g of initialGoals) {
    await setDoc(doc(db, 'goals', g.id), g);
  }

  // Initial deposit transaction if balance > 0
  if (initialBal > 0) {
    const depositTx: Transaction = {
      id: `tx_${Date.now()}_init`,
      userId: fbUser.uid,
      description: 'Depósito / Saldo Inicial',
      amount: initialBal,
      type: 'income',
      category: 'Depósito Inicial',
      categoryIcon: '💰',
      categoryColor: '#39FF14',
      date: 'Hoje',
      cardName: account.bankName,
    };
    await setDoc(doc(db, 'transactions', depositTx.id), depositTx);
  }

  return { user: fbUser, account };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Database Operations
export async function syncUserProfile(user: UserAccount): Promise<void> {
  if (!user.id) return;
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
}

export async function addTransactionToFirestore(tx: Transaction): Promise<void> {
  await setDoc(doc(db, 'transactions', tx.id), tx);
}

export async function deleteTransactionFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'transactions', id));
}

export async function addGoalToFirestore(goal: BudgetGoal): Promise<void> {
  await setDoc(doc(db, 'goals', goal.id), goal);
}

export async function updateGoalInFirestore(goal: BudgetGoal): Promise<void> {
  await updateDoc(doc(db, 'goals', goal.id), {
    spent: goal.spent,
    percentage: goal.percentage,
    limit: goal.limit,
  });
}
