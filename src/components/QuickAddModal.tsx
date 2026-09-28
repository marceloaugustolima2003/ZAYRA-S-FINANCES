import React, { useState } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Numpad } from './Numpad';
import { UserAccount, Transaction } from '../types/finance';
import { triggerHaptic } from '../utils/haptics';

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const EXPENSE_CATEGORIES: CategoryOption[] = [
  { id: 'alimentacao', name: 'Alimentação', icon: '🛒', color: '#FF7A00' },
  { id: 'delivery', name: 'Delivery & Ifood', icon: '🍔', color: '#FF0055' },
  { id: 'transporte', name: 'Transporte & Carro', icon: '⛽', color: '#39FF14' },
  { id: 'lazer', name: 'Lazer & Rolê', icon: '🥂', color: '#00F0FF' },
  { id: 'moradia', name: 'Moradia & Contas', icon: '🏠', color: '#0066FF' },
  { id: 'saude', name: 'Saúde & Farmácia', icon: '💊', color: '#FF3366' },
  { id: 'compras', name: 'Shopping & Roupas', icon: '🛍️', color: '#FFD700' },
  { id: 'viagem', name: 'Viagem & Férias', icon: '✈️', color: '#8A2BE2' },
  { id: 'educacao', name: 'Cursos & Livros', icon: '📚', color: '#00E5FF' },
];

const INCOME_CATEGORIES: CategoryOption[] = [
  { id: 'salario', name: 'Salário & Prolabore', icon: '💼', color: '#39FF14' },
  { id: 'consultoria', name: 'Serviços & Freela', icon: '✨', color: '#00F0FF' },
  { id: 'investimento', name: 'Rendimentos & Dividendos', icon: '📈', color: '#39FF14' },
  { id: 'outros', name: 'Outros Recebimentos', icon: '💵', color: '#FFD700' },
];

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddTransaction,
}) => {
  const [cents, setCents] = useState<number>(0);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState<string>('');

  if (!isOpen) return null;

  const categories = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Format real-time BRL currency string
  const formatAmount = (totalCents: number) => {
    const val = totalCents / 100;
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleNumber = (digit: string) => {
    if (cents > 9999999) return;
    setCents((prev) => prev * 10 + parseInt(digit, 10));
  };

  const handleDelete = () => {
    setCents((prev) => Math.floor(prev / 10));
  };

  const handleClear = () => {
    setCents(0);
  };

  const handleConfirm = () => {
    if (cents <= 0) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('success');
    const amount = cents / 100;

    onAddTransaction({
      userId: currentUser.id,
      description: description.trim() || selectedCategory.name,
      amount,
      type: txType,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date: 'Hoje',
      cardName: currentUser.primaryCard,
    });

    // Reset & Close
    setCents(0);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Heavy Blur & Dark Backdrop */}
      <div
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
        className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-[24px] transition-opacity duration-300 animate-in fade-in"
      />

      {/* 68% Height Liquid Glass Bottom Sheet */}
      <div className="relative z-10 w-full max-w-lg mx-auto h-[70vh] min-h-[590px] rounded-t-[36px] liquid-glass-modal flex flex-col justify-between p-5 pb-safe animate-in slide-in-from-bottom duration-350 ease-out border-x border-t border-white/20">
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto -mt-1 mb-2" />

        {/* Top Bar: Title & Close Button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentUser.neonColor }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Nova Transação • Conta de {currentUser.shortName}
            </span>
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

        {/* 1. Massive Real-Time Value Display */}
        <div className="text-center py-1">
          <div className="text-3xl sm:text-4xl font-light tracking-tight text-white font-mono flex items-center justify-center">
            <span
              className={`transition-colors duration-200 ${
                cents > 0
                  ? txType === 'income'
                    ? 'text-[#39FF14] font-medium'
                    : 'text-[#00F0FF] font-medium'
                  : 'text-gray-400'
              }`}
            >
              {formatAmount(cents)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
            {cents === 0
              ? 'Digite o valor no teclado numérico'
              : `${txType === 'expense' ? 'Débito' : 'Crédito'} em ${currentUser.bankName}`}
          </p>
        </div>

        {/* 2. Tipo de Transação: Saída vs Entrada */}
        <div className="w-full max-w-[280px] mx-auto">
          <div className="relative p-1 rounded-full bg-white/[0.05] border border-white/10 flex items-center">
            {/* Sliding neon highlight background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out ${
                txType === 'expense'
                  ? 'left-1 bg-rose-500/25 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                  : 'left-[calc(50%)] bg-[#39FF14]/25 border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.35)]'
              }`}
            />

            {/* Despesa (Saída) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setTxType('expense');
                setSelectedCategory(EXPENSE_CATEGORIES[0]);
              }}
              className={`relative z-10 w-1/2 py-1.5 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                txType === 'expense' ? 'text-rose-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Despesa</span>
            </button>

            {/* Receita (Entrada) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setTxType('income');
                setSelectedCategory(INCOME_CATEGORIES[0]);
              }}
              className={`relative z-10 w-1/2 py-1.5 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                txType === 'income' ? 'text-[#39FF14]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Entrada</span>
            </button>
          </div>
        </div>

        {/* 3. Category Chips (Horizontal Scrollable Glassmorphism) */}
        <div className="py-1.5 overflow-x-auto no-scrollbar flex items-center gap-2 px-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat);
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#00F0FF]/15 border-2 border-[#00F0FF] text-white shadow-[0_0_14px_rgba(0,240,255,0.35)]'
                    : 'bg-white/[0.05] border border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Thumb-Optimized Numpad */}
        <div className="flex-1 flex flex-col justify-center">
          <Numpad
            onNumber={handleNumber}
            onDelete={handleDelete}
            onClear={handleClear}
          />
        </div>

        {/* 5. Confirm Action Bar */}
        <div className="pt-2 px-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={cents === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
              cents > 0
                ? 'bg-gradient-to-r from-[#00F0FF] via-[#00B4D8] to-[#39FF14] text-[#0B0F19] shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-98 cursor-pointer'
                : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Registrar {txType === 'expense' ? 'Saída' : 'Entrada'} na Conta de {currentUser.shortName}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
