import React, { useState } from 'react';
import { User, Mail, Lock, Building, Wallet, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { UserAccount } from '../types/finance';
import { registerNewUser, getUserByEmail } from '../data/mockData';

interface RegisterScreenProps {
  onRegisterSuccess: (newUser: UserAccount) => void;
  onGoToLogin: () => void;
}

const NEON_COLORS = [
  { label: 'Ciano', value: '#00F0FF' },
  { label: 'Verde', value: '#39FF14' },
  { label: 'Roxo', value: '#8A2BE2' },
  { label: 'Rosa', value: '#FF0055' },
  { label: 'Laranja', value: '#FF7A00' },
  { label: 'Azul', value: '#0066FF' },
];

const POPULAR_BANKS = [
  'Nubank',
  'Itaú',
  'Inter',
  'C6 Bank',
  'Bradesco',
  'Santander',
  'BTG Pactual',
  'Banco do Brasil',
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onGoToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bankName, setBankName] = useState('Nubank');
  const [customBank, setCustomBank] = useState('');
  const [initialBalance, setInitialBalance] = useState('2500');
  const [monthlySalary, setMonthlySalary] = useState('6000');
  const [neonColor, setNeonColor] = useState('#00F0FF');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      triggerHaptic('warning');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um e-mail válido.');
      triggerHaptic('warning');
      return;
    }

    if (getUserByEmail(email)) {
      setError('Este e-mail já está cadastrado. Faça login ou utilize outro.');
      triggerHaptic('warning');
      return;
    }

    if (!password || password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('success');
    setIsSubmitting(true);

    const chosenBank = bankName === 'Outro' ? (customBank.trim() || 'Meu Banco') : bankName;

    setTimeout(() => {
      const newUser = registerNewUser({
        name,
        email,
        password,
        bankName: chosenBank,
        primaryCard: `${chosenBank} Cartão`,
        accountNumber: `Ag 0001 • C/C ${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(Math.random() * 9)}`,
        initialBalance: parseFloat(initialBalance) || 0,
        monthlySalary: parseFloat(monthlySalary) || 4000,
        neonColor,
      });

      onRegisterSuccess(newUser);
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-5 bg-[#0B0F19] text-white overflow-hidden select-none">
      {/* Background Ambient Liquid Blobs */}
      <div
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-500 opacity-20"
        style={{ backgroundColor: neonColor }}
      />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#0066FF]/15 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center my-auto py-6">
        {/* Top Back to Login Link */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              onGoToLogin();
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-full bg-white/[0.04] border border-white/10 active:scale-95 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Login</span>
          </button>

          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${neonColor}15`,
              color: neonColor,
              borderColor: `${neonColor}30`,
            }}
          >
            CADASTRO PÚBLICO
          </span>
        </div>

        {/* Dental Flow "Z" Fluid Luminous Logo */}
        <div className="relative mb-3">
          <div className="relative w-16 h-16 rounded-[22px] p-0.5 bg-gradient-to-tr from-[#00F0FF] via-[#0066FF] to-[#39FF14] shadow-[0_0_25px_rgba(0,240,255,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-[20px] bg-[#0B0F19] backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
              <span className="font-extrabold text-xl bg-gradient-to-r from-[#00F0FF] to-[#39FF14] bg-clip-text text-transparent">
                Z
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Criar Sua Conta
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Seu controle financeiro pessoal e escalável
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Nome Completo */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Seu Nome Completo
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gabriela Duarte"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              E-mail de Acesso
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Senha
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha de acesso"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/40 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Banco Principal */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
              Banco ou Conta Principal
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {POPULAR_BANKS.slice(0, 4).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBankName(b);
                  }}
                  className={`py-2 px-1 text-[11px] font-medium rounded-xl border transition-all text-center ${
                    bankName === b
                      ? 'bg-white/15 text-white border-white/30 font-bold'
                      : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {POPULAR_BANKS.slice(4, 7).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBankName(b);
                  }}
                  className={`py-2 px-1 text-[11px] font-medium rounded-xl border transition-all text-center ${
                    bankName === b
                      ? 'bg-white/15 text-white border-white/30 font-bold'
                      : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setBankName('Outro');
                }}
                className={`py-2 px-1 text-[11px] font-medium rounded-xl border transition-all text-center ${
                  bankName === 'Outro'
                    ? 'bg-white/15 text-white border-white/30 font-bold'
                    : 'bg-white/[0.04] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                Outro
              </button>
            </div>

            {bankName === 'Outro' && (
              <input
                type="text"
                value={customBank}
                onChange={(e) => setCustomBank(e.target.value)}
                placeholder="Nome do seu banco ou carteira"
                className="mt-1.5 w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            )}
          </div>

          {/* Saldo Inicial e Renda */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
                Saldo Inicial (R$)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1">
                Renda Mensal (R$)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  placeholder="4000"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          {/* Cor Neon de Destaque */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-1 flex items-center justify-between">
              <span>Sua Cor Neon de Destaque</span>
              <span className="text-[10px] font-mono" style={{ color: neonColor }}>
                Selecionada
              </span>
            </label>
            <div className="flex items-center justify-between px-1 py-1">
              {NEON_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setNeonColor(c.value);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    neonColor === c.value ? 'scale-125 ring-2 ring-white/60 shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {neonColor === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#0088FF] to-[#39FF14] font-bold text-[#0B0F19] text-sm tracking-wide shadow-[0_8px_25px_rgba(0,240,255,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Criando Conta...' : 'Concluir & Acessar Dashboard'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {/* Footer Login Switch */}
        <div className="mt-5 text-center text-xs text-gray-400">
          <span>Já possui uma conta? </span>
          <button
            onClick={() => {
              triggerHaptic('light');
              onGoToLogin();
            }}
            className="text-[#00F0FF] font-semibold hover:underline"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
};
