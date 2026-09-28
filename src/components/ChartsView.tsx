import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Transaction, UserAccount } from '../types/finance';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PieChart, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ChartsViewProps {
  transactions: Transaction[];
  currentUser: UserAccount;
  allUsers: UserAccount[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  transactions,
  currentUser,
  allUsers,
}) => {
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');

  // Compute metrics for Current User
  const myExpenses = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const myIncomes = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || currentUser.monthlySalary;

  // Category breakdown for current user
  const myCategoryTotals = transactions
    .filter((t) => t.userId === currentUser.id && t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(myCategoryTotals).sort((a, b) => b[1] - a[1]);

  const personalSavings = Math.max(0, myIncomes - myExpenses);
  const savingsPct = Math.round((personalSavings / (myIncomes || 1)) * 100);

  return (
    <div className="space-y-4 pb-28">
      {/* Header & Mode Switch */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Relatórios Financeiros</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {viewScope === 'my'
              ? `Análise individual da conta de ${currentUser.shortName}`
              : 'Visão comparativa entre as contas do dispositivo'}
          </p>
        </div>

        {allUsers.length > 1 && (
          <div className="flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewScope('my');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                viewScope === 'my'
                  ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pessoal
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewScope('all');
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                viewScope === 'all'
                  ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Contas
            </button>
          </div>
        )}
      </div>

      {viewScope === 'my' ? (
        <>
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
                  borderColor: `${currentUser.neonColor}30`,
                }}
              >
                {currentUser.bankName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Entradas Pessoais</span>
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  R$ {myIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  <span>Despesas do Mês</span>
                </div>
                <div className="text-base font-bold text-rose-300 font-mono mt-1">
                  R$ {myExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Savings Rate Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Poupança Pessoal Estimada</span>
                <span className="font-bold text-[#39FF14] font-mono">
                  R$ {personalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({savingsPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, savingsPct))}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#39FF14]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Category Breakdown */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#00F0FF]" />
                <span>Onde você mais gastou</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Este mês</span>
            </div>

            {sortedCategories.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                Sem despesas registradas ainda neste mês.
              </p>
            ) : (
              <div className="space-y-2.5">
                {sortedCategories.map(([catName, catAmount]) => {
                  const pct = Math.round((catAmount / (myExpenses || 1)) * 100);
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">{catName}</span>
                        <span className="font-mono text-gray-200">
                          R$ {catAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0066FF]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </>
      ) : (
        /* Autonomy View (All Registered Accounts) */
        <GlassCard glow="lime" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
              <span>Contas no Dispositivo</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">Autonomia Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allUsers.map((u) => {
              const uExpenses = transactions
                .filter((t) => t.userId === u.id && t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1"
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{u.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: u.neonColor }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400">{u.bankName}</div>
                  <div className="text-xs font-bold text-white font-mono pt-1">
                    Despesas: R$ {uExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
