import React, { useState } from 'react';
import { X, Car, LineChart } from 'lucide-react';
import { AssetTradeTransaction, InvestmentTransaction } from '../types/finance';
import { formatThaiCurrency } from '../utils/financeCalculations';

interface QuickSellModalProps {
  trade: AssetTradeTransaction | null;
  onClose: () => void;
  onConfirm: (tradeId: string, sellPrice: number, sellDate: string) => void;
}

export const QuickSellModal: React.FC<QuickSellModalProps> = ({
  trade,
  onClose,
  onConfirm,
}) => {
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);

  if (!trade) return null;

  const cost = trade.buyPrice + (trade.maintenanceCost || 0);
  const parsedSell = parseFloat(sellPrice) || 0;
  const profitLoss = parsedSell > 0 ? parsedSell - cost : 0;
  const profitPct = cost > 0 && parsedSell > 0 ? (profitLoss / cost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSell <= 0) return;
    onConfirm(trade.id, parsedSell, sellDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 text-xs text-slate-800 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-600">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold">บันทึกราคาที่ขายได้</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-3 space-y-1">
          <div className="font-bold text-slate-800 dark:text-white text-sm">{trade.title}</div>
          <div className="text-slate-500">
            ต้นทุนซื้อ + ซ่อม: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatThaiCurrency(cost)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              ขายไปได้กี่บาท (บาท) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="เช่น 410000"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-emerald-300 dark:border-emerald-500 rounded-2xl text-emerald-700 dark:text-emerald-300 text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">วันที่ปิดการขาย</label>
            <input
              type="date"
              value={sellDate}
              onChange={(e) => setSellDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl"
            />
          </div>

          {parsedSell > 0 && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                profitLoss >= 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="font-semibold">ผลกำไรสุทธิ:</span>
              <span className="font-bold text-sm">
                {profitLoss >= 0 ? 'กำไร' : 'ขาดทุน'} {formatThaiCurrency(profitLoss, true)} ({profitPct.toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md shadow-emerald-600/20"
            >
              ยืนยันการขาย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface QuickUpdateValuationModalProps {
  investment: InvestmentTransaction | null;
  onClose: () => void;
  onConfirm: (investmentId: string, currentValuation: number, dividendReceived?: number) => void;
}

export const QuickUpdateValuationModal: React.FC<QuickUpdateValuationModalProps> = ({
  investment,
  onClose,
  onConfirm,
}) => {
  const [valuation, setValuation] = useState('');
  const [dividend, setDividend] = useState('');

  if (!investment) return null;

  const cost = investment.investedAmount;
  const parsedValuation = parseFloat(valuation) || 0;
  const parsedDividend = parseFloat(dividend) || 0;
  const profitLoss = parsedValuation > 0 ? parsedValuation + parsedDividend - cost : 0;
  const profitPct = cost > 0 && parsedValuation > 0 ? (profitLoss / cost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedValuation <= 0) return;
    onConfirm(investment.id, parsedValuation, parsedDividend > 0 ? parsedDividend : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 text-xs text-slate-800 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-teal-100 text-teal-600">
              <LineChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold">อัพเดทราคาพอร์ตล่าสุด</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-3 space-y-1">
          <div className="font-bold text-slate-800 dark:text-white text-sm">{investment.title}</div>
          <div className="text-slate-500">
            เงินที่ลงทุนไป: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatThaiCurrency(cost)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              มูลค่าพอร์ตตอนนี้ (บาท) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={valuation}
              onChange={(e) => setValuation(e.target.value)}
              placeholder={`เช่น ${investment.currentValuation || cost}`}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-teal-300 dark:border-teal-500 rounded-2xl text-teal-700 dark:text-teal-300 text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">เงินปันผลที่ได้รับสะสม (ถ้ามี)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              placeholder="เช่น 500"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl"
            />
          </div>

          {parsedValuation > 0 && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                profitLoss >= 0
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="font-semibold">ผลตอบแทน:</span>
              <span className="font-bold text-sm">
                {profitLoss >= 0 ? 'กำไร' : 'ขาดทุน'} {formatThaiCurrency(profitLoss, true)} ({profitPct.toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-md shadow-teal-600/20"
            >
              บันทึกมูลค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
