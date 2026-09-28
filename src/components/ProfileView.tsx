import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { CoupleInviteCard } from './CoupleInviteCard';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerHaptic } from '../utils/haptics';
import { UserAccount } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  CreditCard,
  Shield,
  Smartphone,
  LogOut,
  Wallet,
  ArrowRightLeft,
  Building,
  UserPlus,
  Trash2,
  Check,
  Palette,
  Database,
  RefreshCw,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserAccount;
  onSwitchUser: (userId: string) => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

const NEON_COLORS = [
  { label: 'Ciano', value: '#00F0FF' },
  { label: 'Verde', value: '#39FF14' },
  { label: 'Roxo', value: '#8A2BE2' },
  { label: 'Rosa', value: '#FF0055' },
  { label: 'Laranja', value: '#FF7A00' },
  { label: 'Azul', value: '#0066FF' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSwitchUser,
  onOpenRegister,
  onLogout,
}) => {
  const { users, registerUser, pendingSyncCount, syncPendingQueue, isSyncing, isOnline } = useFinanceStore();

  const handleColorChange = (newColor: string) => {
    triggerHaptic('light');
    registerUser({
      ...currentUser,
      neonColor: newColor,
    });
  };

  const handleDeleteCurrentAccount = () => {
    if (confirm('Tem certeza que deseja desconectar esta conta deste dispositivo?')) {
      triggerHaptic('heavy');
      onLogout();
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Individual Account Profile Header */}
      <GlassCard glow="cyan" className="p-6 text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-2xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: `${currentUser.neonColor}20` }}
        />

        {/* Profile Avatar */}
        <div className="relative flex justify-center items-center mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl relative"
            style={{
              backgroundColor: currentUser.avatarColor,
              color: currentUser.neonColor,
              border: `3px solid ${currentUser.neonColor}`,
              boxShadow: `0 0 25px ${currentUser.neonColor}50`,
            }}
          >
            {currentUser.avatarInitial}
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#39FF14] border-2 border-[#0B0F19]" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          {currentUser.name}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5 font-mono">
          {currentUser.email} • {currentUser.bankName}
        </p>

        {/* Color Palette Switcher */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center justify-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-gray-400" />
            <span>Personalizar Cor de Destaque Neon</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            {NEON_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleColorChange(c.value)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  currentUser.neonColor === c.value ? 'scale-125 ring-2 ring-white/60 shadow-lg' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {currentUser.neonColor === c.value && (
                  <Check className="w-3 h-3 text-black stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Recurso de Finanças do Casal / Convite por E-mail */}
      <CoupleInviteCard currentUser={currentUser} />

      {/* Dados Bancários e Cartão da Conta */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">
          Dados Bancários & Cartão
        </h3>
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: `${currentUser.neonColor}15`,
                  borderColor: `${currentUser.neonColor}40`,
                  color: currentUser.neonColor,
                }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{currentUser.primaryCard}</div>
                <div className="text-[11px] text-gray-400 font-mono">
                  {currentUser.bankName} • Cartão Individual
                </div>
              </div>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${currentUser.neonColor}10`,
                color: currentUser.neonColor,
                borderColor: `${currentUser.neonColor}30`,
              }}
            >
              Principal
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-300 font-medium">Dados da Conta</div>
                <div className="text-xs text-gray-400 font-mono">
                  {currentUser.accountNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-300 font-medium">Renda Mensal Declarada</div>
                <div className="text-sm font-bold text-white font-mono">
                  R$ {currentUser.monthlySalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Nuvem, Express API & IndexedDB */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">
          Arquitetura de Dados & Offline
        </h3>
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Firebase Firestore Cloud DB</div>
                <div className="text-xs text-gray-400">Persistência em nuvem com cache IndexedDB</div>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isOnline
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-[#00F0FF] animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isOnline ? 'FIRESTORE ATIVO' : 'OFFLINE (IDB)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
            <span>Fila de sincronização (Sync Queue)</span>
            <span className="text-white font-mono font-bold">
              {pendingSyncCount > 0 ? `${pendingSyncCount} pendente(s)` : 'Tudo sincronizado'}
            </span>
          </div>

          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                syncPendingQueue();
              }}
              disabled={isSyncing || !isOnline}
              className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando fila...' : 'Sincronizar Fila com Servidor'}</span>
            </button>
          )}
        </GlassCard>
      </div>

      {/* Aplicativo PWA */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">
          Aplicativo PWA
        </h3>
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#00F0FF]" />
              <div>
                <div className="text-sm font-semibold text-white">Instalar no Dispositivo</div>
                <div className="text-xs text-gray-400">Funciona offline e em tela cheia</div>
              </div>
            </div>
            <PWAInstallButton />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#39FF14]" />
              <div>
                <div className="text-sm font-semibold text-white">Biometria Pessoal</div>
                <div className="text-xs text-gray-400">Face ID individual ativado</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
          </div>
        </GlassCard>
      </div>

      {/* Ações de Conta: Sair ou Excluir */}
      <div className="pt-2 px-1 space-y-2">
        <button
          onClick={() => {
            triggerHaptic('medium');
            onLogout();
          }}
          className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-rose-400 font-semibold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta de {currentUser.shortName}</span>
        </button>

      </div>
    </div>
  );
};
