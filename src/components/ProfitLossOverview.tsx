import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Wallet,
  CreditCard,
  Plus,
} from 'lucide-react';
import { MonthlyFinancialSummary } from '../types/finance';
import { formatThaiCurrency } from '../utils/financeCalculations';

interface ProfitLossOverviewProps {
  summary: MonthlyFinancialSummary;
  isDarkMode?: boolean;
  onSelectTab: (tab: 'all' | 'income' | 'expense') => void;
  onAddNew?: (type: 'income' | 'major_expense') => void;
}

export const ProfitLossOverview: React.FC<ProfitLossOverviewProps> = ({
  summary,
  isDarkMode = false,
  onSelectTab,
  onAddNew,
}) => {
  const isZero = summary.netCashFlow === 0;
  const isNetPositive = summary.netCashFlow > 0;
  const isNetNegative = summary.netCashFlow < 0;

  let statusBadge = {
    text: 'การเงินเป็นบวก (มีเงินเหลือ)',
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Icon: Sparkles,
  };

  if (isNetNegative) {
    statusBadge = {
      text: 'รายจ่ายสูงกว่าเงินเข้า',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      Icon: TrendingDown,
    };
  } else if (isZero) {
    statusBadge = {
      text: 'สมดุล / เริ่มต้นเดือน',
      dot: 'bg-slate-400',
      badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      Icon: TrendingUp,
    };
  }

  const StatusIcon = statusBadge.Icon;

  return (
    <div className="space-y-4">
      {/* Master Financial Result Card */}
      <div
        style={{
          backgroundColor: isDarkMode ? 'rgba(26, 10, 24, 0.97)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        className={`rounded-3xl p-3.5 sm:p-6 border-2 transition-all relative overflow-hidden shadow-xl ${
          isDarkMode
            ? 'bg-slate-900 border-pink-500/30 text-white glass-card-dark'
            : 'bg-white border-pink-300/70 text-slate-800 glass-card-light'
        }`}
      >
        {/* Shimmering Accent Light */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-40 bg-gradient-to-br from-pink-400 to-rose-400 animate-shimmer"
        />

        {/* Top Header */}
        <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusBadge.dot}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap truncate">
              สรุปเงินคงเหลือสุทธิเดือนนี้
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border shrink-0 whitespace-nowrap ${statusBadge.badgeClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[11px]">{statusBadge.text}</span>
          </div>
        </div>

        {/* Big Profit/Cash Flow Figure */}
        <div className="relative z-10 my-3 min-w-0">
          <div
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-num tabular-nums break-words ${
              isZero
                ? 'text-slate-800 dark:text-white'
                : isNetPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isZero ? '฿0' : formatThaiCurrency(summary.netCashFlow, true)}
          </div>

        </div>

        {/* Primary Cash Flow Bar: 1.เงินเข้า - 2.ค่าใช้จ่าย = 3.เงินคงเหลือ */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-2.5 mt-2.5 border-t border-slate-200/70 dark:border-white/10 text-xs min-w-0">
          {/* Card 1: เงินเข้า */}
          <div
            onClick={() => onSelectTab('income')}
            className={`p-2 sm:p-3 rounded-2xl border cursor-pointer transition-all min-w-0 overflow-hidden group shadow-xs flex flex-col justify-between ${
              isDarkMode
                ? 'glass-inner-dark hover:border-emerald-500/50 hover:bg-slate-800/90'
                : 'glass-inner-light hover:border-emerald-400 hover:bg-emerald-50/50'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-0.5 min-w-0 gap-0.5">
                <span className="flex items-center gap-1 min-w-0">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[10px] sm:text-xs">
                    1. เงินเข้า
                  </span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </div>

              <div className="text-xs sm:text-sm md:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-num tabular-nums my-0.5 whitespace-nowrap tracking-tighter leading-tight">
                +{formatThaiCurrency(summary.totalIncome)}
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 flex flex-col xs:flex-row xs:items-center justify-between gap-1 min-w-0 pt-1 border-t border-slate-100 dark:border-white/5">
              <span className="text-[9px] sm:text-[10px] leading-tight text-slate-500 dark:text-slate-400 whitespace-nowrap">
                เงินเดือน/รายรับ
              </span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('income');
                  }}
                  className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] sm:text-[10px] shadow-xs shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-0.5 shrink-0 self-start xs:self-auto"
                >
                  <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  <span>เพิ่ม</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: รายจ่าย */}
          <div
            onClick={() => onSelectTab('expense')}
            className={`p-2 sm:p-3 rounded-2xl border cursor-pointer transition-all min-w-0 overflow-hidden group shadow-xs flex flex-col justify-between ${
              isDarkMode
                ? 'glass-inner-dark hover:border-rose-500/50 hover:bg-slate-800/90'
                : 'glass-inner-light hover:border-rose-400 hover:bg-rose-50/50'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-0.5 min-w-0 gap-0.5">
                <span className="flex items-center gap-1 min-w-0">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-rose-500/15 flex items-center justify-center shrink-0">
                    <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 shrink-0" />
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[10px] sm:text-xs">
                    2. รายจ่าย
                  </span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </div>

              <div className="text-xs sm:text-sm md:text-base font-extrabold text-rose-600 dark:text-rose-400 font-num tabular-nums my-0.5 whitespace-nowrap tracking-tighter leading-tight">
                -{formatThaiCurrency(summary.totalMajorExpenses)}
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 flex flex-col xs:flex-row xs:items-center justify-between gap-1 min-w-0 pt-1 border-t border-slate-100 dark:border-white/5">
              <span className="text-[9px] sm:text-[10px] leading-tight text-slate-500 dark:text-slate-400 whitespace-nowrap">
                จ่ายแล้ว {formatThaiCurrency(summary.paidExpenses)}
              </span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('major_expense');
                  }}
                  className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[9px] sm:text-[10px] shadow-xs shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-0.5 shrink-0 self-start xs:self-auto"
                >
                  <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  <span>เพิ่ม</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 3: คงเหลือ */}
          <div
            onClick={() => onSelectTab('all')}
            className={`p-2 sm:p-3 rounded-2xl border cursor-pointer transition-all min-w-0 overflow-hidden group shadow-xs flex flex-col justify-between ${
              isDarkMode
                ? 'glass-inner-dark hover:border-indigo-500/50 hover:bg-slate-800/90'
                : 'glass-inner-light hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mb-0.5 min-w-0 gap-0.5">
                <span className="flex items-center gap-1 min-w-0">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500 shrink-0" />
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[10px] sm:text-xs">
                    3. คงเหลือ
                  </span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </div>

              <div
                className={`text-xs sm:text-sm md:text-base font-extrabold font-num tabular-nums my-0.5 whitespace-nowrap tracking-tighter leading-tight ${
                  summary.netCashFlow > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : summary.netCashFlow < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-800 dark:text-white'
                }`}
              >
                {formatThaiCurrency(summary.netCashFlow, true)}
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 flex flex-col xs:flex-row xs:items-center justify-between gap-1 min-w-0 pt-1 border-t border-slate-100 dark:border-white/5">
              <span className="text-[9px] sm:text-[10px] leading-tight text-slate-500 dark:text-slate-400 whitespace-nowrap">
                เงินเข้า - รายจ่าย
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('all');
                }}
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] sm:text-[10px] shadow-xs shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-0.5 shrink-0 self-start xs:self-auto"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
