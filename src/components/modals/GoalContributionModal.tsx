import React, { useState } from 'react';
import { X, Target, Plus, Check } from 'lucide-react';
import { FinancialGoal } from '../../types/finance';

interface GoalContributionModalProps {
  goal: FinancialGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onContribute: (goalId: string, amount: number) => void;
  formatCurrency: (val: number) => string;
}

export const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  goal,
  isOpen,
  onClose,
  onContribute,
  formatCurrency,
}) => {
  const [amountStr, setAmountStr] = useState('1000');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    onContribute(goal.id, val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#121927] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Aportar na Meta</h2>
              <span className="text-[11px] text-slate-400">{goal.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        <div className="my-4 p-4 rounded-2xl bg-[#090d16] border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Progresso atual</span>
            <span className="font-bold text-white font-numeric">
              {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7]"
              style={{
                width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Meta final: {goal.deadline}</span>
            <span className="text-purple-400 font-semibold font-numeric">
              Faltam {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['250', '500', '1000', '2500'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountStr(preset)}
              className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/5 font-numeric"
            >
              + R$ {preset}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Valor do Aporte (R$)
            </label>
            <input
              type="text"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-white font-bold text-xl font-numeric focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl btn-purple-glow text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Confirmar Aporte
          </button>
        </form>
      </div>
    </div>
  );
};
