import React from 'react';
import { GlassCard } from './GlassCard';
import { MetasDonut } from './MetasDonut';
import { BudgetGoal, UserAccount } from '../types/finance';
import { PlusCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface GoalsViewProps {
  goals: BudgetGoal[];
  currentUser: UserAccount;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, currentUser }) => {
  const userGoals = goals.filter((g) => g.userId === currentUser.id);

  const emergencyFundTarget = Math.round(currentUser.monthlySalary * 6);
  const emergencyFundCurrent = Math.round(emergencyFundTarget * 0.72);
  const emergencyFundPct = Math.round((emergencyFundCurrent / emergencyFundTarget) * 100);

  const dreamTarget = Math.round(currentUser.monthlySalary * 3);
  const dreamCurrent = Math.round(dreamTarget * 0.55);
  const dreamPct = Math.round((dreamCurrent / dreamTarget) * 100);

  return (
    <div className="space-y-4 pb-28">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Metas de {currentUser.shortName}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Orçamentos e reservas da sua conta {currentUser.bankName}
          </p>
        </div>

        <button
          onClick={() => triggerHaptic('light')}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[#00F0FF] hover:bg-white/10 active:scale-95 transition"
          title="Nova Meta"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Donut Grid Component for this user */}
      <MetasDonut goals={userGoals} userName={currentUser.shortName} />

      {/* Individual Savings & Personal Vaults */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">
          Cofrinhos & Reservas Pessoais
        </h3>

        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-[0_0_12px_rgba(57,255,20,0.25)] border"
                style={{
                  backgroundColor: `${currentUser.neonColor}15`,
                  borderColor: `${currentUser.neonColor}30`,
                }}
              >
                🛡️
              </div>
              <div>
                <div className="text-sm font-bold text-white">Reserva de Emergência (6 Meses)</div>
                <div className="text-xs text-gray-400">
                  R$ {emergencyFundCurrent.toLocaleString('pt-BR')} de R$ {emergencyFundTarget.toLocaleString('pt-BR')} ({emergencyFundPct}%)
                </div>
              </div>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: currentUser.neonColor }}>
              +R$ {Math.round(currentUser.monthlySalary * 0.15).toLocaleString('pt-BR')}/mês
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              style={{
                width: `${emergencyFundPct}%`,
                backgroundColor: currentUser.neonColor,
                boxShadow: `0 0 8px ${currentUser.neonColor}`,
              }}
              className="h-full rounded-full transition-all duration-500"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                ✈️
              </div>
              <div>
                <div className="text-sm font-bold text-white">Viagens & Lazer dos Sonhos</div>
                <div className="text-xs text-gray-400">
                  R$ {dreamCurrent.toLocaleString('pt-BR')} de R$ {dreamTarget.toLocaleString('pt-BR')} ({dreamPct}%)
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#00F0FF] font-mono">
              +R$ {Math.round(currentUser.monthlySalary * 0.1).toLocaleString('pt-BR')}/mês
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              style={{ width: `${dreamPct}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#39FF14] shadow-[0_0_8px_#00F0FF]"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
