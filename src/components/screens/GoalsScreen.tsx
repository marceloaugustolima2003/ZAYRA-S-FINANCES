import React, { useState } from 'react';
import { Flag, Plus, Target, Sparkles, Plane, Car, Shield, Check, Calendar, TrendingUp } from 'lucide-react';
import { FinancialGoal } from '../../types/finance';

interface GoalsScreenProps {
  goals: FinancialGoal[];
  onOpenContribute: (goal: FinancialGoal) => void;
  onCreateGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  formatCurrency: (val: number) => string;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  goals,
  onOpenContribute,
  onCreateGoal,
  formatCurrency,
}) => {
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('Dez/2025');
  const [category, setCategory] = useState('Patrimônio');

  const totalCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const globalPercent = Math.min(100, Math.round((totalCurrent / totalTarget) * 100));

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'plane':
        return <Plane className="w-4 h-4 text-purple-400" />;
      case 'car':
        return <Car className="w-4 h-4 text-blue-400" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-teal-400" />;
      default:
        return <Flag className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(/\./g, '').replace(',', '.'));
    const current = parseFloat(currentAmount.replace(/\./g, '').replace(',', '.')) || 0;
    if (isNaN(target) || target <= 0 || !title.trim()) return;

    onCreateGoal({
      title: title.trim(),
      category,
      targetAmount: target,
      currentAmount: current,
      deadline,
      icon: 'flag',
      color: '#a855f7',
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setIsCreatingGoal(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Card */}
      <div className="rounded-3xl p-5 glass-card-spotlight">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Target className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Planejamento de Sonhos
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Metas Patrimoniais
              </h2>
            </div>
          </div>
          <span className="text-base font-bold text-purple-400 font-numeric">
            {globalPercent}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden my-3">
          <div
            className="h-full rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] transition-all duration-500"
            style={{ width: `${globalPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-numeric">
            Total acumulado: <b className="text-white">{formatCurrency(totalCurrent)}</b>
          </span>
          <span className="text-purple-400 font-bold font-numeric">
            Alvo: {formatCurrency(totalTarget)}
          </span>
        </div>
      </div>

      {/* Action to create new goal */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white tracking-tight">
          Suas Metas Ativas
        </h3>
        <button
          onClick={() => setIsCreatingGoal(true)}
          className="px-3 py-1.5 rounded-full btn-purple-glow text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Nova Meta
        </button>
      </div>

      {/* Goal Cards */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="p-8 rounded-3xl glass-card text-center border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-3 text-purple-400">
              <Target className="w-6 h-6 stroke-[2]" />
            </div>
            <p className="text-sm font-bold text-white">Nenhuma meta criada ainda</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Defina seus objetivos patrimoniais como Reserva de Emergência, Viagem dos Sonhos ou Compra de Imóvel.
            </p>
            <button
              onClick={() => setIsCreatingGoal(true)}
              className="mt-4 px-4 py-2 rounded-xl btn-purple-glow text-white text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Criar Primeira Meta
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-3xl glass-card transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                        {goal.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {goal.category} • Meta final: {goal.deadline}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-purple-400 font-numeric">
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs pt-1">
                  <div className="text-[11px] text-slate-300 font-numeric">
                    <b>{formatCurrency(goal.currentAmount)}</b> de {formatCurrency(goal.targetAmount)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-numeric">
                      Faltam {formatCurrency(remaining)}
                    </span>
                    <button
                      onClick={() => onOpenContribute(goal)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/30 active:scale-95 transition-all cursor-pointer"
                    >
                      Aportar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal to create goal */}
      {isCreatingGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121927] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Criar Nova Meta Financeira</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nome da Meta</label>
                <input
                  type="text"
                  placeholder="Ex: Reforma da Casa, Intercâmbio..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090d16] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Valor Alvo (R$)</label>
                  <input
                    type="text"
                    placeholder="50.000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d16] text-white font-numeric text-xs border border-white/10 focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Já Guardado (R$)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d16] text-white font-numeric text-xs border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Prazo Estimado</label>
                  <input
                    type="text"
                    placeholder="Ex: Dez/2025"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d16] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090d16] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="Patrimônio">Patrimônio</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Lazer & Sonhos">Lazer & Sonhos</option>
                    <option value="Educação">Educação</option>
                    <option value="Longo Prazo">Longo Prazo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-purple-glow text-white font-bold text-xs"
                >
                  Salvar Meta
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingGoal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
