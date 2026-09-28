import React from 'react';
import { GlassCard } from './GlassCard';
import { triggerHaptic } from '../utils/haptics';
import { BudgetGoal } from '../types/finance';

interface MetasDonutProps {
  goals: BudgetGoal[];
  userName?: string;
  onGoalClick?: (goal: BudgetGoal) => void;
}

export const MetasDonut: React.FC<MetasDonutProps> = ({
  goals,
  userName = '',
  onGoalClick,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-wide text-gray-200 flex items-center gap-2">
          <span>🎯 Orçamentos de {userName || 'Sua Conta'}</span>
        </h3>
        <span className="text-[11px] font-medium text-[#00F0FF]">
          Mês Vigente
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => {
          const size = 68;
          const strokeWidth = 5;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - (goal.percentage / 100) * circumference;

          return (
            <GlassCard
              key={goal.id}
              interactive
              onClick={() => {
                triggerHaptic('light');
                onGoalClick?.(goal);
              }}
              className="p-3.5 flex flex-col justify-between hover:border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl p-1 rounded-xl bg-white/[0.04]">
                  {goal.icon}
                </span>
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${goal.color}15`,
                    color: goal.color,
                    border: `1px solid ${goal.color}40`,
                  }}
                >
                  {goal.percentage}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* SVG Donut */}
                <div className="relative w-[56px] h-[56px] flex items-center justify-center shrink-0">
                  <svg
                    width="56"
                    height="56"
                    viewBox={`0 0 ${size} ${size}`}
                    className="rotate-[-90deg] overflow-visible"
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke={goal.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 6px ${goal.glowColor})`,
                        transition: 'stroke-dashoffset 0.8s ease-out',
                      }}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-white font-mono">
                    {goal.percentage}%
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-200 truncate">
                    {goal.title}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    R$ {goal.spent.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono">
                    teto: R$ {goal.limit.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
