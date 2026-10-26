import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  Car,
  LineChart,
  CreditCard,
  ShieldCheck,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MonthlyFinancialSummary, Transaction, AssetTradeTransaction, InvestmentTransaction, MajorExpenseTransaction } from '../types/finance';
import { formatThaiCurrency, formatThaiMonth } from '../utils/financeCalculations';

interface ShareableFinancialCardProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlyFinancialSummary;
  transactions: Transaction[];
  isDarkMode?: boolean;
}

export const ShareableFinancialCard: React.FC<ShareableFinancialCardProps> = ({
  isOpen,
  onClose,
  summary,
  transactions,
  isDarkMode = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const monthTrades = transactions.filter(
    (t): t is AssetTradeTransaction => t.type === 'asset_trade' && t.date.startsWith(summary.monthKey)
  );
  const monthInvestments = transactions.filter(
    (t): t is InvestmentTransaction => t.type === 'investment' && t.date.startsWith(summary.monthKey)
  );
  const monthMajorExpenses = transactions.filter(
    (t): t is MajorExpenseTransaction => t.type === 'major_expense' && t.date.startsWith(summary.monthKey)
  );

  const isNetProfit = summary.overallProfitLoss >= 0;

  // Prepare text for LINE / Messenger copy
  const shareText = `📊 สรุปการเงินประจำเดือน: ${formatThaiMonth(summary.monthKey)}
--------------------------------
✨ ผลกำไร/เงินเหลือสุทธิ: ${formatThaiCurrency(summary.overallProfitLoss, true)}
• เงินเหลือเก็บ (รับ - จ่าย): ${formatThaiCurrency(summary.netCashFlow, true)}
• กำไรซื้อขายรถ/ของ: ${formatThaiCurrency(summary.assetRealizedProfitLoss, true)}
• กำไรพอร์ตลงทุน: ${formatThaiCurrency(summary.investmentProfitLoss, true)}

🚗 ซื้อมา - ขายไป (${monthTrades.length} รายการ):
${monthTrades.map(t => `  - ${t.title}: ซื้อ ${formatThaiCurrency(t.buyPrice)} ➔ ${t.isSold ? `ขาย ${formatThaiCurrency(t.sellPrice || 0)} (กำไร ${formatThaiCurrency((t.sellPrice || 0) - (t.buyPrice + (t.maintenanceCost || 0)), true)})` : 'รอขาย'}`).join('\n')}

📈 การลงทุน (${monthInvestments.length} พอร์ต):
${monthInvestments.map(i => `  - ${i.title}: ลงทุน ${formatThaiCurrency(i.investedAmount)} ➔ มูลค่า ${formatThaiCurrency(i.currentValuation)} (กำไร ${formatThaiCurrency(i.currentValuation - i.investedAmount, true)})`).join('\n')}

💳 ค่าใช้จ่ายหลักประจำเดือน: ${formatThaiCurrency(summary.totalMajorExpenses)}
  - ชำระแล้ว: ${formatThaiCurrency(summary.paidExpenses)}
  - รอชำระ: ${formatThaiCurrency(summary.unpaidExpenses)}
--------------------------------
บันทึกผ่านแอพ "ค่าใช้จ่ายภายในเดือนนี้"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">บัตรสรุปสถานะการเงินประจำเดือน</h3>
              <p className="text-[11px] text-slate-500">พร้อมแชร์หรือส่งรายงานทางไลน์ได้ทันที</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/05 to-sky-500/10 border border-emerald-300 dark:border-emerald-500/30 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                รายงานการเงินประจำเดือน
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                {formatThaiMonth(summary.monthKey)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500">กำไร / เงินเหลือสุทธิรวม:</span>
              <div
                className={`text-3xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] mt-0.5 ${
                  isNetProfit ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatThaiCurrency(summary.overallProfitLoss, true)}
              </div>
            </div>

            {/* 3 mini stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 dark:border-white/10 text-[11px]">
              <div>
                <span className="text-slate-500 block">เงินเหลือเก็บ</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatThaiCurrency(summary.netCashFlow, true)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">กำไรขายรถ/ของ</span>
                <span className="font-bold text-emerald-600">
                  {formatThaiCurrency(summary.assetRealizedProfitLoss, true)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">กำไรหุ้น</span>
                <span className="font-bold text-teal-600">
                  {formatThaiCurrency(summary.investmentProfitLoss, true)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick list overview */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-indigo-600" />
              <span>การซื้อมา-ขายไป: {monthTrades.length} รายการ</span>
            </div>
            {monthTrades.map(t => (
              <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 flex justify-between">
                <span>{t.title}</span>
                <span className="font-bold text-emerald-600">
                  {t.isSold ? `+${formatThaiCurrency((t.sellPrice || 0) - (t.buyPrice + (t.maintenanceCost || 0)))}` : 'รอขาย'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LineChart className="w-3.5 h-3.5 text-teal-600" />
              <span>พอร์ตการลงทุน: {monthInvestments.length} รายการ</span>
            </div>
            {monthInvestments.map(i => (
              <div key={i.id} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 flex justify-between">
                <span>{i.title}</span>
                <span className="font-bold text-teal-600">
                  +{formatThaiCurrency(i.currentValuation - i.investedAmount)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex justify-between text-xs">
            <span className="text-slate-500">ค่าใช้จ่ายหลักประจำเดือน:</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {formatThaiCurrency(summary.totalMajorExpenses)} (จ่ายแล้ว {formatThaiCurrency(summary.paidExpenses)})
            </span>
          </div>
        </div>

        {/* Footer with Copy button */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 font-semibold"
          >
            ปิด
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>คัดลอกข้อความสรุปแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกข้อความสรุปส่ง LINE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
