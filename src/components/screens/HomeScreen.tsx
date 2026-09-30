import React from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Shield,
  Flag,
  ChevronRight,
  ShoppingCart,
  Fuel,
  Building,
  Clapperboard,
  Utensils,
  Car,
  Package,
} from 'lucide-react';
import { CategoryDonutChart } from '../CategoryDonutChart';
import {
  Transaction,
  CategoryExpense,
  FinancialGoal,
  AdvisoryOpportunity,
} from '../../types/finance';

interface HomeScreenProps {
  netWorth: number;
  incomes: number;
  expenses: number;
  invested: number;
  isBalanceHidden: boolean;
  onToggleHideBalance: () => void;
  categories: CategoryExpense[];
  emergencyGoal: FinancialGoal | undefined;
  recentTransactions: Transaction[];
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  onOpenAdvisory?: () => void;
  onOpenGoalContribution: (goal: FinancialGoal) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToTransactions: () => void;
  formatCurrency: (val: number) => string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  netWorth,
  incomes,
  expenses,
  invested,
  isBalanceHidden,
  onToggleHideBalance,
  categories,
  emergencyGoal,
  recentTransactions,
  onOpenNewTransaction,
  onOpenAdvisory,
  onOpenGoalContribution,
  onSelectTransaction,
  onNavigateToTransactions,
  formatCurrency,
}) => {
  // Recent transactions list
  const latestTransactions = recentTransactions.slice(0, 6);

  const getTransactionIcon = (tx: Transaction) => {
    switch (tx.iconName) {
      case 'shopping-cart':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-blue-400" />;
      case 'building':
        return <Building className="w-4 h-4 text-purple-400" />;
      case 'clapperboard':
        return <Clapperboard className="w-4 h-4 text-pink-400" />;
      case 'utensils':
        return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'car':
        return <Car className="w-4 h-4 text-blue-400" />;
      default:
        return <Package className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getIconBackground = (tx: Transaction) => {
    switch (tx.iconName) {
      case 'shopping-cart':
        return 'bg-amber-500/15 border-amber-500/25';
      case 'fuel':
        return 'bg-blue-500/15 border-blue-500/25';
      case 'building':
        return 'bg-purple-500/15 border-purple-500/25';
      case 'clapperboard':
        return 'bg-pink-500/15 border-pink-500/25';
      case 'utensils':
        return 'bg-orange-500/15 border-orange-500/25';
      case 'car':
        return 'bg-blue-500/15 border-blue-500/25';
      default:
        return 'bg-cyan-500/15 border-cyan-500/25';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Card: Patrimônio Líquido */}
      <div className="relative rounded-3xl p-5 glass-card-spotlight overflow-hidden">
        {/* Ambient purple backlight glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Header row of card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase font-numeric">
              PATRIMÔNIO LÍQUIDO
            </span>
            <button
              onClick={onToggleHideBalance}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              aria-label={isBalanceHidden ? 'Mostrar saldo' : 'Ocultar saldo'}
            >
              {isBalanceHidden ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Growth Delta Badge */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold font-numeric shadow-sm">
            <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            <span>{recentTransactions.length > 0 ? '+7,38%' : 'Ativo'}</span>
          </div>
        </div>

        {/* Primary Balance */}
        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-numeric">
            {isBalanceHidden ? '••••••••' : formatCurrency(netWorth)}
          </div>
          <p className="text-[11px] text-purple-400 font-medium mt-1">
            {recentTransactions.length === 0
              ? 'Conta pessoal pronta para seus primeiros lançamentos'
              : `${recentTransactions.length} lançamentos registrados no período`}
          </p>
        </div>

        {/* 3 Metric Columns: Entradas / Saídas / Investido */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/[0.08]">
          {/* Entradas */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-purple-400">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Entradas</span>
            </div>
            <div className="text-sm font-bold text-white font-numeric tracking-tight truncate">
              {isBalanceHidden ? '••••' : formatCurrency(incomes)}
            </div>
          </div>

          {/* Saídas */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saídas</span>
            </div>
            <div className="text-sm font-bold text-white font-numeric tracking-tight truncate">
              {isBalanceHidden ? '••••' : formatCurrency(expenses)}
            </div>
          </div>

          {/* Investido */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-400">
              <Shield className="w-3.5 h-3.5 stroke-[2]" />
              <span>Investido</span>
            </div>
            <div className="text-sm font-bold text-white font-numeric tracking-tight truncate">
              {isBalanceHidden ? '••••' : formatCurrency(invested)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons: Receita & Despesa */}
      <div className="grid grid-cols-2 gap-3 px-0.5">
        {/* Receita (+) */}
        <button
          onClick={() => onOpenNewTransaction('income')}
          className="p-3.5 rounded-2xl btn-purple-glow font-bold text-xs tracking-wide flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-lg"
          aria-label="Registrar Receita"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-bold text-white">Nova Receita</span>
        </button>

        {/* Despesa (-) */}
        <button
          onClick={() => onOpenNewTransaction('expense')}
          className="p-3.5 rounded-2xl bg-[#151c2a] hover:bg-[#1b2538] border border-white/10 text-slate-200 hover:text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          aria-label="Registrar Despesa"
        >
          <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <Minus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-bold">Nova Despesa</span>
        </button>
      </div>

      {/* Gastos por Categoria Card */}
      <div className="rounded-3xl p-5 glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-purple-400/80 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-purple-400" />
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Gastos por Categoria
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Outubro</span>
        </div>

        <CategoryDonutChart
          categories={categories}
          totalAmount={expenses}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Reserva de Emergência Card */}
      {emergencyGoal && (
        <div className="rounded-3xl p-5 glass-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Flag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {emergencyGoal.title}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Meta final: {emergencyGoal.deadline}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-purple-400 font-numeric">
              {Math.min(
                100,
                Math.round(
                  (emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100
                )
              )}
              %
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (emergencyGoal.currentAmount / emergencyGoal.targetAmount) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5 text-xs">
            <span className="text-slate-300 font-medium font-numeric">
              {formatCurrency(emergencyGoal.currentAmount)} de{' '}
              {formatCurrency(emergencyGoal.targetAmount)}
            </span>
            <button
              onClick={() => onOpenGoalContribution(emergencyGoal)}
              className="text-purple-400 hover:text-purple-300 font-bold font-numeric hover:underline flex items-center gap-1 text-[11px]"
            >
              Faltam{' '}
              {formatCurrency(
                Math.max(0, emergencyGoal.targetAmount - emergencyGoal.currentAmount)
              )}
            </button>
          </div>
        </div>
      )}

      {/* Últimas Transações Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-white tracking-tight">
            Últimas Transações
          </h2>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5"
          >
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transactions List or Empty State */}
        {recentTransactions.length === 0 ? (
          <div className="p-6 rounded-2xl glass-card text-center border border-white/5 my-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-3 text-purple-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Nenhum lançamento ainda</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Sua conta está limpa e pronta. Toque em <span className="text-purple-300 font-semibold">Nova Receita</span> ou <span className="text-rose-300 font-semibold">Nova Despesa</span> acima para registrar seu primeiro movimento.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl glass-card divide-y divide-white/5 overflow-hidden">
            {latestTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${getIconBackground(
                      tx
                    )} group-hover:scale-105 transition-transform`}
                  >
                    {getTransactionIcon(tx)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {tx.category} • {tx.institution}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold font-numeric block ${
                      tx.type === 'income' ? 'text-purple-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-numeric">
                    {tx.date} • {tx.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
