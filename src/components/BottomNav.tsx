import React from 'react';
import { Landmark, ReceiptText, PieChart, Flag, SlidersHorizontal } from 'lucide-react';

export type NavigationTab = 'inicio' | 'transacoes' | 'orcamentos' | 'metas' | 'ajustes';

interface BottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'inicio' as NavigationTab,
      label: 'Início',
      icon: Landmark,
    },
    {
      id: 'transacoes' as NavigationTab,
      label: 'Transações',
      icon: ReceiptText,
    },
    {
      id: 'orcamentos' as NavigationTab,
      label: 'Orçamentos',
      icon: PieChart,
    },
    {
      id: 'metas' as NavigationTab,
      label: 'Metas',
      icon: Flag,
    },
    {
      id: 'ajustes' as NavigationTab,
      label: 'Ajustes',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pt-1 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-around py-2 px-1 rounded-2xl bg-[#141b2b]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-purple-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
