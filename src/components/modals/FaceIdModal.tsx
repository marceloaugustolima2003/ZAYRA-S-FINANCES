import React, { useEffect, useState } from 'react';
import { Check, Shield } from 'lucide-react';

interface FaceIdModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  reason?: string;
}

export const FaceIdModal: React.FC<FaceIdModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  title = 'Autenticação Biométrica',
  reason = 'Confirme sua identidade via Face ID para visualizar ou transferir',
}) => {
  const [phase, setPhase] = useState<'scanning' | 'verified'>('scanning');

  useEffect(() => {
    if (isOpen) {
      setPhase('scanning');
      const timer = setTimeout(() => {
        setPhase('verified');
        const endTimer = setTimeout(() => {
          onSuccess();
        }, 800);
        return () => clearTimeout(endTimer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xs p-6 rounded-3xl bg-[#141d30]/90 backdrop-blur-3xl border border-white/15 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        {/* Centered glass disc with pulsing purple rim stroke, housing a vector FaceID glyph */}
        <div className="relative w-28 h-28 mx-auto my-4 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
              phase === 'scanning'
                ? 'border-purple-400 animate-ping opacity-30 shadow-[0_0_20px_#a855f7]'
                : 'border-purple-400 opacity-100 shadow-[0_0_35px_#c084fc]'
            }`}
          />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#1c2842] to-[#0e1626] border border-white/20 flex items-center justify-center shadow-inner">
            {phase === 'scanning' ? (
              <svg
                viewBox="0 0 64 64"
                className="w-12 h-12 text-purple-400 animate-pulse stroke-current"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Face outline corners */}
                <path d="M 16 22 L 16 18 A 6 6 0 0 1 22 12 L 26 12" />
                <path d="M 38 12 L 42 12 A 6 6 0 0 1 48 18 L 48 22" />
                <path d="M 48 42 L 48 46 A 6 6 0 0 1 42 52 L 38 52" />
                <path d="M 26 52 L 22 52 A 6 6 0 0 1 16 46 L 16 42" />
                {/* Eyes */}
                <circle cx="25" cy="27" r="2" fill="currentColor" />
                <circle cx="39" cy="27" r="2" fill="currentColor" />
                {/* Nose */}
                <path d="M 32 29 L 32 34 L 30 35" />
                {/* Smile */}
                <path d="M 26 41 Q 32 46 38 41" />
              </svg>
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center animate-scaleUp">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-white mt-2">{title}</h3>
        <p className="text-xs text-slate-300 mt-1 mb-4 leading-normal">{reason}</p>

        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
