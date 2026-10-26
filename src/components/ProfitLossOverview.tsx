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
        className={`rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden ${
          isDarkMode
            ? 'glass-card-dark text-white'
            : 'glass-card-light text-slate-800'
        }`}
      >
        {/* Shimmering Accent Light */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-40 bg-gradient-to-br from-pink-400 to-rose-400 animate-shimmer"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              สรุปเงินคงเหลือสุทธิเดือนนี้
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border shrink-0 ${statusBadge.badgeClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">{statusBadge.text}</span>
          </div>
        </div>

        {/* Big Profit/Cash Flow Figure */}
        <div className="relative z-10 my-3">
          <div
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-num tabular-nums ${
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span>คำนวณจาก:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              เงินเข้า ({formatThaiCurrency(summary.totalIncome)})
            </span>
            <span>-</span>
            <span className="font-semibold text-rose-500">
              รายจ่าย ({formatThaiCurrency(summary.totalMajorExpenses)})
            </span>
            <span>=</span>
            <span className="font-bold text-slate-800 dark:text-white">
              เงินคงเหลือสุทธิ
            </span>
          </p>
        </div>

        {/* Primary Cash Flow Bar: 1.เงินเข้า - 2.ค่าใช้จ่าย = 3.เงินคงเหลือ */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-200/70 dark:border-white/10 text-xs">
          {/* Card 1: เงินเข้าเดือนนี้ */}
          <div
            onClick={() => onSelectTab('income')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              isDarkMode
                ? 'glass-inner-dark hover:border-emerald-500/40'
                : 'glass-inner-light hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">1. เงินเข้าเดือนนี้</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-num tabular-nums">
              +{formatThaiCurrency(summary.totalIncome)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>เงินเดือน/รายรับที่เพิ่ม</span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('income');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + เพิ่ม
                </button>
              )}
            </div>
          </div>

          {/* Card 2: ค่าใช้จ่าย */}
          <div
            onClick={() => onSelectTab('expense')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              isDarkMode
                ? 'glass-inner-dark hover:border-rose-500/40'
                : 'glass-inner-light hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">2. รายจ่ายทั้งหมด</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-num tabular-nums">
              -{formatThaiCurrency(summary.totalMajorExpenses)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>จ่ายแล้ว {formatThaiCurrency(summary.paidExpenses)}</span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('major_expense');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                >
                  + เพิ่ม
                </button>
              )}
            </div>
          </div>

          {/* Card 3: เงินคงเหลือสุทธิ */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDarkMode ? 'glass-inner-dark' : 'glass-inner-light'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">3. เงินคงเหลือสุทธิ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">เงินเข้า - รายจ่าย</span>
            </div>
            <div
              className={`text-base font-extrabold font-num tabular-nums ${
                summary.netCashFlow > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : summary.netCashFlow < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-800 dark:text-white'
              }`}
            >
              {formatThaiCurrency(summary.netCashFlow, true)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {summary.netCashFlow > 0
                ? 'ยอดเงินเหลือใช้จ่าย/เก็บออม'
                : summary.netCashFlow < 0
                ? 'รายจ่ายเกินเงินที่ได้รับ'
                : 'ยอดเงินเข้าเท่ากับรายจ่ายพอดี'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
