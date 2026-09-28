import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { useFinanceStore } from '../store/useFinanceStore';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  UserPlus,
  CloudOff,
  RefreshCw,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
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

  // Consume from Zustand global reactive store!
  const {
    users,
    currentUser: storeCurrentUser,
    partnerUser,
    viewMode,
    transactions,
    goals,
    isOnline,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    switchUser,
    setViewMode,
    toggleViewMode,
    addTransaction,
    deleteTransaction,
    syncPendingQueue,
    getUserBalance,
    getUserExpenses,
    getUserIncomes,
    getCoupleTotalBalance,
    getCoupleTotalExpenses,
    getCoupleTotalIncomes,
    getWeeklyTrend,
  } = useFinanceStore();

  const activeUser =
    storeCurrentUser ||
    users.find((u) => u.id === currentUserId) ||
    users[0] || {
      id: currentUserId,
      name: 'Marcelo Augusto',
      shortName: 'Marcelo',
      email: 'marcelo@email.com',
      avatarColor: '#0E1B25',
      neonColor: '#00F0FF',
      avatarInitial: 'M',
      bankName: 'Nubank',
      primaryCard: 'Nubank Ultravioleta',
      accountNumber: 'Ag 0001 • C/C 48291-3',
      monthlySalary: 8200,
      initialBalance: 4650,
      createdAt: new Date().toISOString(),
    };

  // Metrics depending on ViewMode (Individual vs Casal)
  const isCoupleView = viewMode === 'couple';

  const displayedBalance = isCoupleView
    ? getCoupleTotalBalance()
    : getUserBalance(activeUser.id);

  const displayedIncomes = isCoupleView
    ? getCoupleTotalIncomes()
    : getUserIncomes(activeUser.id);

  const displayedExpenses = isCoupleView
    ? getCoupleTotalExpenses()
    : getUserExpenses(activeUser.id);

  const userGoals = isCoupleView
    ? goals
    : goals.filter((g) => g.userId === activeUser.id);

  const weeklyData = getWeeklyTrend(activeUser.id);

  const handleManualSync = async () => {
    triggerHaptic('medium');
    await syncPendingQueue();
    triggerHaptic('success');
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between selection:bg-[#00F0FF]/30">
      {/* Background ambient liquid glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-full pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            backgroundColor: isCoupleView ? '#FF70A6' : activeUser.neonColor,
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-20"
        />
        <div className="absolute top-80 -right-20 w-72 h-72 rounded-full bg-[#0066FF]/15 blur-[90px]" />
        <div className="absolute bottom-40 left-10 w-60 h-60 rounded-full bg-[#00F0FF]/10 blur-[90px]" />
      </div>

      <OfflineIndicator />

      {/* Dynamic Header */}
      <AppHeader
        currentUser={activeUser}
        onSwitchUser={(id) => {
          switchUser(id);
          onSwitchUser(id);
        }}
        onOpenRegister={onOpenRegister}
        onAvatarClick={() => setCurrentTab('profile')}
      />

      {/* Main Scrollable View Area */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-28">
        {/* Offline & Sync Queue Status Banner (PWA Offline-First) */}
        <AnimatePresence>
          {(!isOnline || pendingSyncCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="mb-3"
            >
              <GlassCard
                glow="none"
                className={`p-3 border ${
                  !isOnline
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#00F0FF]/10 border-[#00F0FF]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        !isOnline
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-[#00F0FF]/20 text-[#00F0FF]'
                      }`}
                    >
                      {!isOnline ? (
                        <CloudOff className="w-4 h-4 animate-pulse" />
                      ) : (
                        <RefreshCw
                          className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{!isOnline ? 'Modo Offline PWA' : 'Sincronização Pronta'}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/10 text-gray-300">
                          IndexedDB
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {pendingSyncCount > 0
                          ? `${pendingSyncCount} transação(ões) na fila de envio`
                          : 'Operando localmente no dispositivo'}
                      </div>
                    </div>
                  </div>

                  {isOnline && pendingSyncCount > 0 && (
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-bold text-[11px] flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95 transition cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`}
                      />
                      <span>{isSyncing ? 'Enviando...' : 'Sincronizar'}</span>
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {currentTab === 'home' && (
          <div className="space-y-4">
            {/* 1. Couple Mode Switcher: Individual vs Casal */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-300">Visão:</span>
                <div className="flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setViewMode('individual');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      !isCoupleView
                        ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#0066FF]/30 text-[#00F0FF] border border-[#00F0FF]/40 font-semibold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Pessoal ({activeUser.shortName})
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setViewMode('couple');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isCoupleView
                        ? 'bg-gradient-to-r from-[#FF70A6]/30 to-[#00F0FF]/30 text-white border border-white/40 font-semibold shadow-[0_0_12px_rgba(255,112,166,0.25)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3 h-3 text-[#FF70A6]" />
                    <span>Casal</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Another Partner Account Link */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onOpenRegister();
                }}
                className="text-[11px] text-[#00F0FF] hover:underline flex items-center gap-1 font-medium"
                title="Cadastrar outra conta no dispositivo"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Conta</span>
              </button>
            </div>

            {/* 2. Main Liquid Glass Card: Saldo & Gráfico */}
            <GlassCard
              glow={isCoupleView ? 'pink' : 'cyan'}
              className="pt-5 pb-2 px-5"
            >
              {/* Card Header: Owner / Couple Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-xl border flex items-center justify-center"
                    style={{
                      backgroundColor: `${isCoupleView ? '#FF70A6' : activeUser.neonColor}15`,
                      borderColor: `${isCoupleView ? '#FF70A6' : activeUser.neonColor}40`,
                      color: isCoupleView ? '#FF70A6' : activeUser.neonColor,
                    }}
                  >
                    {isCoupleView ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-wider text-gray-200 uppercase block">
                      {isCoupleView
                        ? 'Saldo Consolidado do Casal'
                        : `Saldo em Conta • ${activeUser.shortName}`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {isCoupleView
                        ? `${users.length} contas integradas`
                        : `${activeUser.primaryCard} • ${activeUser.bankName}`}
                    </span>
                  </div>
                </div>

                {/* Cloud & IndexedDB Status Badge */}
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold font-mono"
                  style={{
                    backgroundColor: `${activeUser.neonColor}15`,
                    color: activeUser.neonColor,
                    borderColor: `${activeUser.neonColor}40`,
                  }}
                  title="Dados armazenados no IndexedDB e sincronizados com Express"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-[#39FF14] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>

              {/* Massive Animated Balance Display */}
              <div className="mt-3 mb-4">
                <motion.div
                  key={`${viewMode}-${displayedBalance}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[34px] sm:text-[38px] font-light tracking-tight text-white font-mono leading-none"
                >
                  R${' '}
                  {displayedBalance.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </motion.div>

                {/* Submetrics Row: Entradas e Despesas */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#39FF14]/15 flex items-center justify-center text-[#39FF14]">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {isCoupleView ? 'Renda do Casal' : 'Entradas'}
                      </div>
                      <div className="text-xs font-semibold text-white font-mono">
                        R${' '}
                        {displayedIncomes.toLocaleString('pt-BR', {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {isCoupleView ? 'Gastos do Casal' : 'Despesas'}
                      </div>
                      <div className="text-xs font-semibold text-white font-mono">
                        R${' '}
                        {displayedExpenses.toLocaleString('pt-BR', {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  </div>

                  {isCoupleView && partnerUser && (
                    <div className="ml-auto text-right">
                      <div className="text-[9px] text-gray-400">Parceria</div>
                      <div className="text-[11px] font-semibold text-[#FF70A6]">
                        {activeUser.shortName} & {partnerUser.shortName}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Integrated Spline Curve Chart for this User/Couple */}
              <div className="-mx-5 -mb-2 mt-2 pt-2 border-t border-white/5">
                <DentalFlowSpline
                  data={weeklyData}
                  currentBalance={displayedBalance}
                  userName={isCoupleView ? 'Casal' : activeUser.shortName}
                  neonColor={isCoupleView ? '#FF70A6' : activeUser.neonColor}
                />
              </div>
            </GlassCard>

            {/* 3. Secondary: Metas Pessoais ou do Casal */}
            <MetasDonut
              goals={userGoals}
              userName={isCoupleView ? 'do Casal' : activeUser.shortName}
              onGoalClick={() => {
                triggerHaptic('light');
                setCurrentTab('goals');
              }}
            />

            {/* 4. Secondary: Transaction List with Framer Motion and Offline Queue */}
            <TransactionList
              transactions={transactions}
              currentUser={activeUser}
              allUsers={users}
              partnerUser={partnerUser}
              onDeleteTransaction={deleteTransaction}
              onSelectAccount={(userId) => {
                switchUser(userId);
                onSwitchUser(userId);
              }}
            />
          </div>
        )}

        {currentTab === 'charts' && (
          <ChartsView
            transactions={transactions}
            currentUser={activeUser}
            allUsers={users}
            partnerUser={partnerUser}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            currentUser={activeUser}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            currentUser={activeUser}
            onSwitchUser={(id) => {
              switchUser(id);
              onSwitchUser(id);
            }}
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

      {/* Quick Add Bottom Sheet Modal (Offline-First via useFinanceStore) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        currentUser={activeUser}
        onAddTransaction={async (txData) => {
          await addTransaction(txData);
        }}
      />
    </div>
  );
};
