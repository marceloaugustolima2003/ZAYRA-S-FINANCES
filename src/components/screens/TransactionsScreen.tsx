import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Download,
  ShoppingCart,
  Fuel,
  Building,
  Clapperboard,
  Utensils,
  Car,
  Package,
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types/finance';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onOpenNewTransaction: (type: TransactionType) => void;
  onSelectTransaction: (tx: Transaction) => void;
  formatCurrency: (val: number) => string;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onOpenNewTransaction,
  onSelectTransaction,
  formatCurrency,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.institution.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'income' && tx.type === 'income') ||
      (selectedType === 'expense' && tx.type === 'expense') ||
      (selectedType === 'transfer' && tx.type === 'transfer');

    const matchesInstitution =
      selectedInstitution === 'all' || tx.institution.includes(selectedInstitution);

    return matchesSearch && matchesType && matchesInstitution;
  });

  const totalFilteredIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const handleExportCSV = () => {
    const header = 'ID,Data,Horario,Titulo,Categoria,Instituicao,FormaPagamento,Tipo,Valor\n';
    const rows = filteredTransactions
      .map(
        (tx) =>
          `"${tx.id}","${tx.date}","${tx.time}","${tx.title}","${tx.category}","${tx.institution}","${tx.paymentMethod}","${tx.type}",${tx.amount}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `extrato_zayra_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionIcon = (tx: Transaction) => {
    switch (tx.iconName) {
      case 'shopping-cart':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-blue-400" />;
      case 'building':
        return <Building className="w-4 h-4 text-purple-400" />;
      case 'clapperboard':
        return <Clapperboard className="w-4 h-4 text-pink-400" />;
      case 'utensils':
        return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'car':
        return <Car className="w-4 h-4 text-blue-400" />;
      default:
        return <Package className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getIconBackground = (tx: Transaction) => {
    switch (tx.iconName) {
      case 'shopping-cart':
        return 'bg-amber-500/15 border-amber-500/25';
      case 'fuel':
        return 'bg-blue-500/15 border-blue-500/25';
      case 'building':
        return 'bg-purple-500/15 border-purple-500/25';
      case 'clapperboard':
        return 'bg-pink-500/15 border-pink-500/25';
      case 'utensils':
        return 'bg-orange-500/15 border-orange-500/25';
      case 'car':
        return 'bg-blue-500/15 border-blue-500/25';
      default:
        return 'bg-cyan-500/15 border-cyan-500/25';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header with Search and New Transaction button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar lançamentos, lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#141b2b] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        <button
          onClick={() => onOpenNewTransaction('expense')}
          className="p-2.5 rounded-2xl btn-purple-glow text-white font-bold active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
          title="Novo Lançamento"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'expense', label: 'Saídas' },
          { id: 'income', label: 'Entradas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === tab.id
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'bg-[#151c2a] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <button
          onClick={handleExportCSV}
          className="ml-auto px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 whitespace-nowrap"
          title="Exportar CSV"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>CSV</span>
        </button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#121927] border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
              Entradas Filtradas
            </span>
            <span className="text-xs font-bold text-white font-numeric">
              +{formatCurrency(totalFilteredIncome)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
              Saídas Filtradas
            </span>
            <span className="text-xs font-bold text-white font-numeric">
              -{formatCurrency(totalFilteredExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="rounded-3xl glass-card divide-y divide-white/5 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${getIconBackground(
                    tx
                  )} group-hover:scale-105 transition-transform`}
                >
                  {getTransactionIcon(tx)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                    {tx.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {tx.category} • {tx.institution}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold font-numeric block ${
                    tx.type === 'income' ? 'text-purple-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
                <span className="text-[10px] text-slate-400 font-numeric">
                  {tx.date} • {tx.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
