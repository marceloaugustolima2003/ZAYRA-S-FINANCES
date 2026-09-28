import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { RecurringTransaction, UserAccount } from '../types/finance';
import { useFinanceStore } from '../store/useFinanceStore';
import { triggerHaptic } from '../utils/haptics';
import {
  Repeat,
  X,
  Plus,
  Calendar,
  Check,
  Trash2,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  Zap,
} from 'lucide-react';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const {
    recurringTransactions,
    users,
    addRecurringTransaction,
    toggleRecurringTransaction,
    deleteRecurringTransaction,
    addTransaction,
    processDueRecurring,
  } = useFinanceStore();

  const [isCreating, setIsCreating] = useState(false);
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Assinaturas');
  const [dayOfMonth, setDayOfMonth] = useState<number>(5);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [assignedUserId, setAssignedUserId] = useState<string>(currentUser.id);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter for current user / couple
  const partnerUser = users.find((u) => u.id !== currentUser.id);

  // Totals for active recurring items
  const totalMonthlyExpenses = recurringTransactions
    .filter((r) => r.active && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalMonthlyIncome = recurringTransactions
    .filter((r) => r.active && r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput.replace(',', '.'));
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('success');
    const assignedUser = users.find((u) => u.id === assignedUserId) || currentUser;

    await addRecurringTransaction({
      userId: assignedUser.id,
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      categoryIcon: type === 'income' ? '💼' : '🔄',
      categoryColor: type === 'income' ? '#39FF14' : '#00F0FF',
      frequency,
      dayOfMonth: Number(dayOfMonth),
      cardName: assignedUser.primaryCard,
      active: true,
      autoPost: true,
      nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), dayOfMonth).toISOString().split('T')[0],
    });

    setDescription('');
    setAmountInput('');
    setIsCreating(false);
    showToast('Recorrência programada com sucesso!');
  };

  const handleTriggerNow = async (item: RecurringTransaction) => {
    triggerHaptic('medium');
    setProcessingId(item.id);

    const now = new Date();
    await addTransaction({
      userId: item.userId,
      description: `${item.description} (Recorrência Antecipada)`,
      amount: item.amount,
      type: item.type,
      category: item.category,
      categoryIcon: item.categoryIcon,
      categoryColor: item.categoryColor,
      date: 'Hoje (Manual)',
      cardName: item.cardName,
      note: `Lançamento manual de recorrência • ${item.frequency}`,
      isRecurring: true,
      recurringId: item.id,
    });

    setTimeout(() => {
      setProcessingId(null);
      triggerHaptic('success');
      showToast(`Lançado R$ ${item.amount.toFixed(2)} no extrato!`);
    }, 350);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Heavy Blur Backdrop */}
      <div
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
        className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-[24px] transition-opacity"
      />

      {/* Main Liquid Glass Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md max-h-[85vh] rounded-[32px] bg-[#0E1526]/95 border border-white/15 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-3xl flex flex-col overflow-hidden"
      >
        {/* Top Specular Line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00F0FF]/25 to-[#FF70A6]/25 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Transações Recorrentes</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {recurringTransactions.length} ativas
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">
                Assinaturas, salários e contas mensais agendadas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2.5 p-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card: Monthly Fixed Inflow vs Outflow */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#39FF14]" />
              <span>Receitas Fixas / Mês</span>
            </div>
            <div className="text-sm font-bold text-[#39FF14] font-mono mt-0.5">
              R$ {totalMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
              <span>Despesas Fixas / Mês</span>
            </div>
            <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
              R$ {totalMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Action Button: Toggle Create Form */}
        <div className="my-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsCreating(!isCreating);
            }}
            className="w-full py-2 px-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 active:scale-98 transition"
          >
            {isCreating ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Cancelar Novo Agendamento</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>+ Programar Nova Despesa ou Salário Recorrente</span>
              </>
            )}
          </button>
        </div>

        {/* Create Recurring Transaction Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateNew}
              className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2.5 mb-3 overflow-hidden text-xs"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-1.5 rounded-xl border text-center font-medium transition ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-white/[0.03] text-gray-400 border-white/5'
                  }`}
                >
                  Despesa Fixa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-1.5 rounded-xl border text-center font-medium transition ${
                    type === 'income'
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40 font-bold'
                      : 'bg-white/[0.03] text-gray-400 border-white/5'
                  }`}
                >
                  Receita / Salário
                </button>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-semibold pl-1">
                  Descrição (ex: Netflix, Aluguel, Prolabore)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nome do pagamento"
                  required
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold pl-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0,00"
                    required
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold pl-1">
                    Dia do Mês (1 - 31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              {users.length > 1 && (
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold pl-1">
                    Responsável na Conta
                  </label>
                  <div className="flex gap-2">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setAssignedUserId(u.id)}
                        className={`flex-1 py-1 px-2 rounded-xl text-xs border flex items-center justify-center gap-1.5 transition ${
                          assignedUserId === u.id
                            ? 'bg-white/15 text-white border-white/30 font-semibold'
                            : 'bg-white/[0.03] text-gray-400 border-white/5'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: u.neonColor }}
                        />
                        <span>{u.shortName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0066FF] font-bold text-white text-xs shadow-md active:scale-95 transition"
              >
                Salvar Recorrência Automática
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Recurring Schedules List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar pb-2">
          {recurringTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p>Nenhuma transação recorrente programada ainda.</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Adicione suas contas fixas e assinaturas para lançamentos automáticos.
              </p>
            </div>
          ) : (
            recurringTransactions.map((item) => {
              const userOwner = users.find((u) => u.id === item.userId) || currentUser;
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    item.active
                      ? 'bg-white/[0.04] border-white/10 hover:border-white/20'
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border"
                        style={{
                          backgroundColor: `${userOwner.neonColor}15`,
                          borderColor: `${userOwner.neonColor}30`,
                        }}
                      >
                        {item.categoryIcon || (isIncome ? '💼' : '🔄')}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{item.description}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
                              item.active
                                ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
                                : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {item.active ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-[#00F0FF]" />
                            <span>Todo dia {item.dayOfMonth}</span>
                          </span>
                          <span>•</span>
                          <span style={{ color: userOwner.neonColor }}>
                            {userOwner.shortName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-xs font-mono font-bold ${
                            isIncome ? 'text-[#39FF14]' : 'text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'} R${' '}
                          {item.amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[9px] text-gray-500 font-mono">
                          {item.frequency === 'monthly' ? 'Mensal' : item.frequency}
                        </div>
                      </div>

                      {/* Trigger Now Button (Instant Post) */}
                      <button
                        type="button"
                        onClick={() => handleTriggerNow(item)}
                        disabled={processingId === item.id}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-[#00F0FF]/20 text-gray-300 hover:text-[#00F0FF] transition active:scale-90"
                        title="Lançar no extrato agora manualmente"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>

                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          toggleRecurringTransaction(item.id);
                        }}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition active:scale-90"
                        title={item.active ? 'Pausar agendamento' : 'Ativar agendamento'}
                      >
                        {item.active ? (
                          <Pause className="w-3.5 h-3.5 text-amber-300" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-[#39FF14]" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover recorrência "${item.description}"?`)) {
                            triggerHaptic('warning');
                            deleteRecurringTransaction(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition active:scale-90"
                        title="Excluir recorrência"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer: Process Due Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-[10px] text-gray-400">
            Lançamentos automáticos processados mensalmente
          </span>
          <button
            type="button"
            onClick={async () => {
              triggerHaptic('medium');
              const count = await processDueRecurring();
              triggerHaptic('success');
              showToast(
                count > 0
                  ? `${count} transações do mês geradas com sucesso!`
                  : 'Todas as recorrências deste mês já estão lançadas.'
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-[11px] active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#00F0FF]" />
            <span>Verificar Vencimentos</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
