import React from 'react';
import { Home, LineChart, Target, User, Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export type NavTab = 'home' | 'charts' | 'goals' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'charts' as const, label: 'Gráficos', icon: LineChart },
    // Empty center placeholder for FAB
    { id: 'goals' as const, label: 'Metas', icon: Target },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none pb-safe">
      <div className="relative max-w-md mx-auto px-4 pb-6">
        {/* Liquid Glass Dock Container */}
        <nav className="pointer-events-auto relative flex items-center justify-between px-3 py-2.5 rounded-[32px] bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/15 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
          {/* Ambient top specular reflection */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent pointer-events-none" />

          {/* Left tabs */}
          <div className="flex items-center space-x-1 sm:space-x-3 w-[40%] justify-around">
            {tabs.slice(0, 2).map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onTabChange(tab.id);
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 active:scale-90 ${
                    isActive
                      ? 'text-[#00F0FF]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] filter drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]' : 'stroke-[1.6]'}`} />
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#00F0FF] font-semibold' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Central Space for Floating FAB */}
          <div className="w-[20%] flex justify-center">
            {/* The FAB is anchored here and leaps up */}
            <div className="relative -top-6">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('heavy');
                  onOpenQuickAdd();
                }}
                aria-label="Adicionar Transação"
                className="relative flex items-center justify-center w-14 h-14 rounded-full liquid-drop-fab group active:scale-90 transition-all duration-300"
              >
                {/* Liquid pulsating ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#39FF14] opacity-50 blur-md group-hover:opacity-80 transition-opacity animate-pulse" />

                {/* Inner shine */}
                <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-white/40">
                  <Plus className="w-7 h-7 text-[#0B0F19] stroke-[2.75] transition-transform duration-300 group-hover:rotate-90" />
                </div>
              </button>
            </div>
          </div>

          {/* Right tabs */}
          <div className="flex items-center space-x-1 sm:space-x-3 w-[40%] justify-around">
            {tabs.slice(2).map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onTabChange(tab.id);
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 active:scale-90 ${
                    isActive
                      ? 'text-[#00F0FF]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] filter drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]' : 'stroke-[1.6]'}`} />
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#00F0FF] font-semibold' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
