import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-xl text-amber-300 text-xs font-medium shadow-lg animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline — Sincronizando localmente</span>
    </div>
  );
};
