import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../utils/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    triggerHaptic('light');
    if (isInstallable) {
      install();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
        title="Instalar Zayra's no seu iPhone ou Android"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F1626]/95 border border-white/15 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowIOSGuide(false);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#0066FF] p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center font-bold text-[#00F0FF] text-xl">
                  Z
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instalar no iPhone / Safari</h3>
                <p className="text-xs text-gray-400">Tenha a experiência nativa sem barra</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="leading-snug">
                  1. Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima) na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="p-2 rounded-xl bg-[#39FF14]/10 text-[#39FF14]">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="leading-snug">
                  2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowIOSGuide(false);
              }}
              className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#0066FF] font-semibold text-white text-sm shadow-[0_0_20px_rgba(0,240,255,0.35)] active:scale-95 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
