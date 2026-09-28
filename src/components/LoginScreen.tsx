import React, { useState } from 'react';
import { Mail, Lock, ScanFace, ArrowRight, ShieldCheck, UserPlus, Check, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { UserAccount } from '../types/finance';
import { getAllUsers, getUserByEmail } from '../data/mockData';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const users = getAllUsers();
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(users[0] || null);
  const [emailInput, setEmailInput] = useState(users[0]?.email || '');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectUser = (u: UserAccount) => {
    triggerHaptic('light');
    setSelectedUser(u);
    setEmailInput(u.email);
    setError(null);
  };

  const handleEntrar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Look up by email if typed or use selected user
    const targetUser = getUserByEmail(emailInput) || selectedUser;

    if (!targetUser) {
      setError('Conta não encontrada com este e-mail. Crie uma nova conta abaixo.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('success');
    setIsAuthenticating(true);
    setTimeout(() => {
      onLoginSuccess(targetUser);
    }, 400);
  };

  const handleFaceID = () => {
    const targetUser = getUserByEmail(emailInput) || selectedUser || users[0];
    if (!targetUser) {
      setError('Crie uma conta primeiro para utilizar biometria.');
      return;
    }

    triggerHaptic('medium');
    setIsAuthenticating(true);
    setBiometricSuccess(true);
    setTimeout(() => {
      triggerHaptic('success');
      setTimeout(() => {
        onLoginSuccess(targetUser);
      }, 300);
    }, 550);
  };

  const currentThemeColor = selectedUser?.neonColor || '#00F0FF';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-5 bg-[#0B0F19] text-white overflow-hidden select-none">
      {/* Background Ambient Liquid Blobs */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-[90px] pointer-events-none transition-colors duration-500 opacity-20"
        style={{ backgroundColor: currentThemeColor }}
      />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#0066FF]/15 blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center my-auto py-6">
        {/* Dental Flow "Z" Fluid Luminous Logo */}
        <div className="relative mb-3">
          <div className="relative w-18 h-18 rounded-[24px] p-0.5 bg-gradient-to-tr from-[#00F0FF] via-[#0066FF] to-[#39FF14] shadow-[0_0_30px_rgba(0,240,255,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#0B0F19] backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                className="w-12 h-12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="zGradLog" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="50%" stopColor="#0066FF" />
                    <stop offset="100%" stopColor="#39FF14" />
                  </linearGradient>
                </defs>
                <path
                  d="M 24 30 C 40 22, 64 22, 76 30 C 80 34, 78 40, 70 46 L 36 68 C 30 72, 34 78, 42 78 C 58 78, 72 74, 78 68"
                  stroke="url(#zGradLog)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="78" cy="30" r="4.5" fill="#00F0FF" />
                <circle cx="26" cy="74" r="4.5" fill="#39FF14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Branding Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00F0FF] via-[#00B4D8] to-[#0066FF] bg-clip-text text-transparent">
            Zayra's Finance
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
            Controle financeiro pessoal e inteligente
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Quick Accounts Carousel / Selector on this device */}
        {users.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center justify-between pl-1 mb-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Contas no Dispositivo
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onGoToRegister();
                }}
                className="text-[11px] text-[#00F0FF] hover:underline flex items-center gap-1 font-semibold"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Criar Conta</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {users.slice(0, 4).map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 border transition-all text-left relative ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/40 shadow-lg'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/15'
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center text-black"
                        style={{ backgroundColor: u.neonColor }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                      style={{
                        backgroundColor: u.avatarColor,
                        color: u.neonColor,
                        border: `2px solid ${u.neonColor}`,
                      }}
                    >
                      {u.avatarInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {u.shortName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">
                        {u.bankName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEntrar} className="w-full space-y-3.5">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              E-mail
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Senha Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Senha de Acesso
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Biometric Face ID Area */}
          <div className="pt-1 pb-1 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleFaceID}
              className={`relative p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#00F0FF]/40 active:scale-95 transition-all duration-300 group ${
                biometricSuccess ? 'border-[#39FF14] bg-[#39FF14]/10' : ''
              }`}
            >
              <div className="absolute inset-0 rounded-2xl bg-[#00F0FF]/15 blur-md animate-pulse pointer-events-none" />

              {biometricSuccess ? (
                <ShieldCheck className="w-7 h-7 text-[#39FF14] animate-bounce" />
              ) : (
                <ScanFace className="w-7 h-7 text-[#00F0FF] group-hover:scale-110 transition-transform" />
              )}
            </button>
            <span className="text-[10px] text-gray-400 mt-1.5 font-medium">
              Autenticar com Face ID
            </span>
          </div>

          {/* Action Button: Wide Liquid Gradient */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#0088FF] to-[#0044CC] font-bold text-white text-sm tracking-wide shadow-[0_8px_30px_rgba(0,240,255,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {isAuthenticating
                ? 'Acessando Espaço...'
                : selectedUser
                ? `Entrar como ${selectedUser.shortName}`
                : 'Acessar Conta'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Create Account CTA */}
        <div className="mt-5 w-full pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-gray-400 mb-2">Ainda não possui uma conta pessoal?</p>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onGoToRegister();
            }}
            className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs active:scale-95 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-[#00F0FF]" />
            <span>Criar Nova Conta no Zayra's Finance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
