import React, { useState } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerHaptic } from '../utils/haptics';
import { UserAccount } from '../types/finance';
import { ChevronDown, Check, UserPlus, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';

interface AppHeaderProps {
  currentUser: UserAccount;
  onSwitchUser: (userId: string) => void;
  onOpenRegister?: () => void;
  onAvatarClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenRegister,
  onAvatarClick,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const { users, viewMode, toggleViewMode, isOnline, pendingSyncCount } = useFinanceStore();
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B0F19]/90 backdrop-blur-2xl border-b border-white/10 px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: Branding & Photo Logo with Rounded Borders */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-2xl p-0.5 bg-gradient-to-tr from-[#00F0FF] via-[#FF70A6] to-[#39FF14] shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-[14px] bg-[#0B0F19] flex items-center justify-center overflow-hidden">
              <img
                src="/zayra-logo.png"
                alt="Zayra Logo"
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                Zayra's
              </h1>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full font-mono border"
                style={{
                  backgroundColor: `${viewMode === 'couple' ? '#FF70A6' : currentUser.neonColor}15`,
                  color: viewMode === 'couple' ? '#FF70A6' : currentUser.neonColor,
                  borderColor: `${viewMode === 'couple' ? '#FF70A6' : currentUser.neonColor}30`,
                }}
              >
                {viewMode === 'couple' ? 'Casal' : 'Individual'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              {currentUser.bankName} • {currentUser.shortName}
            </p>
          </div>
        </div>

        {/* Right: PWA Button + Interactive Account Switcher */}
        <div className="flex items-center gap-2 relative">
          <div className="hidden xs:block sm:block">
            <PWAInstallButton />
          </div>

          {/* Account Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowAccountDropdown(!showAccountDropdown);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 backdrop-blur-md active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              title="Trocar de Conta Pessoal"
            >
              {/* User Avatar Circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                style={{
                  backgroundColor: currentUser.avatarColor,
                  color: currentUser.neonColor,
                  boxShadow: `0 0 10px ${currentUser.neonColor}60`,
                  border: `2px solid ${currentUser.neonColor}`,
                }}
              >
                {currentUser.avatarInitial}
              </div>

              {/* User Name */}
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.shortName}
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  showAccountDropdown ? 'rotate-180 text-[#00F0FF]' : ''
                }`}
              />
            </button>

            {/* Account Switcher Dropdown (Liquid Glass Card) */}
            {showAccountDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAccountDropdown(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-64 rounded-3xl bg-[#0F1626]/95 border border-white/15 p-2.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.15)] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                    <span>Contas neste Dispositivo</span>
                    <span className="font-mono text-gray-500">{users.length}</span>
                  </div>

                  {/* Active Account Item */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.08] border border-white/10 mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: currentUser.avatarColor,
                          color: currentUser.neonColor,
                          border: `2px solid ${currentUser.neonColor}`,
                        }}
                      >
                        {currentUser.avatarInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">
                          {currentUser.bankName} (Ativa)
                        </div>
                      </div>
                    </div>
                    <Check
                      className="w-4 h-4 stroke-[3] shrink-0"
                      style={{ color: currentUser.neonColor }}
                    />
                  </div>

                  {/* Other Registered Accounts */}
                  {otherUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        triggerHaptic('medium');
                        onSwitchUser(u.id);
                        setShowAccountDropdown(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.06] transition-colors group text-left active:scale-95 mb-1"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold opacity-80 group-hover:opacity-100 shrink-0"
                          style={{
                            backgroundColor: u.avatarColor,
                            color: u.neonColor,
                            border: `2px solid ${u.neonColor}60`,
                          }}
                        >
                          {u.avatarInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-300 group-hover:text-white truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono truncate">
                            {u.bankName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-[#00F0FF]/15 group-hover:text-[#00F0FF] transition-colors shrink-0">
                        Alternar
                      </span>
                    </button>
                  ))}

                  {/* Create New Account Button */}
                  <div className="pt-1.5 mt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setShowAccountDropdown(false);
                        onOpenRegister?.();
                      }}
                      className="w-full py-2 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-[#00F0FF] flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Criar Outra Conta Pessoal</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
