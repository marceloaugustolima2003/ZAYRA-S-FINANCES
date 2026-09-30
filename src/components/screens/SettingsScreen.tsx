import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  ScanFace,
  Landmark,
  Eye,
  Bell,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  CheckCircle,
  LogOut,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { BankAccount } from '../../types/finance';

interface SettingsScreenProps {
  userName: string;
  userEmail?: string;
  userPhotoURL?: string;
  isBalanceHidden: boolean;
  onToggleHideBalance: () => void;
  onTriggerBiometricsTest: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onResetWallet?: () => void;
  onUpdateProfile?: (name: string, email: string) => void;
  banks?: BankAccount[];
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userName,
  userEmail = '',
  userPhotoURL,
  isBalanceHidden,
  onToggleHideBalance,
  onTriggerBiometricsTest,
  onExportCSV,
  onLogout,
  onResetWallet,
  onUpdateProfile,
}) => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Profile Edit modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);

  // User initials
  const effectiveName = userName && userName !== 'Usuário' ? userName : 'Marcelo Augusto';
  const effectiveEmail = userEmail && userEmail !== 'email@exemplo.com' ? userEmail : 'marceloaugustolima2003@gmail.com';

  const initials = effectiveName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'MA';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(nameInput.trim() || effectiveName, emailInput.trim() || effectiveEmail);
    }
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Profile Card */}
      <div className="p-5 rounded-3xl glass-card-spotlight">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden">
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt={effectiveName}
                  className="w-full h-full rounded-[14px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-[#0c1322] flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#090d16] flex items-center justify-center text-white">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white truncate">{effectiveName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Aura VIP
                </span>
              </div>
              <button
                onClick={() => {
                  setNameInput(effectiveName);
                  setEmailInput(effectiveEmail);
                  setIsEditingProfile(true);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                Editar
              </button>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {effectiveEmail}
            </p>
            <p className="text-[10px] text-purple-400 mt-1 font-medium">
              Conta Verificada • Acesso Seguro
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121927] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Editar Perfil</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090d16] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-400 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090d16] text-white text-xs border border-white/10 focus:outline-none focus:border-purple-400 font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-purple-glow text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security & Biometrics Section */}
      <div className="p-4 rounded-3xl glass-card space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Segurança e Autenticação
        </span>

        {/* Biometrics Toggle & Test */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <ScanFace className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Face ID & Biometria
              </span>
              <span className="text-[11px] text-slate-400 block">
                Autenticar para transações e ocultação de saldo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerBiometricsTest}
              className="text-[11px] text-purple-400 hover:underline font-semibold"
            >
              Testar
            </button>
            <button
              onClick={() => setFaceIdEnabled(!faceIdEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                faceIdEnabled ? 'bg-purple-600' : 'bg-white/20'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  faceIdEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy Mode */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Eye className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Modo Privacidade
              </span>
              <span className="text-[11px] text-slate-400 block">
                Ocultar saldos e rendimentos na tela inicial
              </span>
            </div>
          </div>

          <button
            onClick={onToggleHideBalance}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isBalanceHidden ? 'bg-purple-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isBalanceHidden ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications & Export */}
      <div className="p-4 rounded-3xl glass-card space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Preferências e Exportação
        </span>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Alertas de Orçamento
              </span>
              <span className="text-[11px] text-slate-400 block">
                Notificar quando categoria atingir 80%
              </span>
            </div>
          </div>

          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              notificationsEnabled ? 'bg-purple-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Export Data */}
        <div className="pt-1">
          <button
            onClick={onExportCSV}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Baixar Extrato Completo de Transações (CSV)
          </button>

          {onResetWallet && (
            <button
              onClick={onResetWallet}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              Limpar Dados de Demonstração / Começar do Zero
            </button>
          )}
        </div>
      </div>

      {/* Account Session / Logout */}
      <div className="p-4 rounded-3xl glass-card space-y-2">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          Bloquear / Sair da Conta
        </button>
        <span className="text-[10px] text-slate-500 block text-center">
          Você será redirecionado para a tela de autenticação segura
        </span>
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-2 text-[11px] text-slate-400 space-y-1">
        <p>Zayra&apos;s Finance • Aura Wealth</p>
        <p>App de Gestão Financeira Pessoal</p>
      </div>
    </div>
  );
};
