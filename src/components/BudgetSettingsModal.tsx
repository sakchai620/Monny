import React, { useState } from 'react';
import {
  X,
  Sliders,
  Bell,
  Smartphone,
  Send,
  Trash2,
} from 'lucide-react';
import { MonthlyBudget } from '../types/finance';
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '../utils/notificationService';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: MonthlyBudget;
  onSaveBudget: (budget: MonthlyBudget) => void;
  onTestNotification: () => void;
  onResetAllToZero?: () => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSaveBudget,
  onTestNotification,
  onResetAllToZero,
}) => {
  const [amount, setAmount] = useState(budget.amount.toString());
  const [cautionPercent, setCautionPercent] = useState(budget.cautionPercent || 80);
  const [alertEnabled, setAlertEnabled] = useState(budget.alertEnabled);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount) || 0;
    if (isNaN(parsed) || parsed < 0) return;

    onSaveBudget({
      ...budget,
      amount: parsed,
      cautionPercent,
      alertEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-600">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold">ตั้งค่างบประมาณ & ระบบแจ้งเตือน</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Budget Amount */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              งบประมาณรายจ่ายที่ตั้งไว้เดือนนี้ (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">฿</span>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="เช่น 0 หรือ 35000"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ระบบจะคอยคำนวณรายจ่ายและส่งเสียงเตือนเมื่อเริ่มใช้เงินแตะใกล้เพดานนี้ (กำหนดเป็น 0 ได้)
            </p>
          </div>

          {/* Caution Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">เริ่มเตือนระวังเมื่อใช้ไปถึง:</label>
              <span className="text-amber-600 font-bold">{cautionPercent}% ของงบ</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[70, 80, 90].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setCautionPercent(pct)}
                  className={`py-2 rounded-2xl border text-xs font-bold transition-all ${
                    cautionPercent === pct
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Notification Permission Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold">การแจ้งเตือนบนโทรศัพท์ / หน้าจอ</span>
              </div>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  permissionState === 'granted'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {permissionState === 'granted' ? 'เปิดใช้งานแล้ว' : 'ยังไม่เปิดสิทธิ์'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              รับแจ้งเตือนแบบ Push Notification เมื่อใช้จ่ายเกินงบ
            </p>

            {permissionState !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>อนุญาตให้แอพส่งการแจ้งเตือน</span>
              </button>
            )}

            {/* Test button */}
            <button
              type="button"
              onClick={onTestNotification}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ทดลองส่งแจ้งเตือนและทดสอบเสียง</span>
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all"
            >
              บันทึกการตั้งค่า
            </button>
          </div>

          {/* Reset All to Zero Section */}
          {onResetAllToZero && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  onResetAllToZero();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างข้อมูลทั้งหมดให้เป็น 0 (เริ่มบันทึกใหม่)</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
