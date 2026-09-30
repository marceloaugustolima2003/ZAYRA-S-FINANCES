import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { BottomNav, NavigationTab } from './components/BottomNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { GoalsScreen } from './components/screens/GoalsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { LoginScreen } from './components/screens/LoginScreen';

import { TransactionModal } from './components/modals/TransactionModal';
import { AdvisoryModal } from './components/modals/AdvisoryModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { FaceIdModal } from './components/modals/FaceIdModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { GoalContributionModal } from './components/modals/GoalContributionModal';

import {
  subscribeToAuth,
  signOutUser,
  purgeDemoDataFromUser,
  resetUserWalletToZero,
  initUserBudgetsIfEmpty,
  syncUserProfile,
  getUserProfile,
  subscribeTransactions,
  addTransaction,
  deleteTransaction,
  subscribeGoals,
  addGoal,
  contributeToGoalInFirestore,
  subscribeBudgets,
  updateBudgetLimitInFirestore,
} from './services/firebaseService';

import {
  INITIAL_CATEGORIES,
  INITIAL_BUDGETS,
  INITIAL_BANKS,
  INITIAL_NOTIFICATIONS,
  ADVISORY_OPPORTUNITIES,
} from './data/initialData';
import {
  Transaction,
  TransactionType,
  FinancialGoal,
  CategoryExpense,
  CategoryBudget,
  BankAccount,
  AppNotification,
} from './types/finance';

