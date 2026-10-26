import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Sliders } from 'lucide-react';
import { BudgetStatus } from '../types/finance';
import { formatThaiCurrency } from '../utils/financeCalculations';

interface BudgetBannerProps {
  status: BudgetStatus;
  isDarkMode?: boolean;
  onOpenSettings: () => void;
  onTestAlert?: () => void;
}

export const BudgetBanner: React.FC<BudgetBannerProps> = ({
  status,
  isDarkMode = false,
  onOpenSettings,
  onTestAlert,
}) => {
  const { budgetAmount, spentAmount, remainingAmount, percentUsed, isCaution, isExceeded, overAmount } =
    status;

  const cappedPercent = Math.min(100, Math.max(0, percentUsed));

  // Determine status color & meta
  let statusBadge = {
    text: budgetAmount === 0 ? 'ยังไม่ได้กำหนดวงเงิน' : 'การใช้จ่ายอยู่ในเกณฑ์งบ',
    dot: budgetAmount === 0 ? 'bg-slate-400' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    badgeClass: budgetAmount === 0
      ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    barGradient: 'from-emerald-500 to-teal-400',
    Icon: CheckCircle2,
  };

  if (isExceeded) {
    statusBadge = {
      text: 'เกินงบประมาณที่กำหนดแล้ว',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      barGradient: 'from-rose-500 to-red-600',
      Icon: AlertOctagon,
    };
  } else if (isCaution) {
    statusBadge = {
      text: 'แตะเกณฑ์เฝ้าระวัง (เกิน 80%)',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      barGradient: 'from-amber-400 to-amber-500',
      Icon: AlertTriangle,
    };
  }

  // Dedicated high-end mobile card when budget is not yet set
  if (budgetAmount === 0) {
    return (
      <div
        className={`rounded-3xl p-4 sm:p-5 border transition-all ${
          isDarkMode
            ? 'glass-card-dark text-white'
            : 'glass-card-light text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  งบค่าใช้จ่ายหลัก
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {spentAmount > 0 ? `จ่ายแล้ว ${formatThaiCurrency(spentAmount)}` : 'ยังไม่ได้ตั้งงบ'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ตั้งงบประมาณ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isDarkMode
          ? 'glass-card-dark text-white'
          : 'glass-card-light text-slate-800'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            งบค่าใช้จ่ายหลักประจำเดือน
          </span>
        </div>

        {/* Quick action tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSettings}
            title="ปรับวงเงินงบประมาณ"
            aria-label="ตั้งค่างบประมาณ"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                : 'bg-white border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ปรับงบ</span>
          </button>
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-num tabular-nums flex items-baseline gap-2 flex-wrap">
            <span className={isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}>
              {formatThaiCurrency(spentAmount)}
            </span>
            <span className="text-xs sm:text-sm font-normal text-slate-400 font-num">
              / งบ {formatThaiCurrency(budgetAmount)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${statusBadge.badgeClass}`}>
              {statusBadge.text}
            </span>
            <span className="text-xs text-slate-400 font-num">
              ({percentUsed.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/50 dark:border-white/5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isExceeded ? 'ยอดเกินงบ' : 'คงเหลือใช้ได้อีก'}
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-num tabular-nums ${
              isExceeded
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isExceeded ? `+${formatThaiCurrency(overAmount)}` : formatThaiCurrency(remainingAmount)}
          </div>
        </div>
      </div>

      {/* Sleek Dual-Tone Progress Track */}
      <div className="space-y-1.5">
        <div
          className={`h-2.5 w-full rounded-full overflow-hidden p-[2px] border relative ${
            isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          {/* 80% Caution Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-slate-400/50 dark:bg-white/20 z-10 pointer-events-none"
            style={{ left: '80%' }}
            title="ขีดเตือนระวัง 80%"
          />
          <div
            className={`h-full rounded-full bg-gradient-to-r ${statusBadge.barGradient} transition-all duration-500 ease-out`}
            style={{ width: `${cappedPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-num">
          <span>0 ฿</span>
          <span className="text-slate-400">จุดเตือนระวัง (80%)</span>
          <span>{formatThaiCurrency(budgetAmount)}</span>
        </div>
      </div>

      {/* Gentle Warning Banner if cautioned or exceeded */}
      {isExceeded && (
        <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>เตือนด่วน:</strong> คุณมีค่าใช้จ่ายหลักเกินงบที่ตั้งไว้ไปแล้ว{' '}
            <span className="font-bold underline">{formatThaiCurrency(overAmount)}</span>{' '}
            แนะนำให้ชะลอค่าใช้จ่ายที่ไม่จำเป็น หรือปรับงบประมาณ
          </div>
        </div>
      )}

      {isCaution && !isExceeded && (
        <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>เตือนระวัง:</strong> ยอดค่าใช้จ่ายหลักแตะ {percentUsed.toFixed(1)}% ของงบแล้ว เหลือเงินสำหรับบิลอื่นอีก{' '}
            <span className="font-bold">{formatThaiCurrency(remainingAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
