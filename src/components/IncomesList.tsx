import React from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Briefcase,
  TrendingUp,
  DollarSign,
  Gift,
  Building,
  MoreHorizontal,
} from 'lucide-react';
import { StandardIncomeTransaction, IncomeCategory } from '../types/finance';
import { formatThaiCurrency, formatThaiDate } from '../utils/financeCalculations';

interface IncomesListProps {
  incomes: StandardIncomeTransaction[];
  isDarkMode?: boolean;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const IncomesList: React.FC<IncomesListProps> = ({
  incomes,
  isDarkMode = false,
  onDelete,
  onAddNew,
}) => {
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  const getCategoryMeta = (cat: IncomeCategory) => {
    switch (cat) {
      case 'salary':
        return {
          label: 'เงินเดือนประจำ',
          icon: <Building className="w-4 h-4" />,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'business':
        return {
          label: 'ธุรกิจ / ค้าขาย',
          icon: <Briefcase className="w-4 h-4" />,
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'freelance':
        return {
          label: 'งานสัญญา / ฟรีแลนซ์',
          icon: <DollarSign className="w-4 h-4" />,
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'bonus':
        return {
          label: 'โบนัส / ค่าคอมฯ',
          icon: <Gift className="w-4 h-4" />,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'dividend':
        return {
          label: 'เงินปันผล',
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
        };
      default:
        return {
          label: 'รายรับอื่นๆ',
          icon: <MoreHorizontal className="w-4 h-4" />,
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              เงินเข้า / รายรับเดือนนี้ (Income)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            บันทึกเงินเดือนหรือรายได้ที่เข้ามา เพื่อให้ระบบนำไปหักลบกับค่าใช้จ่ายหลัก
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มเงินเข้า</span>
        </button>
      </div>

      {/* Summary Card */}
      <div
        className={`rounded-3xl p-5 border flex items-center justify-between gap-4 ${
          isDarkMode ? 'glass-card-dark' : 'glass-card-light'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              รวมเงินเข้าทั้งหมดเดือนนี้
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-num tabular-nums mt-0.5">
              {formatThaiCurrency(totalIncome)}
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <div>จำนวนรายการ</div>
          <div className="text-lg font-bold text-slate-800 dark:text-white font-num mt-0.5">
            {incomes.length} รายการ
          </div>
        </div>
      </div>

      {/* Incomes List or Empty State */}
      {incomes.length === 0 ? (
        <div
          className={`p-10 rounded-3xl border text-center ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <Wallet className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            ยังไม่ได้บันทึกเงินเข้าในเดือนนี้
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            ระบุเงินเดือน รายได้ค้าขาย หรือเงินโอนเข้า เพื่อให้ระบบคำนวณเงินคงเหลือหลังหักค่าใช้จ่าย
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกเงินเข้ารายการแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {incomes.map((item) => {
            const meta = getCategoryMeta(item.category);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                  isDarkMode ? 'glass-card-dark' : 'glass-card-light'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-2xl border shrink-0 ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 shrink-0">· {meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatThaiDate(item.date)}</span>
                      </span>
                      {item.note && <span className="text-[11px] truncate">({item.note})</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-num tabular-nums">
                      +{formatThaiCurrency(item.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">เงินเข้า</div>
                  </div>
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
