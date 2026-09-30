import React from 'react';
import { Bell, Calendar, ChevronDown, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentTab: string;
  tabTitle: string;
  selectedMonth: string;
  onSelectMonth: () => void;
  onOpenNotifications: () => void;
  onLockApp?: () => void;
  unreadCount?: number;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  tabTitle,
  selectedMonth,
  onSelectMonth,
  onOpenNotifications,
  onLockApp,
  unreadCount = 2,
  userName = 'Usuário',
}) => {
  return (
    <header className="sticky top-0 z-30 pt-3 pb-3 px-4 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Top row: Brand + Notifications + Lock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-purple-400/90 uppercase font-numeric">
              ZAYRA&apos;S FINANCE
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white/95 leading-tight">
              {tabTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lock App / Go to Login button */}
          {onLockApp && (
            <button
              onClick={onLockApp}
              className="p-2.5 rounded-full bg-[#182030]/80 hover:bg-[#202b42] border border-white/10 text-slate-300 hover:text-purple-400 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
              title="Bloquear app (Tela de Login)"
              aria-label="Bloquear aplicativo"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full bg-[#182030]/80 hover:bg-[#202b42] border border-white/10 text-slate-300 hover:text-white transition-all shadow-[0_2px_10px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
            aria-label="Abrir notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-bar: Status & Month Selector */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-purple-400/90">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-slate-300">
            Carteira Segura
          </span>
        </div>

        {/* Month Selector */}
        <button
          onClick={onSelectMonth}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151c2a] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>{selectedMonth}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Greeting line on Início tab */}
      {tabTitle === 'Início' && (
        <div className="mt-3">
          <p className="text-xl font-bold tracking-tight text-white">
            Bom dia, {userName}
          </p>
        </div>
      )}
    </header>
  );
};
