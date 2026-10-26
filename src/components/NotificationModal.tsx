import React from 'react';
import {
  X,
  Bell,
  AlertOctagon,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Send,
} from 'lucide-react';
import { NotificationLog } from '../types/finance';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  onClearAll: () => void;
  onTestNotification: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onTestNotification,
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ประวัติการแจ้งเตือนงบประมาณ</h3>
              <p className="text-[11px] text-slate-500">
                {notifications.length} การแจ้งเตือนล่าสุด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>ยังไม่มีประวัติการแจ้งเตือน</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isDanger = notif.type === 'budget_exceeded';
              const isCaution = notif.type === 'budget_caution';
              const isProfit = notif.type === 'trade_profit' || notif.type === 'investment_milestone';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                    isDanger
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : isCaution
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : isProfit
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isDanger ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                    ) : isCaution ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : isProfit ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 opacity-90">{notif.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
          <button
            onClick={onTestNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ทดสอบส่งแจ้งเตือน</span>
          </button>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
