import React from 'react';
import { Delete } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface NumpadProps {
  onNumber: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({
  onNumber,
  onDelete,
  onClear,
}) => {
  const keys = [
    { label: '1', sub: '' },
    { label: '2', sub: 'ABC' },
    { label: '3', sub: 'DEF' },
    { label: '4', sub: 'GHI' },
    { label: '5', sub: 'JKL' },
    { label: '6', sub: 'MNO' },
    { label: '7', sub: 'PQRS' },
    { label: '8', sub: 'TUV' },
    { label: '9', sub: 'WXYZ' },
    { label: 'C', sub: 'CLEAR', action: 'clear' },
    { label: '0', sub: '+' },
    { label: 'del', sub: '', action: 'delete' },
  ];

  const handleKeyPress = (key: (typeof keys)[0]) => {
    if (key.action === 'delete') {
      triggerHaptic('medium');
      onDelete();
    } else if (key.action === 'clear') {
      triggerHaptic('heavy');
      onClear();
    } else {
      triggerHaptic('light');
      onNumber(key.label);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-y-3 gap-x-6 w-full max-w-[340px] mx-auto select-none pt-2">
      {keys.map((k, index) => {
        const isDelete = k.action === 'delete';
        const isClear = k.action === 'clear';

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleKeyPress(k)}
            className="flex flex-col items-center justify-center h-[56px] rounded-2xl border-none bg-transparent hover:bg-white/[0.04] active:bg-white/[0.1] active:scale-95 transition-transform duration-75 text-white outline-none focus:outline-none focus:ring-0"
          >
            {isDelete ? (
              <div className="flex items-center justify-center text-gray-300 hover:text-white">
                <Delete className="w-6 h-6 stroke-[1.75]" />
              </div>
            ) : isClear ? (
              <span className="text-sm font-semibold tracking-wider text-rose-400">
                LIMPAR
              </span>
            ) : (
              <>
                <span className="text-2xl font-light text-white leading-none tracking-tight">
                  {k.label}
                </span>
                {k.sub && (
                  <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase mt-0.5">
                    {k.sub}
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};
