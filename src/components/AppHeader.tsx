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
  const { viewMode } = useFinanceStore();

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
              onClick={onAvatarClick}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 backdrop-blur-md active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              title="Perfil"
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
