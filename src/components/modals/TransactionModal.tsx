import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { Transaction, TransactionType } from '../../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [institution, setInstitution] = useState('Nubank');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Lazer',
    'Saúde',
    'Educação',
    'Salário',
    'Investimentos',
    'Outros',
  ];

  const institutions = [
    'Nubank',
    'Itaú Personnalité',
    'XP Investimentos',
    'Cartão de Crédito',
    'Dinheiro',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!title.trim()) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onSave({
      title: title.trim(),
      category,
      institution,
      paymentMethod,
      amount: parsedAmount,
      type,
      date: dateStr,
      time: timeStr,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#121927] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Nova Movimentação
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector: Despesa & Receita */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-[#090d16] border border-white/5">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            Receita
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount input */}
          <div className="text-center py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valor
            </span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-400 font-numeric">
                R$
              </span>
              <input
                type="text"
                autoFocus
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-44 text-3xl font-extrabold text-white text-center bg-transparent border-b-2 border-purple-500/50 focus:border-purple-400 focus:outline-none font-numeric pb-1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição / Estabelecimento
            </label>
            <input
              type="text"
              placeholder="Ex: Supermercado, Aluguel, Salário..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#121927] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Institution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Conta / Banco
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {institutions.map((inst) => (
                  <option key={inst} value={inst} className="bg-[#121927]">
                    {inst}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0e17] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="Cartão, Pix, Débito..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Adicionar nota..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0a0e17] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl btn-purple-glow text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
