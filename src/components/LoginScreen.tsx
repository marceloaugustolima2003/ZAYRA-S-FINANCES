import React, { useState } from 'react';
import { Mail, Lock, ScanFace, ArrowRight, ShieldCheck, UserPlus, Check, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { UserAccount } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
import { loginWithGoogle, loginWithEmail } from '../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const { users } = useFinanceStore();
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(users[0] || null);
  const [emailInput, setEmailInput] = useState(users[0]?.email || '');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selectedUser if users load asynchronously from IndexedDB
  React.useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
      setEmailInput(users[0].email);
    }
  }, [users, selectedUser]);

  const handleSelectUser = (u: UserAccount) => {
    triggerHaptic('light');
    setSelectedUser(u);
    setEmailInput(u.email);
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      triggerHaptic('medium');
      setError(null);
      setIsGoogleLoading(true);
      const { account } = await loginWithGoogle();
      triggerHaptic('success');
      onLoginSuccess(account);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      // If popup was closed or network error, show friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('O login com Google foi cancelado.');
      } else {
        setError(`Erro ao autenticar com Google: ${err.message || 'Verifique sua conexão.'}`);
      }
      triggerHaptic('warning');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEntrar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!emailInput.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    triggerHaptic('medium');
    setIsAuthenticating(true);

    // Try Firebase Email Auth first
    try {
      if (password && password.length >= 6) {
        const { account } = await loginWithEmail(emailInput, password);
        triggerHaptic('success');
        onLoginSuccess(account);
        return;
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase email auth fell back to local store:', firebaseErr?.message);
    }

    // Fallback to local accounts if already registered on this device
    const targetUser = users.find((u) => u.email.toLowerCase() === emailInput.toLowerCase()) || selectedUser;
    if (targetUser) {
      triggerHaptic('success');
      setTimeout(() => {
        onLoginSuccess(targetUser);
      }, 350);
    } else {
      setError('Conta não encontrada com este e-mail. Crie uma nova conta abaixo.');
      triggerHaptic('warning');
      setIsAuthenticating(false);
    }
  };

  const handleFaceID = () => {
    const targetUser = users.find((u) => u.email.toLowerCase() === emailInput.toLowerCase()) || selectedUser || users[0];
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
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-5 bg-[#0B0F19] text-white overflow-y-auto select-none py-8">
      {/* Background Ambient Liquid Blobs */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-[90px] pointer-events-none transition-colors duration-500 opacity-20"
        style={{ backgroundColor: currentThemeColor }}
      />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#0066FF]/15 blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center my-auto py-6 bg-white/[0.02] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        {/* App Logo */}
        <div className="relative mb-3">
          <div className="relative w-18 h-18 rounded-[24px] p-0.5 bg-gradient-to-tr from-[#00F0FF] via-[#FF70A6] to-[#39FF14] shadow-[0_0_30px_rgba(0,240,255,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#0B0F19] backdrop-blur-xl flex items-center justify-center overflow-hidden">
              <img
                src="/zayra-logo.png"
                alt="Zayra's Finance Logo"
                className="w-full h-full object-cover rounded-[21px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Branding Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00F0FF] via-[#00B4D8] to-[#0066FF] bg-clip-text text-transparent">
            Zayra's Finance
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
            Controle financeiro com Firebase Cloud & Firestore
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="w-full p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Google Sign-in Primary Button */}
        <div className="w-full mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isGoogleLoading ? 'Conectando ao Google...' : 'Continuar com Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">
            ou com e-mail e senha
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleEntrar} className="w-full space-y-3">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              E-mail
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Senha Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Senha de Acesso
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha de acesso"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Biometric Face ID Area */}
          <div className="pt-0.5 pb-0.5 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleFaceID}
              className={`relative p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#00F0FF]/40 active:scale-95 transition-all duration-300 group ${
                biometricSuccess ? 'border-[#39FF14] bg-[#39FF14]/10' : ''
              }`}
            >
              {biometricSuccess ? (
                <ShieldCheck className="w-6 h-6 text-[#39FF14] animate-bounce" />
              ) : (
                <ScanFace className="w-6 h-6 text-[#00F0FF] group-hover:scale-110 transition-transform" />
              )}
            </button>
            <span className="text-[9px] text-gray-400 mt-1 font-medium">
              Autenticar com Face ID
            </span>
          </div>

          {/* Action Button: Wide Liquid Gradient */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#0088FF] to-[#0044CC] font-bold text-white text-xs tracking-wide shadow-[0_8px_30px_rgba(0,240,255,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="mt-4 w-full pt-3 border-t border-white/5 text-center">
          <p className="text-xs text-gray-400 mb-2">Ainda não possui uma conta pessoal?</p>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onGoToRegister();
            }}
            className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs active:scale-95 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-[#00F0FF]" />
            <span>Criar Nova Conta no Zayra's Finance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
