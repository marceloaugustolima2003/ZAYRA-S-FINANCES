import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, UserAccount } from '../types/finance';
import { GlassCard } from './GlassCard';
import { RecurringModal } from './RecurringModal';
import { useFinanceStore } from '../store/useFinanceStore';
import { triggerHaptic } from '../utils/haptics';
import {
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  CloudOff,
  Users,
  Search,
  Sparkles,
  Filter,
  Repeat,
} from 'lucide-react';

interface TransactionListProps {
  transactions: (Transaction & { _isOfflinePending?: boolean })[];
  currentUser: UserAccount;
  allUsers?: UserAccount[];
  partnerUser?: UserAccount | null;
  onDeleteTransaction?: (id: string) => void;
  onSelectAccount?: (userId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentUser,
  allUsers = [],
  partnerUser,
  onDeleteTransaction,
  onSelectAccount,
}) => {
  const { recurringTransactions } = useFinanceStore();
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'all' | string>(currentUser.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    // 1. Filter by user/couple
    if (selectedUserFilter !== 'all' && t.userId !== selectedUserFilter) {
      return false;
    }
    // 2. Filter by type
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'income' && t.type !== 'income') return false;
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('warning');
    setDeletingId(id);
    setTimeout(() => {
      onDeleteTransaction?.(id);
      setDeletingId(null);
    }, 200);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Filter Pills */}
      <div className="flex flex-col gap-2.5 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <span>Extrato & Movimentações</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {filtered.length}
              </span>
            </h3>
            <p className="text-[10px] text-gray-400">
              Sincronizado via IndexedDB & Express
            </p>
          </div>

          {/* Liquid Glass Filter Pills: All / Expenses / Incomes + Recurring Modal trigger */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsRecurringModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#00F0FF]/40 text-[11px] font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-xl"
              title="Gerenciar transações recorrentes e assinaturas mensais"
            >
              <Repeat className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden sm:inline">Recorrentes</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-[#00F0FF]/20 text-[#00F0FF]">
                {recurringTransactions.length}
              </span>
            </button>

            <div className="flex items-center p-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium backdrop-blur-xl">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('all');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#0066FF]/30 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('expense');
                }}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'expense'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-semibold shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Saídas
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('income');
                }}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === 'income'
                    ? 'bg-[#39FF14]/25 text-[#39FF14] border border-[#39FF14]/40 font-semibold shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Entradas
              </button>
            </div>
          </div>
        </div>

        {/* Couple & Account Selector Tabs */}
        {allUsers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Couple Joint Filter */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedUserFilter('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedUserFilter === 'all'
                  ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#FF70A6]/20 text-white border-white/30 shadow-md font-semibold'
                  : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Casal (Ambos)</span>
            </button>

            {/* Individual Account Chips */}
            {allUsers.map((u) => {
              const isSelected = selectedUserFilter === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedUserFilter(u.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white border-white/30 font-semibold'
                      : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: u.neonColor }}
                  />
                  <span>{u.shortName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por descrição, categoria..."
            className="w-full pl-8 pr-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/40 backdrop-blur-md transition-all"
          />
        </div>
      </div>

      {/* Transaction Items List with Framer Motion Layout Transitions */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 rounded-[28px] bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center text-gray-400"
            >
              <Sparkles className="w-8 h-8 text-gray-500 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-gray-300">
                Nenhuma transação encontrada
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Use o botão + no rodapé para adicionar movimentações
              </p>
            </motion.div>
          ) : (
            filtered.map((tx, idx) => {
              const userOwner = allUsers.find((u) => u.id === tx.userId) || currentUser;
              const isIncome = tx.type === 'income';

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: deletingId === tx.id ? 0 : 1,
                    y: 0,
                    scale: deletingId === tx.id ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(idx * 0.03, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <GlassCard
                    interactive
                    glow="none"
                    className="p-3.5 hover:bg-white/[0.07] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Category Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-inner relative"
                          style={{
                            backgroundColor: `${tx.categoryColor || '#00F0FF'}18`,
                            border: `1px solid ${tx.categoryColor || '#00F0FF'}35`,
                          }}
                        >
                          <span>{tx.categoryIcon || '💳'}</span>
                          {/* Owner Badge Dot on Icon */}
                          <div
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-[#0B0F19] flex items-center justify-center text-[8px] font-bold text-black"
                            style={{ backgroundColor: userOwner.neonColor }}
                            title={`Pago por ${userOwner.shortName}`}
                          >
                            {userOwner.avatarInitial}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            <span className="truncate">{tx.description}</span>
                            {/* Recurring badge */}
                            {tx.isRecurring && (
                              <span
                                className="px-1.5 py-0.2 rounded-md bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[9px] font-mono flex items-center gap-1 shrink-0"
                                title="Transação gerada por agendamento recorrente"
                              >
                                <Repeat className="w-2.5 h-2.5" />
                                <span>Recorrente</span>
                              </span>
                            )}
                            {/* Offline Indicator Pill */}
                            {tx._isOfflinePending && (
                              <span
                                className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/35 text-[9px] font-mono flex items-center gap-1 shrink-0"
                                title="Gravado offline no IndexedDB. Será sincronizado assim que reconectar."
                              >
                                <CloudOff className="w-2.5 h-2.5 animate-pulse" />
                                <span>IndexedDB</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span>{tx.category}</span>
                            <span>•</span>
                            <span style={{ color: userOwner.neonColor }}>
                              {userOwner.shortName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Delete Action */}
                      <div className="flex items-center gap-2.5 shrink-0 text-right">
                        <div>
                          <div
                            className={`text-xs font-mono font-bold flex items-center justify-end gap-0.5 ${
                              isIncome ? 'text-[#39FF14]' : 'text-gray-100'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5] text-rose-400" />
                            )}
                            <span>
                              {isIncome ? '+' : '-'} R${' '}
                              {tx.amount.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="text-[9px] text-gray-400 font-mono">
                            {tx.cardName}
                          </div>
                        </div>

                        {onDeleteTransaction && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(tx.id, e)}
                            className="opacity-60 group-hover:opacity-100 hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Remover transação"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Scheduled Recurring Transactions Modal */}
      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
