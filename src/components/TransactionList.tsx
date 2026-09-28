import React, { useState } from 'react';
import { Transaction, UserAccount } from '../types/finance';
import { GlassCard } from './GlassCard';
import { triggerHaptic } from '../utils/haptics';
import { Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  currentUser: UserAccount;
  allUsers?: UserAccount[];
  onDeleteTransaction?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentUser,
  allUsers = [],
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedAccountUserId, setSelectedAccountUserId] = useState<string>(currentUser.id);

  // Active account being inspected in the transaction list
  const activeAccount = allUsers.find((u) => u.id === selectedAccountUserId) || currentUser;
  const userTransactions = transactions.filter((t) => t.userId === activeAccount.id);

  // Filter by type
  const filtered = userTransactions.filter((t) => {
    if (filterType === 'expense') return t.type === 'expense';
    if (filterType === 'income') return t.type === 'income';
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Header & Filter Pill */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-gray-200 flex items-center gap-1.5">
            <span>Extrato de {activeAccount.shortName}</span>
          </h3>
          <p className="text-[10px] text-gray-400">
            {activeAccount.id === currentUser.id
              ? 'Movimentações da sua conta pessoal'
              : `Extrato de ${activeAccount.name}`}
          </p>
        </div>

        {/* Liquid Glass Filter Pills */}
        <div className="flex items-center p-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium">
          <button
            onClick={() => {
              triggerHaptic('light');
              setFilterType('all');
            }}
            className={`px-2.5 py-1 rounded-full transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-[#00F0FF]/25 to-[#0066FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
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
            className={`px-2 py-1 rounded-full transition-all ${
              filterType === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
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
            className={`px-2 py-1 rounded-full transition-all ${
              filterType === 'income'
                ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entradas
          </button>
        </div>
      </div>

      {/* Account Switcher if multiple accounts exist */}
      {allUsers.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-gray-400 font-mono">
            {filtered.length} transação(ões) encontrada(s)
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedAccountUserId(u.id);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                  selectedAccountUserId === u.id
                    ? 'bg-white/15 text-white border border-white/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {u.shortName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Items */}
      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center text-gray-400 text-xs">
          Nenhuma movimentação registrada nesta conta ainda.
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const isIncome = t.type === 'income';

            return (
              <GlassCard
                key={t.id}
                interactive
                className="p-3.5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category icon with glassmorphism */}
                  <div className="relative w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-inner">
                    <span>{t.categoryIcon}</span>
                    <span
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0B0F19]"
                      style={{
                        backgroundColor: isIncome ? '#39FF14' : activeAccount.neonColor,
                      }}
                    />
                  </div>

                  {/* Description & Date */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white tracking-tight truncate">
                      {t.description}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {t.category} • {t.date}
                      </span>

                      {/* Card badge */}
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                        {t.cardName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Quick Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-[#39FF14]' : 'text-white'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {isIncome ? 'Crédito' : 'Débito'}
                    </div>
                  </div>

                  {onDeleteTransaction && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        onDeleteTransaction(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-gray-500 p-1.5 rounded-xl hover:bg-white/5 transition-opacity"
                      title="Excluir Transação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
