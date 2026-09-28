import React, { useState, useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { GlassCard } from './GlassCard';
import { DentalFlowSpline } from './DentalFlowSpline';
import { MetasDonut } from './MetasDonut';
import { TransactionList } from './TransactionList';
import { BottomNav, NavTab } from './BottomNav';
import { QuickAddModal } from './QuickAddModal';
import { ChartsView } from './ChartsView';
import { GoalsView } from './GoalsView';
import { ProfileView } from './ProfileView';
import { OfflineIndicator } from './OfflineIndicator';
import { UserAccount, Transaction, BudgetGoal } from '../types/finance';
import {
  getAllUsers,
  getUserById,
  getSavedTransactions,
  saveTransactions,
  getSavedGoals,
  saveGoals,
  generateUserWeeklyTrend,
} from '../data/mockData';
import { ArrowDownRight, ArrowUpRight, Wallet, UserPlus } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface DashboardProps {
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUserId,
  onSwitchUser,
  onOpenRegister,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => getSavedTransactions());
  const [goals, setGoals] = useState<BudgetGoal[]>(() => getSavedGoals());

  // Get current user and all users list
  const allUsers = getAllUsers();
  const currentUser: UserAccount =
    getUserById(currentUserId) || allUsers[0] || {
      id: 'user_fallback',
      name: 'Minha Conta',
      shortName: 'Usuário',
      email: 'usuario@email.com',
      avatarColor: '#0E1B25',
      neonColor: '#00F0FF',
      avatarInitial: 'U',
      bankName: 'Meu Banco',
      primaryCard: 'Cartão Principal',
      accountNumber: 'Ag 0001 • C/C 00000-0',
      monthlySalary: 5000,
      initialBalance: 1000,
      createdAt: new Date().toISOString(),
    };

  // Keep localStorage synced
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  // Calculate this specific user's individual balance and cash flow
  const userExpenses = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const userIncomes = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Individual account balance
  const individualBalance = currentUser.initialBalance + userIncomes - userExpenses;

  // Filter individual goals for current user
  const userGoals = goals.filter((g) => g.userId === currentUser.id);

  // Dynamic weekly trend curve for current user
  const weeklyData = generateUserWeeklyTrend(transactions, currentUser.id, individualBalance);

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // If it's an expense, update matching goal percentage if found
    if (newTx.type === 'expense') {
      setGoals((prev) =>
        prev.map((g) => {
          if (
            g.userId === currentUser.id &&
            newTx.category.toLowerCase().includes(g.title.toLowerCase().slice(0, 4))
          ) {
            const updatedSpent = g.spent + newTx.amount;
            const updatedPct = Math.min(100, Math.round((updatedSpent / g.limit) * 100));
            return { ...g, spent: updatedSpent, percentage: updatedPct };
          }
          return g;
        })
      );
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between selection:bg-[#00F0FF]/30">
      {/* Background ambient texture & liquid glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-full pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-10 -left-20 w-72 h-72 rounded-full blur-[90px] opacity-15 transition-colors duration-500"
          style={{ backgroundColor: currentUser.neonColor }}
        />
        <div className="absolute top-80 -right-20 w-72 h-72 rounded-full bg-[#0066FF]/10 blur-[80px]" />
        <div className="absolute bottom-40 left-10 w-60 h-60 rounded-full bg-[#00F0FF]/10 blur-[90px]" />
      </div>

      <OfflineIndicator />

      {/* Clean Dynamic Header */}
      <AppHeader
        currentUser={currentUser}
        onSwitchUser={onSwitchUser}
        onOpenRegister={onOpenRegister}
        onAvatarClick={() => setCurrentTab('profile')}
      />

      {/* Main Scrollable View Area */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {currentTab === 'home' && (
          <div className="space-y-4">
            {/* 1. Main Liquid Glass Card: Saldo Individual do Usuário */}
            <GlassCard glow="cyan" className="pt-5 pb-2 px-5">
              {/* Header: User Account Name & Bank Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-xl border flex items-center justify-center"
                    style={{
                      backgroundColor: `${currentUser.neonColor}15`,
                      borderColor: `${currentUser.neonColor}40`,
                      color: currentUser.neonColor,
                    }}
                  >
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-wider text-gray-200 uppercase block">
                      Saldo em Conta • {currentUser.shortName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {currentUser.primaryCard}
                    </span>
                  </div>
                </div>

                {/* Individual status pill */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono"
                  style={{
                    backgroundColor: `${currentUser.neonColor}15`,
                    color: currentUser.neonColor,
                    borderColor: `${currentUser.neonColor}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: currentUser.neonColor }}
                  />
                  CONTA INDIVIDUAL
                </div>
              </div>

              {/* Massive Balance Amount Display */}
              <div className="mt-3 mb-4">
                <div className="text-[34px] sm:text-[38px] font-light tracking-tight text-white font-mono leading-none">
                  R$ {individualBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Submetrics Row: Entradas e Despesas Individuais */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#39FF14]/15 flex items-center justify-center text-[#39FF14]">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">Entradas</div>
                      <div className="text-xs font-semibold text-white font-mono">
                        R$ {userIncomes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">Despesas</div>
                      <div className="text-xs font-semibold text-white font-mono">
                        R$ {userExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto text-right">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onOpenRegister();
                      }}
                      className="flex items-center gap-1 text-[11px] text-[#00F0FF] hover:underline"
                      title="Criar outra conta"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Nova Conta</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Integrated Spline Curve Chart for this User */}
              <div className="-mx-5 -mb-2 mt-2 pt-2 border-t border-white/5">
                <DentalFlowSpline
                  data={weeklyData}
                  currentBalance={individualBalance}
                  userName={currentUser.shortName}
                  neonColor={currentUser.neonColor}
                />
              </div>
            </GlassCard>

            {/* 2. Secondary: Metas Pessoais deste Usuário */}
            <MetasDonut
              goals={userGoals}
              userName={currentUser.shortName}
              onGoalClick={() => {
                triggerHaptic('light');
                setCurrentTab('goals');
              }}
            />

            {/* 3. Secondary: Transaction List for this User's Account */}
            <TransactionList
              transactions={transactions}
              currentUser={currentUser}
              allUsers={allUsers}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {currentTab === 'charts' && (
          <ChartsView
            transactions={transactions}
            currentUser={currentUser}
            allUsers={allUsers}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onSwitchUser={onSwitchUser}
            onOpenRegister={onOpenRegister}
            onLogout={onLogout}
          />
        )}
      </main>

      {/* Bottom Nav Bar with Liquid Floating Action Button */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          triggerHaptic('light');
          setCurrentTab(tab);
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        currentUser={currentUser}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};
