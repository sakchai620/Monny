import React from 'react';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { InvestmentTransaction } from '../types/finance';
import { calculateInvestmentProfitLoss, formatThaiCurrency, formatThaiDate } from '../utils/financeCalculations';

interface InvestmentsListProps {
  investments: InvestmentTransaction[];
  isDarkMode?: boolean;
  onAddNew: () => void;
  onEdit?: (investment: InvestmentTransaction) => void;
  onDelete: (id: string) => void;
  onUpdateValuation: (investment: InvestmentTransaction) => void;
}

export const InvestmentsList: React.FC<InvestmentsListProps> = ({
  investments,
  isDarkMode = false,
  onAddNew,
  onDelete,
  onUpdateValuation,
}) => {
  const totalCost = investments.reduce((acc, i) => acc + i.investedAmount, 0);
  const totalValuation = investments.reduce((acc, i) => acc + i.currentValuation, 0);
  const totalDividend = investments.reduce((acc, i) => acc + (i.dividendReceived || 0), 0);
  const totalCurrentValue = totalValuation + totalDividend;
  const totalProfitLoss = totalCurrentValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.7)]" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              พอร์ตการลงทุน (หุ้น, กองทุน & คริปโต)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            บันทึกเงินลงทุนในเดือนนี้ มูลค่าพอร์ตปัจจุบัน เงินปันผล และกำไรขาดทุน
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกเงินลงทุน</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">เงินที่ลงทุนไปเดือนนี้</div>
          <div className="text-xl font-extrabold font-num text-slate-800 dark:text-white mt-1 tabular-nums">
            {formatThaiCurrency(totalCost)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ทั้งหมด {investments.length} พอร์ต
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">มูลค่าพอร์ตปัจจุบัน</div>
          <div className="text-xl font-extrabold font-num text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
            {formatThaiCurrency(totalValuation)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ยังไม่รวมปันผล
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">เงินปันผลที่ได้รับ</div>
          <div className="text-xl font-extrabold font-num text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatThaiCurrency(totalDividend)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            เงินสดเข้าบัญชี
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">ผลตอบแทนสุทธิรวม</div>
          <div
            className={`text-xl font-extrabold font-num mt-1 tabular-nums ${
              totalProfitLoss >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatThaiCurrency(totalProfitLoss, true)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-num">
            {totalProfitPercent >= 0 ? `+${totalProfitPercent.toFixed(1)}%` : `${totalProfitPercent.toFixed(1)}%`} ROI
          </div>
        </div>
      </div>

      {/* List of Investments */}
      {investments.length === 0 ? (
        <div
          className={`p-10 rounded-3xl border text-center ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <LineChart className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            ยังไม่มีรายการลงทุนในเดือนนี้
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            บันทึกเงินซื้อหุ้น กองทุน หรือคริปโต เพื่อดูผลตอบแทนและปันผลอย่างโปร่งใส
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-600 text-white text-xs font-semibold shadow-md shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกการลงทุนแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const { profitLoss, profitPercentage } = calculateInvestmentProfitLoss(inv);
            const isProfit = profitLoss >= 0;

            return (
              <div
                key={inv.id}
                className={`rounded-3xl p-5 border transition-all ${
                  isDarkMode
                    ? 'glass-card-dark'
                    : 'glass-card-light glass-card-light-hover'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        isProfit
                          ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <LineChart className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-800 dark:text-white leading-snug">
                          {inv.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">· {inv.investmentCategory}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" /> ลงทุนเมื่อ {formatThaiDate(inv.date)}
                        </span>
                        {inv.note && <span className="text-[11px] text-slate-400">({inv.note})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                    <button
                      onClick={() => onUpdateValuation(inv)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>อัปเดตราคา</span>
                    </button>

                    <button
                      onClick={() => onDelete(inv.id)}
                      aria-label={`ลบรายการ ${inv.title}`}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mathematical Flow Progression: ลงทุนไป -> มูลค่าปัจจุบัน + ปันผล = ผลตอบแทน */}
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDarkMode ? 'glass-inner-dark' : 'glass-inner-light'
                  }`}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">1. เงินต้นที่ลงทุน</div>
                      <div className="text-sm font-bold font-num text-slate-800 dark:text-white mt-0.5">
                        {formatThaiCurrency(inv.investedAmount)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">2. มูลค่าพอร์ตล่าสุด</div>
                      <div className="text-sm font-bold font-num text-slate-800 dark:text-white mt-0.5">
                        {formatThaiCurrency(inv.currentValuation)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">3. ปันผลที่ได้</div>
                      <div className="text-sm font-bold font-num text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatThaiCurrency(inv.dividendReceived || 0)}
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200/70 dark:border-white/10 pt-2 sm:pt-0 sm:pl-3">
                      <div className="text-[10px] text-slate-400 font-medium">4. กำไร/ผลตอบแทน</div>
                      <div
                        className={`text-base font-extrabold font-num tabular-nums mt-0.5 ${
                          isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatThaiCurrency(profitLoss, true)}{' '}
                        <span className="text-xs font-semibold">
                          ({profitPercentage >= 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
