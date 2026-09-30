import React from 'react';
import { X, Calendar, Clock, CreditCard, Tag, FileText, Trash2, ArrowUpRight, ArrowDownLeft, Share2 } from 'lucide-react';
import { Transaction } from '../../types/finance';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onDelete,
  formatCurrency,
}) => {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#121927] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Comprovante Digital
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Comprovante copiado para a área de transferência.')}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Amount */}
        <div className="text-center py-6 border-b border-white/5">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg ${
              isIncome
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isIncome ? (
              <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
            ) : (
              <ArrowDownLeft className="w-7 h-7 stroke-[2.5]" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{transaction.title}</h2>
          <div
            className={`text-3xl font-extrabold mt-1 font-numeric ${
              isIncome ? 'text-purple-400' : 'text-rose-400'
            }`}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </div>
          <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-medium text-slate-300">
            {transaction.category}
          </span>
        </div>

        {/* Details Grid */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              Instituição / Conta
            </span>
            <span className="font-semibold text-white">
              {transaction.institution}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Forma de Pagamento
            </span>
            <span className="font-semibold text-white">
              {transaction.paymentMethod}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data
            </span>
            <span className="font-semibold text-white font-numeric">
              {transaction.date}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Horário
            </span>
            <span className="font-semibold text-white font-numeric">
              {transaction.time}
            </span>
          </div>

          {transaction.notes && (
            <div className="py-2">
              <span className="text-slate-400 flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Observação
              </span>
              <p className="p-2.5 rounded-xl bg-[#090d16] text-slate-300 text-xs">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Deseja realmente excluir este lançamento?')) {
                onDelete(transaction.id);
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir Lançamento
          </button>
        </div>
      </div>
    </div>
  );
};
