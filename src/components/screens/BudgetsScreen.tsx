import React, { useState } from 'react';
import { PieChart, AlertTriangle, CheckCircle2, Edit2, Check } from 'lucide-react';
import { CategoryBudget, Transaction } from '../../types/finance';

interface BudgetsScreenProps {
  budgets: CategoryBudget[];
  transactions?: Transaction[];
  selectedMonth?: string;
  onUpdateBudget: (category: string, newLimit: number) => void;
  formatCurrency: (val: number) => string;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  transactions = [],
  selectedMonth = 'Outubro',
  onUpdateBudget,
  formatCurrency,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalPercent = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;

  const startEdit = (b: CategoryBudget) => {
    setEditingCategory(b.category);
    setEditLimitValue(b.limit.toString());
  };

  const saveEdit = (category: string) => {
    const val = parseFloat(editLimitValue);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(category, val);
    }
    setEditingCategory(null);
  };

  // Generate dynamic last 4 months based on real transactions
  const now = new Date();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const last4MonthsData = [3, 2, 1, 0].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const label = monthNames[monthIndex];

    const monthlyExpenses = transactions
      .filter((tx) => tx.type === 'expense' && tx.date.startsWith(monthKey))
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      month: label,
      monthKey,
      val: monthlyExpenses,
      active: offset === 0,
    };
  });

  const maxVal = Math.max(...last4MonthsData.map((m) => m.val), 1);
  const hasAnyExpenseHistory = last4MonthsData.some((m) => m.val > 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Overall Budget Hero */}
      <div className="rounded-3xl p-5 glass-card-spotlight">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <PieChart className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Orçamento Mensal Total
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Controle de Gastos de {selectedMonth}
              </h2>
            </div>
          </div>
          <span className="text-base font-bold text-purple-400 font-numeric">
            {totalPercent}%
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden my-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPercent > 90
                ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                : totalPercent > 75
                ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
                : 'bg-purple-500 shadow-[0_0_12px_#a855f7]'
            }`}
            style={{ width: `${totalPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium font-numeric">
            Gasto: <b className="text-white">{formatCurrency(totalSpent)}</b>
          </span>
          <span className="text-slate-400 font-numeric">
            Limite: <b className="text-white">{formatCurrency(totalLimit)}</b>
          </span>
          <span className="text-purple-400 font-bold font-numeric">
            Sobra: {formatCurrency(Math.max(0, totalLimit - totalSpent))}
          </span>
        </div>
      </div>

      {/* Threshold Warning Banner */}
      {(() => {
        const warningBudgets = budgets.filter((b) => b.limit > 0 && b.spent / b.limit >= 0.8);
        if (warningBudgets.length > 0) {
          return (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">
                  Atenção ao teto de {warningBudgets.map((w) => w.category).join(', ')}
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Os gastos atingiram mais de 80% do limite estabelecido para este período.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-purple-300 block">
                Gastos Sob Controle
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                Todas as categorias monitoradas estão com despesas confortavelmente dentro do teto planejado.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Category Budget Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Categorias Orçamentárias
          </h3>
          <span className="text-[11px] text-slate-400">Clique para ajustar limite</span>
        </div>

        {budgets.map((b) => {
          const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const isWarning = percent >= 80;
          const isDanger = percent >= 100;
          const isEditing = editingCategory === b.category;

          return (
            <div
              key={b.category}
              className="p-4 rounded-2xl glass-card transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <h4 className="text-xs font-bold text-white">{b.category}</h4>
                  {isDanger ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                      Estourado
                    </span>
                  ) : isWarning ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                      Próximo do limite
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                      Sob controle
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold font-numeric ${
                      isDanger
                        ? 'text-rose-400'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-purple-400'
                    }`}
                  >
                    {percent}%
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(b)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Editar teto"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: b.color,
                  }}
                />
              </div>

              {/* Values row or edit mode */}
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-xs text-slate-400 font-medium">Novo limite: R$</span>
                  <input
                    type="number"
                    value={editLimitValue}
                    onChange={(e) => setEditLimitValue(e.target.value)}
                    className="w-24 px-2 py-1 rounded bg-[#0a0e17] text-white text-xs font-numeric font-bold border border-purple-500/50 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(b.category)}
                    className="p-1 px-2.5 rounded bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 stroke-[3]" /> Salvar
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Gasto: <b className="text-slate-200 font-numeric">{formatCurrency(b.spent)}</b>
                  </span>
                  <span>
                    Teto: <b className="text-slate-200 font-numeric">{formatCurrency(b.limit)}</b>
                  </span>
                  <span className="text-purple-400 font-semibold font-numeric">
                    Resta: {formatCurrency(Math.max(0, b.limit - b.spent))}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Historical Monthly Evolution (Dynamic from real transactions) */}
      <div className="p-4 rounded-3xl glass-card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white">
            Histórico de Gastos dos Últimos 4 Meses
          </h4>
          <span className="text-[10px] text-purple-400 font-numeric font-medium">
            Despesas Reais
          </span>
        </div>

        {!hasAnyExpenseHistory ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/5 my-1">
            <p className="text-xs font-bold text-slate-300">Sem despesas registradas no histórico</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              O gráfico mensal será calculado automaticamente a partir dos lançamentos reais de despesas que você adicionar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 items-end h-28 pt-4 border-b border-white/10 pb-2">
            {last4MonthsData.map((item) => {
              const heightPercent = item.val > 0 ? Math.max(12, Math.round((item.val / maxVal) * 85)) : 6;
              return (
                <div key={item.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-slate-300 font-numeric font-bold">
                    {item.val > 0 ? formatCurrency(item.val) : 'R$ 0'}
                  </span>
                  <div
                    className={`w-8 rounded-t-lg transition-all ${
                      item.active
                        ? 'bg-purple-500 shadow-[0_0_12px_#a855f7]'
                        : item.val > 0
                        ? 'bg-white/20'
                        : 'bg-white/5'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      item.active ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
