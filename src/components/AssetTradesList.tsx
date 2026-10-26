import React from 'react';
import {
  Car,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Trash2,
  Calendar,
  ArrowRight,
  CheckCircle,
  Tag,
  DollarSign,
} from 'lucide-react';
import { AssetTradeTransaction } from '../types/finance';
import { calculateAssetProfitLoss, formatThaiCurrency, formatThaiDate } from '../utils/financeCalculations';

interface AssetTradesListProps {
  trades: AssetTradeTransaction[];
  isDarkMode?: boolean;
  onAddNew: () => void;
  onEdit?: (trade: AssetTradeTransaction) => void;
  onDelete: (id: string) => void;
  onQuickSell: (trade: AssetTradeTransaction) => void;
}

export const AssetTradesList: React.FC<AssetTradesListProps> = ({
  trades,
  isDarkMode = false,
  onAddNew,
  onDelete,
  onQuickSell,
}) => {
  const soldTrades = trades.filter((t) => t.isSold);
  const holdingTrades = trades.filter((t) => !t.isSold);

  const totalRealizedProfit = soldTrades.reduce((acc, t) => {
    return acc + calculateAssetProfitLoss(t).profitLoss;
  }, 0);

  const totalBuyCost = trades.reduce((acc, t) => acc + t.buyPrice + (t.maintenanceCost || 0), 0);
  const totalSellRevenue = soldTrades.reduce((acc, t) => acc + (t.sellPrice || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              ซื้อมา - ขายไป (เช่น รถยนต์ & สินทรัพย์)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ติดตามกำไรจากการซื้อ-ขายรถ: ซื้อกี่บาท แต่งกี่บาท ขายไปกี่บาท ได้กำไรสุทธิกี่บาท
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกซื้อรถ/ของ</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">กำไรสุทธิที่รับรู้แล้ว</div>
          <div
            className={`text-xl font-extrabold font-num mt-1 tabular-nums ${
              totalRealizedProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatThaiCurrency(totalRealizedProfit, true)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            จากรถที่ขายสำเร็จ {soldTrades.length} คัน
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">เงินทุนซื้อรถทั้งหมด</div>
          <div className="text-xl font-extrabold font-num text-slate-800 dark:text-white mt-1 tabular-nums">
            {formatThaiCurrency(totalBuyCost)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            รวมค่าตัวรถและค่าแต่ง
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">ขายสำเร็จแล้ว</div>
          <div className="text-xl font-extrabold font-num text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {soldTrades.length} <span className="text-xs font-normal text-slate-500">คัน/ชิ้น</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            รับเงินคืน {formatThaiCurrency(totalSellRevenue)}
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <div className="text-[11px] text-amber-600 dark:text-amber-400">กำลังถือรอขาย</div>
          <div className="text-xl font-extrabold font-num text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {holdingTrades.length} <span className="text-xs font-normal text-slate-500">คัน/ชิ้น</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            รอตั้งราคาปิดการขาย
          </div>
        </div>
      </div>

      {/* List of Trades */}
      {trades.length === 0 ? (
        <div
          className={`p-10 rounded-3xl border text-center ${
            isDarkMode ? 'glass-card-dark' : 'glass-card-light'
          }`}
        >
          <Car className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            ยังไม่มีรายการซื้อมา-ขายไปในเดือนนี้
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            เริ่มต้นบันทึกการซื้อรถยนต์มือสอง หรือสินทรัพย์ เพื่อติดตามราคาซื้อ ค่าแต่งซ่อม และกำไร
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายการแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => {
            const { cost, revenue, profitLoss, profitPercentage } = calculateAssetProfitLoss(trade);
            const isProfit = profitLoss >= 0;

            return (
              <div
                key={trade.id}
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
                        trade.isSold
                          ? isProfit
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-800 dark:text-white leading-snug">
                          {trade.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">· {trade.assetCategory === 'car' ? 'รถยนต์' : 'สินทรัพย์'}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" /> ซื้อเมื่อ {formatThaiDate(trade.buyDate)}
                        </span>
                        {trade.isSold && trade.sellDate && (
                          <span className="text-[11px]">· ขายเมื่อ {formatThaiDate(trade.sellDate)}</span>
                        )}
                        {trade.note && <span className="text-[11px] text-slate-400">({trade.note})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                    {trade.isSold ? (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border flex items-center gap-1.5 ${
                          isProfit
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                        }`}
                      >
                        {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span className="font-num">กำไร {formatThaiCurrency(profitLoss, true)} ({profitPercentage > 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onQuickSell(trade)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>บันทึกขายแล้ว</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(trade.id)}
                      aria-label={`ลบรายการ ${trade.title}`}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mathematical Flow Progression: ซื้อมา -> ค่าแต่ง -> ขายได้ = กำไรสุทธิ */}
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDarkMode ? 'glass-inner-dark' : 'glass-inner-light'
                  }`}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">1. ราคาซื้อรถเข้า</div>
                      <div className="text-sm font-bold font-num text-slate-800 dark:text-white mt-0.5">
                        {formatThaiCurrency(trade.buyPrice)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">2. ค่าแต่ง / ซ่อมแซม</div>
                      <div className="text-sm font-bold font-num text-slate-800 dark:text-white mt-0.5">
                        {formatThaiCurrency(trade.maintenanceCost || 0)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">3. ราคาขายได้</div>
                      <div className="text-sm font-bold font-num text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {trade.isSold && trade.sellPrice ? formatThaiCurrency(trade.sellPrice) : 'ยังไม่ขาย'}
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200/70 dark:border-white/10 pt-2 sm:pt-0 sm:pl-3">
                      <div className="text-[10px] text-slate-400 font-medium">4. กำไรสุทธิ</div>
                      <div
                        className={`text-base font-extrabold font-num tabular-nums mt-0.5 ${
                          trade.isSold
                            ? isProfit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {trade.isSold ? formatThaiCurrency(profitLoss, true) : 'รอขาย'}
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
