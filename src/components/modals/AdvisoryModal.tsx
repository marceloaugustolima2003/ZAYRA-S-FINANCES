import React, { useState } from 'react';
import { X, TrendingUp, ShieldCheck, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import { AdvisoryOpportunity } from '../../types/finance';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: AdvisoryOpportunity[];
}

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({
  isOpen,
  onClose,
  opportunities,
}) => {
  const [selectedOpp, setSelectedOpp] = useState<AdvisoryOpportunity>(opportunities[0]);
  const [simulationAmount, setSimulationAmount] = useState('10000');
  const [simulatedYears, setSimulatedYears] = useState('2');
  const [investSuccess, setInvestSuccess] = useState(false);

  if (!isOpen) return null;

  const simVal = parseFloat(simulationAmount) || 0;
  const years = parseFloat(simulatedYears) || 1;
  // approximate 13.5% a.a. compound
  const projectedReturn = simVal * Math.pow(1 + 0.132, years);
  const netProfit = projectedReturn - simVal;

  const handleSimulateInvest = () => {
    setInvestSuccess(true);
    setTimeout(() => {
      setInvestSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#111826] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-purple-400 text-[11px] font-semibold tracking-wider uppercase font-numeric">
              <ShieldCheck className="w-3.5 h-3.5" />
              CONSULTORIA EXCLUSIVA AURA WEALTH
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Otimização de Renda Fixa
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {investSuccess ? (
          <div className="py-12 text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Proposta Enviada!</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Seu banker exclusivo entrará em contato para confirmar a alocação de R${' '}
              {simVal.toLocaleString('pt-BR')} no {selectedOpp.title}.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Curadoria algorítmica de ativos de alta rentabilidade alinhada ao seu perfil moderado e patrimônio de R$ 49.850,50.
            </p>

            {/* Opportunities List */}
            <div className="space-y-2">
              {opportunities.map((opp) => {
                const isSelected = selectedOpp.id === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-[#0a0e17] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {opp.title}
                          {isSelected && (
                            <span className="text-[10px] bg-purple-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-sm">
                              Selecionado
                            </span>
                          )}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {opp.subtitle}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-purple-400 font-numeric whitespace-nowrap ml-2">
                        {opp.yieldRate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                      <span>Prazo: <b className="text-slate-200">{opp.term}</b></span>
                      <span>•</span>
                      <span>Mínimo: <b className="text-slate-200 font-numeric">R$ {opp.minInvestment.toLocaleString('pt-BR')}</b></span>
                      <span>•</span>
                      <span>Risco: <b className="text-slate-200">{opp.risk}</b></span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulator Box */}
            <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3">
                <Calculator className="w-4 h-4 text-purple-400" />
                Simulador de Rentabilidade Estimada
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">
                    Aporte Inicial (R$)
                  </label>
                  <input
                    type="number"
                    value={simulationAmount}
                    onChange={(e) => setSimulationAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#141b2b] border border-white/10 text-white font-numeric text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">
                    Prazo (Anos)
                  </label>
                  <select
                    value={simulatedYears}
                    onChange={(e) => setSimulatedYears(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#141b2b] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="1">1 ano</option>
                    <option value="2">2 anos</option>
                    <option value="3">3 anos</option>
                    <option value="5">5 anos</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-300 block">
                    Total Bruto Estimado
                  </span>
                  <span className="text-base font-extrabold text-white font-numeric">
                    R$ {projectedReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-purple-400 font-semibold block">
                    Lucro Estimado
                  </span>
                  <span className="text-xs font-bold text-purple-400 font-numeric">
                    +R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleSimulateInvest}
              className="w-full py-3 px-4 rounded-xl btn-purple-glow text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              Alocar no {selectedOpp.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
