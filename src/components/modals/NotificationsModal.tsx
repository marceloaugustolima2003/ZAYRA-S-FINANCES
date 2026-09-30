import React from 'react';
import { X, Bell, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../../types/finance';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#121927] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notificações</h2>
              <span className="text-[11px] text-slate-400">
                Alertas patrimoniais e avisos
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-purple-400 hover:underline font-semibold"
            >
              Marcar lidas
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 overflow-y-auto flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((n) => {
              const iconMap = {
                success: <CheckCircle2 className="w-4 h-4 text-purple-400" />,
                alert: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                info: <Info className="w-4 h-4 text-indigo-400" />,
              };

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.unread
                      ? 'bg-purple-500/10 border-purple-500/25'
                      : 'bg-[#0a0e17] border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 flex-shrink-0 mt-0.5">
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
