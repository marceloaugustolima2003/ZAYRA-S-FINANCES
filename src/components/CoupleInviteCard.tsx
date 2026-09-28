import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { UserAccount } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
import { triggerHaptic } from '../utils/haptics';
import {
  Heart,
  Mail,
  UserPlus,
  Send,
  Check,
  Copy,
  Share2,
  Users,
  Unlink,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CoupleInviteCardProps {
  currentUser: UserAccount;
}

export const CoupleInviteCard: React.FC<CoupleInviteCardProps> = ({ currentUser }) => {
  const {
    partnerUser,
    pendingInviteEmail,
    users,
    sendCoupleInvite,
    unlinkCouple,
    setViewMode,
  } = useFinanceStore();

  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if entered email matches someone already in the app
  const matchedExistingUser = emailInput.trim()
    ? users.find(
        (u) =>
          u.email.toLowerCase() === emailInput.trim().toLowerCase() &&
          u.id !== currentUser.id
      )
    : null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const clean = emailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      triggerHaptic('warning');
      setFeedback({
        type: 'error',
        message: 'Por favor, informe um endereço de e-mail válido.',
      });
      return;
    }

    if (clean === currentUser.email.toLowerCase()) {
      triggerHaptic('warning');
      setFeedback({
        type: 'error',
        message: 'Você não pode convidar o seu próprio e-mail.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      triggerHaptic('medium');
      const result = await sendCoupleInvite(clean);

      if (result.success) {
        triggerHaptic('success');
        setFeedback({
          type: 'success',
          message: result.message,
          link: result.inviteLink,
        });
        setEmailInput('');
      } else {
        triggerHaptic('warning');
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      triggerHaptic('warning');
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao enviar convite. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (linkToCopy?: string) => {
    const link =
      linkToCopy ||
      `${window.location.origin}/#register?coupleInvite=pending&partner=${encodeURIComponent(
        pendingInviteEmail || ''
      )}`;

    navigator.clipboard.writeText(link);
    triggerHaptic('success');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (linkToShare?: string) => {
    const link =
      linkToShare ||
      `${window.location.origin}/#register?coupleInvite=pending&partner=${encodeURIComponent(
        pendingInviteEmail || ''
      )}`;
    const msg = encodeURIComponent(
      `Oi meu amor! Te convidei para juntarmos nossas finanças no app Zayra's Finances. Acesse pelo link para aceitar: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleUnlink = () => {
    if (confirm('Deseja realmente desvincular seu parceiro(a) deste casal?')) {
      triggerHaptic('heavy');
      unlinkCouple();
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#FF70A6] fill-[#FF70A6]/30" />
          <span>Finanças do Casal</span>
        </h3>
        {partnerUser && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF70A6]/15 text-[#FF70A6] border border-[#FF70A6]/30">
            CONECTADOS
          </span>
        )}
      </div>

      <GlassCard
        glow={partnerUser ? 'pink' : 'none'}
        className="p-5 space-y-4"
      >
        {/* State 1: Casal Já Conectado */}
        {partnerUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {/* Left Avatar: Current User */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg"
                    style={{
                      backgroundColor: currentUser.avatarColor,
                      color: currentUser.neonColor,
                      borderColor: currentUser.neonColor,
                    }}
                  >
                    {currentUser.avatarInitial}
                  </div>

                  {/* Pulsing Love Emblem */}
                  <div className="relative -mx-2.5 z-10 w-7 h-7 rounded-full bg-[#0B0F19] border border-[#FF70A6]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,112,166,0.6)]">
                    <Heart className="w-3.5 h-3.5 text-[#FF70A6] fill-[#FF70A6]" />
                  </div>

                  {/* Right Avatar: Partner */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg"
                    style={{
                      backgroundColor: partnerUser.avatarColor,
                      color: partnerUser.neonColor,
                      borderColor: partnerUser.neonColor,
                    }}
                  >
                    {partnerUser.avatarInitial}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{currentUser.shortName}</span>
                    <span className="text-gray-400">&</span>
                    <span className="text-[#FF70A6]">{partnerUser.shortName}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono truncate">
                    {partnerUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUnlink}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                title="Desvincular parceiro(a)"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action: Ativar Modo Casal no Dashboard */}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewMode('couple');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF70A6]/20 via-[#00F0FF]/20 to-[#39FF14]/20 hover:from-[#FF70A6]/30 hover:to-[#00F0FF]/30 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-sm cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#FF70A6]" />
                <span>Ativar Visão do Casal no Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Convidar Parceiro(a) por E-mail */
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF70A6]/25 to-[#00F0FF]/25 border border-[#FF70A6]/30 flex items-center justify-center text-[#FF70A6] shrink-0">
                <Heart className="w-5 h-5 fill-[#FF70A6]/20" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Conectar Parceiro(a) por E-mail
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Envie um convite para o e-mail do seu amor e unam suas finanças com relatórios conjuntos e divisão proporcional.
                </p>
              </div>
            </div>

            {/* Pending Invite Alert */}
            {pendingInviteEmail && !feedback && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>
                      Convite aguardando aceite:{' '}
                      <strong className="font-mono text-white">{pendingInviteEmail}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Pendente
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyLink()}
                    className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-300" />
                        <span>Copiar Link de Convite</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp()}
                    className="py-1.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* Feedback notification */}
            {feedback && (
              <div
                className={`p-3 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                  feedback.type === 'success'
                    ? 'bg-[#39FF14]/10 border-[#39FF14]/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {feedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="flex-1">{feedback.message}</p>
                </div>

                {feedback.link && (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(feedback.link)}
                      className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                          <span>Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link de Cadastro</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(feedback.link)}
                      className="py-1.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleSendInvite} className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pl-1">
                  E-mail do seu parceiro(a)
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder="ex: parceiro@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs backdrop-blur-xl focus:outline-none focus:border-[#FF70A6] focus:ring-1 focus:ring-[#FF70A6]/40 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Instant match indicator if email belongs to someone already registered */}
              {matchedExistingUser && (
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: matchedExistingUser.avatarColor,
                        color: matchedExistingUser.neonColor,
                      }}
                    >
                      {matchedExistingUser.avatarInitial}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {matchedExistingUser.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Conta cadastrada no {matchedExistingUser.bankName}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#39FF14] font-bold">
                    Pronto para vincular
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !emailInput.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF70A6] via-[#FF0055] to-[#8A2BE2] font-bold text-white text-xs tracking-wide shadow-[0_4px_20px_rgba(255,112,166,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {matchedExistingUser
                        ? `Vincular com ${matchedExistingUser.shortName}`
                        : 'Enviar Convite para o Casal'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
