import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Transaction, UserAccount } from '../types/finance';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  PieChart,
  Users,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ChartsViewProps {
  transactions: Transaction[];
  currentUser: UserAccount;
  allUsers: UserAccount[];
  partnerUser?: UserAccount | null;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  transactions,
  currentUser,
  allUsers,
  partnerUser,
}) => {
  const [viewScope, setViewScope] = useState<'my' | 'couple'>('my');

  // Partner or secondary account
  const partner = partnerUser || allUsers.find((u) => u.id !== currentUser.id) || null;

  // Individual Metrics for Current User
  const myExpenses = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const myIncomes = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || currentUser.monthlySalary;

  // Partner Metrics
  const partnerExpenses = partner
    ? transactions
        .filter((t) => t.userId === partner.id && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
    : 0;

  const partnerIncomes = partner
    ? transactions
        .filter((t) => t.userId === partner.id && t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0) || (partner?.monthlySalary || 0)
    : 0;

  // Couple Consolidated Metrics
  const coupleTotalExpenses = myExpenses + partnerExpenses;
  const coupleTotalIncomes = myIncomes + partnerIncomes;
  const coupleSavings = Math.max(0, coupleTotalIncomes - coupleTotalExpenses);
  const coupleSavingsPct = Math.round((coupleSavings / (coupleTotalIncomes || 1)) * 100);

  // Category Breakdown
  const relevantTransactions =
    viewScope === 'my'
      ? transactions.filter((t) => t.userId === currentUser.id && t.type === 'expense')
      : transactions.filter((t) => t.type === 'expense');

  const categoryTotals = relevantTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const totalCategoryExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  // Couple Split Calculation: Who spent what percentage?
  const mySharePct = coupleTotalExpenses > 0 ? Math.round((myExpenses / coupleTotalExpenses) * 100) : 50;
  const partnerSharePct = 100 - mySharePct;

  const personalSavings = Math.max(0, myIncomes - myExpenses);
  const personalSavingsPct = Math.round((personalSavings / (myIncomes || 1)) * 100);

  return (
    <div className="space-y-4 pb-28">
      {/* Header & Mode Switch */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1 flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Relatórios & Divisão</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {viewScope === 'my'
              ? `Análise individual da conta de ${currentUser.shortName}`
              : 'Visão compartilhada das finanças do casal'}
          </p>
        </div>

        {allUsers.length > 1 && (
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 text-xs backdrop-blur-xl">
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewScope('my');
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewScope === 'my'
                  ? 'bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 font-semibold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pessoal
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewScope('couple');
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'couple'
                  ? 'bg-gradient-to-r from-[#FF70A6]/30 to-[#00F0FF]/30 text-white border border-white/40 font-semibold shadow-[0_0_12px_rgba(255,112,166,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#FF70A6]" />
              <span>Casal</span>
            </button>
          </div>
        )}
      </motion.div>

      {viewScope === 'my' ? (
        /* ================= Pessoal Scope ================= */
        <motion.div
          key="my-scope"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Personal Account Financial Health Card */}
          <GlassCard glow="cyan" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Wallet className="w-4 h-4 text-[#00F0FF]" />
                <span>Balanço Mensal • {currentUser.shortName}</span>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${currentUser.neonColor}15`,
                  color: currentUser.neonColor,
                  borderColor: `${currentUser.neonColor}40`,
                }}
              >
                {currentUser.bankName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-[#39FF14]" />
                  <span>Entradas Pessoais</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  R$ {myIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-rose-400" />
                  <span>Gastos Pessoais</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  R$ {myExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Savings Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Taxa de Poupança</span>
                <span className="text-[#39FF14] font-mono font-bold">{personalSavingsPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(5, personalSavingsPct))}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#39FF14]"
                />
              </div>
              <div className="text-[10px] text-gray-400 pt-0.5 flex justify-between">
                <span>Reserva gerada: R$ {personalSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                <span className="text-gray-400 font-mono">Meta: 20%+</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        /* ================= Couple Consolidated Scope ================= */
        <motion.div
          key="couple-scope"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Couple Combined Card */}
          <GlassCard glow="pink" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Scale className="w-4 h-4 text-[#FF70A6]" />
                <span>Divisão Financeira do Casal</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                TOTAL R$ {coupleTotalExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Proportional Split Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: currentUser.neonColor }}>
                  {currentUser.shortName} ({mySharePct}%)
                </span>
                {partner && (
                  <span style={{ color: partner.neonColor }}>
                    {partner.shortName} ({partnerSharePct}%)
                  </span>
                )}
              </div>

              {/* Duo Split Progress Bar */}
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mySharePct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-l-full"
                  style={{ backgroundColor: currentUser.neonColor }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${partnerSharePct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-r-full"
                  style={{ backgroundColor: partner?.neonColor || '#FF70A6' }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>R$ {myExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pagos</span>
                <span>R$ {partnerExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} pagos</span>
              </div>
            </div>

            {/* Couple Combined Summary Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400 mb-1">Renda Total do Casal</div>
                <div className="text-sm font-bold text-white font-mono">
                  R$ {coupleTotalIncomes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-gray-400 mb-1">Reserva Mensal Conjunta</div>
                <div className="text-sm font-bold text-[#39FF14] font-mono">
                  R$ {coupleSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ({coupleSavingsPct}%)
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Category Expenses Breakdown with Animated Progress Bars */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <PieChart className="w-4 h-4 text-[#00F0FF]" />
            <span>
              {viewScope === 'my'
                ? `Despesas por Categoria (${currentUser.shortName})`
                : 'Despesas do Casal por Categoria'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {sortedCategories.length} categorias
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            Nenhuma despesa registrada no período.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([category, amount], idx) => {
              const pct = Math.round((amount / totalCategoryExpenses) * 100);
              const palette = ['#00F0FF', '#FF70A6', '#39FF14', '#FF7A00', '#0066FF', '#8A2BE2'];
              const catColor = palette[idx % palette.length];

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-200 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <span>{category}</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-gray-400 text-[10px]">{pct}%</span>
                      <span className="text-white font-semibold">
                        R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: catColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
