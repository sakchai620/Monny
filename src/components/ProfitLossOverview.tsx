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
        className={`rounded-3xl p-5 sm:p-6 border-2 transition-all relative overflow-hidden shadow-xl backdrop-blur-xl ${
          isDarkMode
            ? 'bg-slate-900/95 border-pink-500/30 text-white glass-card-dark'
            : 'bg-white/95 border-pink-300/70 text-slate-800 glass-card-light'
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

          {/* Explicit Calculation Explanation */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 leading-relaxed">
            <span className="whitespace-nowrap">คำนวณจาก:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              เงินเข้า ({formatThaiCurrency(summary.totalIncome)})
            </span>
            <span>-</span>
            <span className="font-semibold text-rose-500 whitespace-nowrap">
              รายจ่าย ({formatThaiCurrency(summary.totalMajorExpenses)})
            </span>
            <span>=</span>
            <span className="font-bold text-slate-800 dark:text-white whitespace-nowrap">
              เงินคงเหลือสุทธิ
            </span>
          </p>
        </div>

        {/* Primary Cash Flow Bar: 1.เงินเข้า - 2.ค่าใช้จ่าย = 3.เงินคงเหลือ */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-3 pt-3.5 mt-3 border-t border-slate-200/70 dark:border-white/10 text-xs min-w-0">
          {/* Card 1: เงินเข้า */}
          <div
            onClick={() => onSelectTab('income')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 overflow-hidden ${
              isDarkMode
                ? 'glass-inner-dark hover:border-emerald-500/40'
                : 'glass-inner-light hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] mb-1 min-w-0 gap-0.5">
              <span className="flex items-center gap-1 min-w-0">
                <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">1. เงินเข้า</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 hidden xs:block" />
            </div>
            <div className="text-sm sm:text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-num tabular-nums truncate">
              +{formatThaiCurrency(summary.totalIncome)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 flex items-center justify-between gap-0.5 min-w-0">
              <span className="truncate">เงินเดือน/รายรับ</span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('income');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0 whitespace-nowrap ml-0.5"
                >
                  + เพิ่ม
                </button>
              )}
            </div>
          </div>

          {/* Card 2: รายจ่าย */}
          <div
            onClick={() => onSelectTab('expense')}
            className={`p-2.5 sm:p-3.5 rounded-2xl border cursor-pointer transition-all min-w-0 overflow-hidden ${
              isDarkMode
                ? 'glass-inner-dark hover:border-rose-500/40'
                : 'glass-inner-light hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] mb-1 min-w-0 gap-0.5">
              <span className="flex items-center gap-1 min-w-0">
                <CreditCard className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">2. รายจ่าย</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 hidden xs:block" />
            </div>
            <div className="text-sm sm:text-lg md:text-xl font-extrabold text-rose-600 dark:text-rose-400 font-num tabular-nums truncate">
              -{formatThaiCurrency(summary.totalMajorExpenses)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 flex items-center justify-between gap-0.5 min-w-0">
              <span className="truncate">จ่ายแล้ว {formatThaiCurrency(summary.paidExpenses)}</span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('major_expense');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline shrink-0 whitespace-nowrap ml-0.5"
                >
                  + เพิ่ม
                </button>
              )}
            </div>
          </div>

          {/* Card 3: คงเหลือ */}
          <div
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all min-w-0 overflow-hidden ${
              isDarkMode ? 'glass-inner-dark' : 'glass-inner-light'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] mb-1 min-w-0 gap-0.5">
              <span className="flex items-center gap-1 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">3. คงเหลือ</span>
              </span>
            </div>
            <div
              className={`text-sm sm:text-lg md:text-xl font-extrabold font-num tabular-nums truncate ${
                summary.netCashFlow > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : summary.netCashFlow < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-800 dark:text-white'
              }`}
            >
              {formatThaiCurrency(summary.netCashFlow, true)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-1 truncate">
              เงินเข้า - รายจ่าย
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
