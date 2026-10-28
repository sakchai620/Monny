import React, { useState } from 'react';
import {
  Home,
  Car,
  Zap,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Wrench,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Search,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { MajorExpenseTransaction, MajorExpenseCategory } from '../types/finance';
import { formatThaiCurrency, formatThaiDate } from '../utils/financeCalculations';
import { soundEffects } from '../utils/notificationService';

interface MajorExpensesListProps {
  expenses: MajorExpenseTransaction[];
  isDarkMode?: boolean;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onBackToOverview?: () => void;
}

export const MajorExpensesList: React.FC<MajorExpensesListProps> = ({
  expenses,
  isDarkMode = false,
  onTogglePaid,
  onDelete,
  onAddNew,
  onBackToOverview,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const paidExpenses = expenses.filter((e) => e.isPaid);
  const unpaidExpenses = expenses.filter((e) => !e.isPaid);

  const paidAmount = paidExpenses.reduce((sum, item) => sum + item.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  const filtered = expenses.filter((e) => {
    if (filterStatus === 'unpaid' && e.isPaid) return false;
    if (filterStatus === 'paid' && !e.isPaid) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.note?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getCategoryMeta = (cat: MajorExpenseCategory) => {
    switch (cat) {
      case 'housing':
        return { label: 'ผ่อนบ้าน/คอนโด', icon: <Home className="w-4 h-4" />, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'car_installment':
        return { label: 'ผ่อนงวดรถยนต์', icon: <Car className="w-4 h-4" />, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' };
      case 'utilities':
        return { label: 'ค่าน้ำ/ไฟ/เน็ต', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'insurance':
        return { label: 'เบี้ยประกันชีวิต/รถ', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'debt_loan':
        return { label: 'สินเชื่อ/บัตรเครดิต', icon: <CreditCard className="w-4 h-4" />, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'education':
        return { label: 'ค่าเทอม/การศึกษา', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'maintenance':
        return { label: 'ค่าส่วนกลาง', icon: <Wrench className="w-4 h-4" />, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
      default:
        return { label: 'ค่าหลักอื่นๆ', icon: <MoreHorizontal className="w-4 h-4" />, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
    }
  };

  const handleToggle = (id: string, currentState: boolean) => {
    if (!currentState) {
      soundEffects.playProfitChime();
    }
    onTogglePaid(id);
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation Back Bar */}
      {onBackToOverview && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToOverview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>← ย้อนกลับไปหน้าภาพรวม</span>
          </button>
        </div>
      )}
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              ค่าใช้จ่ายหลักประจำเดือน (Major Monthly Bills)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            บันทึกเฉพาะภาระค่าใช้จ่ายหลัก ค่าผ่อน บิล และประกัน พร้อมสลับสถานะชำระเงินใน 1 แตะ
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มค่าใช้จ่ายหลัก</span>
        </button>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          style={{
            backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            รวมค่าใช้จ่ายหลักทั้งเดือน
          </div>
          <div className="text-xl font-extrabold font-num text-slate-800 dark:text-white mt-1 tabular-nums">
            {formatThaiCurrency(totalAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ทั้งหมด {expenses.length} รายการ
          </div>
        </div>

        <div
          style={{
            backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ชำระเรียบร้อยแล้ว</span>
          </div>
          <div className="text-xl font-extrabold font-num text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatThaiCurrency(paidAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            เสร็จแล้ว {paidExpenses.length} รายการ ({totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%)
          </div>
        </div>

        <div
          style={{
            backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>ยังรอชำระในเดือนนี้</span>
          </div>
          <div className="text-xl font-extrabold font-num text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {formatThaiCurrency(unpaidAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ค้างจ่ายอีก {unpaidExpenses.length} รายการ
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาบิล เช่น ผ่อนบ้าน ค่างวดรถ ประกันชีวิต..."
            className={`w-full pl-9 pr-3.5 py-2.5 rounded-2xl text-xs border focus:outline-none transition-all ${
              isDarkMode
                ? 'bg-slate-900/80 border-white/10 text-white placeholder-slate-500 focus:border-rose-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs focus:border-rose-500'
            }`}
          />
        </div>

        {/* Refined Segmented Status Switch */}
        <div
          className={`flex items-center p-1 rounded-2xl border text-xs ${
            isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-slate-100/90 border-slate-200/80'
          }`}
        >
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            ทั้งหมด ({expenses.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'unpaid'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            รอชำระ ({unpaidExpenses.length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'paid'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            จ่ายแล้ว ({paidExpenses.length})
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {filtered.length === 0 ? (
        <div
          className={`p-10 rounded-3xl border text-center ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            ไม่พบรายการค่าใช้จ่ายหลัก
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            บันทึกบิลหลัก เช่น ค่าผ่อนบ้าน ค่างวดรถ หรือประกัน เพื่อไม่ให้พลาดกำหนดชำระ
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกค่าหลักรายการแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const meta = getCategoryMeta(item.category);

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl border transition-all ${
                  item.isPaid
                    ? isDarkMode
                      ? 'glass-card-dark opacity-85'
                      : 'glass-card-light opacity-90'
                    : isDarkMode
                    ? 'glass-card-dark border-amber-500/30'
                    : 'glass-card-light border-amber-200/90 shadow-xs'
                }`}
              >
                {/* Item Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold leading-snug transition-colors ${
                          item.isPaid ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">· {meta.label}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.dueDate ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>ครบกำหนด: {formatThaiDate(item.dueDate)}</span>
                        </span>
                      ) : (
                        <span className="text-[11px]">วันที่บันทึก: {formatThaiDate(item.date)}</span>
                      )}
                      {item.note && <span className="text-[11px] truncate max-w-xs">({item.note})</span>}
                    </div>
                  </div>
                </div>

                {/* Amount & 1-Tap Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/50 dark:border-white/5">
                  <div className="sm:text-right">
                    <div
                      className={`text-base font-extrabold font-num tabular-nums ${
                        item.isPaid
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatThaiCurrency(item.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.isPaid ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
                    </div>
                  </div>

                  {/* 1-Tap Toggle Button */}
                  <button
                    onClick={() => handleToggle(item.id, item.isPaid)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      item.isPaid
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs'
                    }`}
                  >
                    {item.isPaid ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ชำระแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>แตะเมื่อจ่าย</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(item.id)}
                    aria-label={`ลบรายการ ${item.title}`}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
