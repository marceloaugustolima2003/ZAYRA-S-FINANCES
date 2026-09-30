import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ScanFace,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Smartphone,
  ChevronLeft,
  KeyRound,
  User,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
} from '../../services/firebaseService';

interface LoginScreenProps {
  onLoginSuccess: (userName: string, userEmail: string) => void;
  defaultUserName?: string;
  defaultUserEmail?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  defaultUserName = 'Usuário',
  defaultUserEmail = '',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | '2fa'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await signInWithGoogle();
      const displayName = user.displayName || user.email?.split('@')[0] || defaultUserName;
      const email = user.email || defaultUserEmail;
      onLoginSuccess(displayName, email);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register fields
  const [regName, setRegName] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // 2FA Code
  const [twoFaCode, setTwoFaCode] = useState(['', '', '', '', '', '']);

  // Biometrics prompt state
  const [isBiometricsActive, setIsBiometricsActive] = useState(false);
  const [biometricsSuccess, setBiometricsSuccess] = useState(false);

  // Forgot password email
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginWithEmail(identifier.trim(), password.trim());
      const displayName = user.displayName || identifier.trim().split('@')[0] || defaultUserName;
      const email = user.email || identifier.trim();
      onLoginSuccess(displayName, email);
    } catch {
      // Offline/local fallback
      const emailOrLogin = identifier.trim();
      const derivedName = emailOrLogin.includes('@')
        ? emailOrLogin.split('@')[0]
        : emailOrLogin;
      const derivedEmail = emailOrLogin.includes('@')
        ? emailOrLogin
        : `${emailOrLogin}@email.com`;
      onLoginSuccess(derivedName, derivedEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickBiometricLogin = () => {
    setIsBiometricsActive(true);
    setBiometricsSuccess(false);

    setTimeout(() => {
      setBiometricsSuccess(true);
      setTimeout(() => {
        setIsBiometricsActive(false);
        onLoginSuccess(defaultUserName, defaultUserEmail);
      }, 700);
    }, 1400);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await registerWithEmail(regName.trim(), regEmail.trim(), regPassword || 'senha123456');
      const displayName = user.displayName || regName.trim();
      const email = user.email || regEmail.trim();
      onLoginSuccess(displayName, email);
    } catch {
      // Local fallback
      onLoginSuccess(regName.trim(), regEmail.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(defaultUserName, defaultUserEmail);
    }, 900);
  };

  const handle2FaChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newCode = [...twoFaCode];
    newCode[index] = val;
    setTwoFaCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`2fa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-[#dfe2ef] flex flex-col justify-between overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-300">
      {/* Ambient background light leaks */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-purple-600/20 via-purple-700/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Main smartphone centered frame */}
      <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-6 z-10">
        {/* Top spacer */}
        <div className="pt-2" />

        {/* Brand Header */}
        <div className="text-center my-auto py-4">
          <div className="inline-block relative mb-3">
            <BrandLogo size="lg" withContainer={true} className="mx-auto" />
          </div>

          <span className="text-[11px] font-bold tracking-[0.2em] text-purple-400 uppercase font-numeric block">
            ZAYRA&apos;S FINANCE
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Aura Wealth Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Terminal de gestão patrimonial confidencial e finanças inteligentes
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="w-full my-auto">
          {mode === 'login' && (
            <div className="rounded-3xl p-6 glass-card-spotlight shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fadeIn">
              {/* Google Sign-In Primary Authentication */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 mb-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Entrar com Conta Google</span>
              </button>

              {/* Quick Biometrics Profile Pill */}
              <div className="mb-5 p-3 rounded-2xl bg-[#141d30]/90 border border-white/10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <ScanFace className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Acesso Rápido
                    </span>
                    <span className="text-[10px] text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Biometria / Face ID
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickBiometricLogin}
                  className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  title="Entrar com Face ID"
                >
                  <ScanFace className="w-4 h-4 stroke-[2.2]" />
                  <span>Face ID</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-[#111929] text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-numeric">
                  ou acesse com senha
                </span>
              </div>

              {errorMessage && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {/* Standard Login Form */}
              <form onSubmit={handleStandardLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    E-mail ou CPF
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      Senha de Acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#090d16] border-white/20 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-300">Lembrar neste smartphone</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMode('2fa')}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Usar Token 2FA
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl btn-purple-glow text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Zayra&apos;s Finance</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switch to register */}
              <div className="mt-5 text-center text-xs text-slate-400 pt-3 border-t border-white/5">
                Ainda não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors"
                >
                  Criar Primeiro Acesso
                </button>
              </div>
            </div>
          )}

          {/* Register Mode */}
          {mode === 'register' && (
            <div className="rounded-3xl p-6 glass-card-spotlight shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="p-1 rounded-full bg-white/5 text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white">Criar Primeiro Acesso</h3>
                  <span className="text-[11px] text-slate-400">
                    Abertura instantânea de conta patrimonial
                  </span>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Mariana Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={regCpf}
                    onChange={(e) => setRegCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-numeric"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    E-mail Principal
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="mariana@exemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Senha Forte (mínimo 8 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Seus dados ficam sincronizados com seus bancos via Open Finance.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-2xl btn-purple-glow text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Concluir Cadastro</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 2FA Token Mode */}
          {mode === '2fa' && (
            <div className="rounded-3xl p-6 glass-card-spotlight shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fadeIn text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-white">Autenticação em Duas Etapas</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Digite o código de 6 dígitos gerado pelo seu app autenticador ou enviado por SMS.
              </p>

              <form onSubmit={handle2FaSubmit} className="mt-6 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {twoFaCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`2fa-input-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handle2FaChange(i, e.target.value)}
                      className="w-10 h-12 rounded-xl bg-[#090d16] border border-white/15 text-center text-lg font-bold text-white font-numeric focus:outline-none focus:border-purple-400"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl btn-purple-glow text-white font-bold text-xs"
                >
                  {isLoading ? 'Validando...' : 'Confirmar e Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Voltar para login
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password Mode */}
          {mode === 'forgot' && (
            <div className="rounded-3xl p-6 glass-card-spotlight shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="p-1 rounded-full bg-white/5 text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white">Recuperar Acesso</h3>
                  <span className="text-[11px] text-slate-400">
                    Enviaremos um link de redefinição
                  </span>
                </div>
              </div>

              {forgotSent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">E-mail Enviado!</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                    Confira sua caixa de entrada ({forgotEmail || identifier}) para redefinir sua senha com segurança.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setMode('login');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold"
                  >
                    Voltar ao Login
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setForgotSent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Seu E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="mariana@exemplo.com"
                        value={forgotEmail || identifier}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#090d16] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl btn-purple-glow text-white font-bold text-xs"
                  >
                    Enviar Link de Recuperação
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Biometrics Simulation Overlay Modal */}
        {isBiometricsActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-xs p-6 rounded-3xl bg-[#141d30]/95 backdrop-blur-3xl border border-white/15 text-center shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
              {/* Pulsing purple rim stroke disc */}
              <div className="relative w-28 h-28 mx-auto my-4 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                    !biometricsSuccess
                      ? 'border-purple-400 animate-ping opacity-40 shadow-[0_0_25px_#a855f7]'
                      : 'border-purple-400 opacity-100 shadow-[0_0_35px_#c084fc]'
                  }`}
                />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#1c2842] to-[#0e1626] border border-white/20 flex items-center justify-center shadow-inner">
                  {!biometricsSuccess ? (
                    <ScanFace className="w-12 h-12 text-purple-400 animate-pulse stroke-[2.2]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center animate-scaleUp">
                      <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-white mt-2">
                {biometricsSuccess ? 'Autenticado!' : 'Face ID'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 leading-normal">
                {biometricsSuccess
                  ? 'Acesso liberado com sucesso'
                  : 'Reconhecendo Mariana Silva...'}
              </p>

              {!biometricsSuccess && (
                <button
                  type="button"
                  onClick={() => setIsBiometricsActive(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-6 pb-2 text-center text-[10px] text-slate-500">
          <p>© 2026 Zayra&apos;s Finance • Aura Wealth Partners</p>
        </div>
      </div>
    </div>
  );
};