const MONTH_MAP: { [key: string]: string } = {
  Janeiro: '01',
  Fevereiro: '02',
  Março: '03',
  Abril: '04',
  Maio: '05',
  Junho: '06',
  Julho: '07',
  Agosto: '08',
  Setembro: '09',
  Outubro: '10',
  Novembro: '11',
  Dezembro: '12',
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');
  const [selectedMonth, setSelectedMonth] = useState('Outubro');
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('zayra_user_name') || 'Marcelo';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('zayra_user_email') || 'marceloaugustolima2003@gmail.com';
  });

  // Core Data States - clean for real users
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryExpense[]>(INITIAL_CATEGORIES);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(
    INITIAL_BUDGETS.map((b) => ({ ...b, spent: 0 }))
  );
  const [banks, setBanks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<FinancialGoal | null>(null);

  // Currency Formatter
  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Firebase Authentication & Real-time Listeners
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsAuthenticated(true);
        const profile = await getUserProfile(user.uid);
        const resolvedName =
          profile?.displayName ||
          user.displayName ||
          (user.email ? user.email.split('@')[0] : '') ||
          localStorage.getItem('zayra_user_name') ||
          'Marcelo';
        const resolvedEmail =
          user.email ||
          profile?.email ||
          localStorage.getItem('zayra_user_email') ||
          'marceloaugustolima2003@gmail.com';

        setUserName(resolvedName);
        setUserEmail(resolvedEmail);
        localStorage.setItem('zayra_user_name', resolvedName);
        localStorage.setItem('zayra_user_email', resolvedEmail);

        // Initialize category budgets if empty
        initUserBudgetsIfEmpty(user.uid);
        // Automatically purge any previously seeded Mariana demo transactions from real accounts
        await purgeDemoDataFromUser(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore updates when user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubTx = subscribeTransactions(firebaseUser.uid, (remoteTxs) => {
      setTransactions(remoteTxs);
    });

    const unsubGoals = subscribeGoals(firebaseUser.uid, (remoteGoals) => {
      setGoals(remoteGoals);
    });

    const unsubBudgets = subscribeBudgets(firebaseUser.uid, (remoteBudgets) => {
      if (remoteBudgets.length > 0) {
        setBudgets(remoteBudgets);
      }
    });

    return () => {
      unsubTx();
      unsubGoals();
      unsubBudgets();
    };
  }, [firebaseUser]);

  // Month code for selectedMonth (e.g. '09' for Setembro, '10' for Outubro)
  const monthCode = MONTH_MAP[selectedMonth] || '10';

  // Filter transactions for the selected month
  const selectedMonthTransactions = transactions.filter((tx) => {
    const parts = tx.date.split('-');
    return parts[1] === monthCode;
  });

  // Financial calculations from real user data filtered by selected month
  const totalIncomes = selectedMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = selectedMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalInvested = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  // Real Net worth based exclusively on user transactions and goals
  const netWorth = Math.max(0, totalIncomes - totalExpenses + totalInvested);

  // Recalculate category distribution and budgets from selected month transactions
  useEffect(() => {
    const expenseTxs = selectedMonthTransactions.filter((tx) => tx.type === 'expense');

    // Update budgets spent dynamically
    setBudgets((prev) =>
      prev.map((b) => {
        const spent = expenseTxs
          .filter((tx) => tx.category === b.category)
          .reduce((sum, tx) => sum + tx.amount, 0);
        return { ...b, spent };
      })
    );

    // Update categories
    if (expenseTxs.length === 0) {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          amount: 0,
          percentage: 0,
        }))
      );
      return;
    }

    const totalsByCategory: { [cat: string]: number } = {};
    expenseTxs.forEach((tx) => {
      totalsByCategory[tx.category] = (totalsByCategory[tx.category] || 0) + tx.amount;
    });

    const overall = Object.values(totalsByCategory).reduce((a, b) => a + b, 0);
    if (overall > 0) {
      setCategories((prev) =>
        prev.map((c) => {
          const catAmount = totalsByCategory[c.name] || 0;
          return {
            ...c,
            amount: catAmount,
            percentage: Math.max(0, Math.round((catAmount / overall) * 100)),
          };
        })
      );
    }
  }, [transactions, selectedMonth]);

  // Handlers for transactions
  const handleSaveTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    const newTxId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...newTxData,
      id: newTxId,
      iconName:
        newTxData.category === 'Alimentação'
          ? 'shopping-cart'
          : newTxData.category === 'Transporte'
          ? 'fuel'
          : newTxData.category === 'Salário'
          ? 'building'
          : newTxData.category === 'Lazer'
          ? 'clapperboard'
          : 'package',
    };

    // Optimistic local state update
    setTransactions((prev) => [newTx, ...prev]);

    // Firestore persistence
    if (firebaseUser) {
      try {
        await addTransaction(firebaseUser.uid, newTxData);
      } catch (err) {
        console.error('Failed to sync transaction to Firestore:', err);
      }
    }

    // If it's an expense, update budgets
    if (newTx.type === 'expense') {
      setBudgets((prev) =>
        prev.map((b) =>
          b.category === newTx.category
            ? { ...b, spent: b.spent + newTx.amount }
            : b
        )
      );
    }

    // Add notification
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${newTx.type === 'income' ? 'Entrada' : 'Saída'} registrada`,
      message: `${newTx.title}: ${formatCurrency(newTx.amount)} via ${newTx.institution}`,
      time: 'Agora',
      unread: true,
      type: newTx.type === 'income' ? 'success' : 'info',
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleDeleteTransaction = async (id: string) => {
    // Optimistic update
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

    // Firestore persistence
    if (firebaseUser) {
      try {
        await deleteTransaction(firebaseUser.uid, id);
      } catch (err) {
        console.error('Failed to delete transaction from Firestore:', err);
      }
    }
  };

  // Goal contribution handler
  const handleContributeToGoal = async (goalId: string, amount: number) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newAmount = targetGoal.currentAmount + amount;

    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
    );

    // Firestore persistence
    if (firebaseUser) {
      try {
        await contributeToGoalInFirestore(firebaseUser.uid, goalId, newAmount);
      } catch (err) {
        console.error('Failed to update goal in Firestore:', err);
      }
    }

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Aporte Realizado',
      message: `Aporte de ${formatCurrency(amount)} adicionado com sucesso em "${targetGoal.title}"`,
      time: 'Agora',
      unread: true,
      type: 'success',
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Create Goal
  const handleCreateGoal = async (goalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoalId = `goal-${Date.now()}`;
    const newGoal: FinancialGoal = {
      ...goalData,
      id: newGoalId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setGoals((prev) => [...prev, newGoal]);

    // Firestore persistence
    if (firebaseUser) {
      try {
        await addGoal(firebaseUser.uid, goalData);
      } catch (err) {
        console.error('Failed to add goal to Firestore:', err);
      }
    }
  };

  // Update budget limit
  const handleUpdateBudgetLimit = async (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );

    // Firestore persistence
    if (firebaseUser) {
      try {
        await updateBudgetLimitInFirestore(firebaseUser.uid, category, newLimit);
      } catch (err) {
        console.error('Failed to update budget in Firestore:', err);
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setIsAuthenticated(false);
  };

  // Reset wallet / clear all demo data
  const handleResetWallet = async () => {
    if (firebaseUser) {
      await resetUserWalletToZero(firebaseUser.uid);
    }
    setTransactions([]);
    setGoals([]);
    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Carteira Zerada',
      message: 'Todos os lançamentos foram limpos. Sua conta está zerada e pronta.',
      time: 'Agora',
      unread: true,
      type: 'info',
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Profile update handler
  const handleUpdateProfile = (newName: string, newEmail: string) => {
    if (newName) {
      setUserName(newName);
      localStorage.setItem('zayra_user_name', newName);
    }
    if (newEmail) {
      setUserEmail(newEmail);
      localStorage.setItem('zayra_user_email', newEmail);
    }
    if (firebaseUser) {
      syncUserProfile({
        ...firebaseUser,
        displayName: newName,
        email: newEmail || firebaseUser.email,
      } as User);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = 'ID,Data,Horario,Titulo,Categoria,Instituicao,FormaPagamento,Tipo,Valor\n';
    const rows = transactions
      .map(
        (tx) =>
          `"${tx.id}","${tx.date}","${tx.time}","${tx.title}","${tx.category}","${tx.institution}","${tx.paymentMethod}","${tx.type}",${tx.amount}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `extrato_zayra_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'inicio':
        return 'Início';
      case 'transacoes':
        return 'Transações';
      case 'orcamentos':
        return 'Orçamentos';
      case 'metas':
        return 'Metas';
      case 'ajustes':
        return 'Ajustes';
    }
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const emergencyGoal = goals.find((g) => g.id === 'goal-1') || goals[0];

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(name, email) => {
          if (name) {
            setUserName(name);
            localStorage.setItem('zayra_user_name', name);
          }
          if (email) {
            setUserEmail(email);
            localStorage.setItem('zayra_user_email', email);
          }
          setIsAuthenticated(true);
        }}
        defaultUserName={userName}
        defaultUserEmail={userEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-[#dfe2ef] relative selection:bg-purple-500/30 selection:text-purple-300">
      {/* Ambient background light leaks */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-purple-600/15 via-indigo-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Main Container - Mobile First Frame */}
      <div className="relative max-w-md mx-auto min-h-screen flex flex-col border-x border-white/[0.04] bg-[#090d16] shadow-2xl">
        {/* Top Header */}
        <Header
          currentTab={activeTab}
          tabTitle={getTabTitle(activeTab)}
          selectedMonth={selectedMonth}
          onSelectMonth={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onLockApp={() => setIsAuthenticated(false)}
          unreadCount={unreadNotifCount}
          userName={userName}
        />

        {/* Month Dropdown Popover */}
        {isMonthPickerOpen && (
          <div className="absolute top-24 right-4 z-40 p-2 rounded-2xl bg-[#141c2c] border border-white/10 shadow-2xl space-y-1 animate-scaleUp">
            {['Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setIsMonthPickerOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedMonth === m
                    ? 'bg-purple-600 text-white font-bold shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Body Content with Tab Switching */}
        <main className="flex-1 px-4 pt-3">
          {activeTab === 'inicio' && (
            <HomeScreen
              netWorth={netWorth}
              incomes={totalIncomes}
              expenses={totalExpenses}
              invested={totalInvested}
              isBalanceHidden={isBalanceHidden}
              onToggleHideBalance={() => setIsBalanceHidden(!isBalanceHidden)}
              categories={categories}
              emergencyGoal={emergencyGoal}
              recentTransactions={
                selectedMonthTransactions.length > 0
                  ? selectedMonthTransactions
                  : transactions.slice(0, 6)
              }
              onOpenNewTransaction={(type) => {
                setTransactionModalType(type);
                setIsTransactionModalOpen(true);
              }}
              onOpenGoalContribution={(goal) => setSelectedGoalForContribution(goal)}
              onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
              onNavigateToTransactions={() => setActiveTab('transacoes')}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'transacoes' && (
            <TransactionsScreen
              transactions={
                selectedMonthTransactions.length > 0
                  ? selectedMonthTransactions
                  : transactions
              }
              onOpenNewTransaction={(type) => {
                setTransactionModalType(type);
                setIsTransactionModalOpen(true);
              }}
              onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'orcamentos' && (
            <BudgetsScreen
              budgets={budgets}
              transactions={transactions}
              selectedMonth={selectedMonth}
              onUpdateBudget={handleUpdateBudgetLimit}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'metas' && (
            <GoalsScreen
              goals={goals}
              onOpenContribute={(goal) => setSelectedGoalForContribution(goal)}
              onCreateGoal={handleCreateGoal}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'ajustes' && (
            <SettingsScreen
              userName={userName}
              userEmail={userEmail || firebaseUser?.email || ''}
              userPhotoURL={firebaseUser?.photoURL || undefined}
              isBalanceHidden={isBalanceHidden}
              onToggleHideBalance={() => setIsBalanceHidden(!isBalanceHidden)}
              onTriggerBiometricsTest={() => setIsFaceIdModalOpen(true)}
              onExportCSV={handleExportCSV}
              onLogout={handleLogout}
              onResetWallet={handleResetWallet}
              onUpdateProfile={handleUpdateProfile}
              banks={banks}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        initialType={transactionModalType}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      <AdvisoryModal
        isOpen={isAdvisoryModalOpen}
        onClose={() => setIsAdvisoryModalOpen(false)}
        opportunities={ADVISORY_OPPORTUNITIES}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        }
        onClearNotification={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      <FaceIdModal
        isOpen={isFaceIdModalOpen}
        onSuccess={() => setIsFaceIdModalOpen(false)}
        onCancel={() => setIsFaceIdModalOpen(false)}
      />

      <TransactionDetailModal
        transaction={selectedTxDetail}
        isOpen={Boolean(selectedTxDetail)}
        onClose={() => setSelectedTxDetail(null)}
        onDelete={handleDeleteTransaction}
        formatCurrency={formatCurrency}
      />

      <GoalContributionModal
        goal={selectedGoalForContribution}
        isOpen={Boolean(selectedGoalForContribution)}
        onClose={() => setSelectedGoalForContribution(null)}
        onContribute={handleContributeToGoal}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
